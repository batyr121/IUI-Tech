/*
 * IUI NeuroBand firmware v1.2.0
 * ESP32 + BioAmp EXG Pill
 * Transport: Bluetooth Low Energy (primary) + USB Serial (fallback)
 *
 * Wiring:
 *   BioAmp VCC -> ESP32 3V3
 *   BioAmp GND -> ESP32 GND
 *   BioAmp OUT -> ESP32 GPIO34
 *
 * Educational biosignal indicators only. Not a medical device.
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <esp_system.h>
#include <math.h>

static const char *FIRMWARE_VERSION = "1.2.0";
static const char *DEVICE_NAME = "IUI NeuroBand";
static const char *SENSOR_MODEL = "BioAmp EXG Pill";

// Must match src/api.ts.
static const char *SERVICE_UUID = "7c8b1000-6f35-4f75-9c41-5f7e1c9a1000";
static const char *TX_UUID      = "7c8b1001-6f35-4f75-9c41-5f7e1c9a1000"; // ESP32 -> browser
static const char *RX_UUID      = "7c8b1002-6f35-4f75-9c41-5f7e1c9a1000"; // browser -> ESP32

static constexpr uint8_t BIOAMP_PIN = 34;
static constexpr uint16_t SAMPLE_RATE = 250;
static constexpr uint32_t SAMPLE_PERIOD_US = 1000000UL / SAMPLE_RATE;
static constexpr uint16_t TELEMETRY_RATE = 10;
static constexpr uint16_t TELEMETRY_DIVIDER = SAMPLE_RATE / TELEMETRY_RATE;
static constexpr uint32_t SERIAL_BAUD = 115200;
static constexpr int ADC_MIN_SAFE = 80;
static constexpr int ADC_MAX_SAFE = 4015;

bool streaming = false;
bool calibrated = false;
bool bleConnected = false;
uint32_t nextSampleUs = 0;
uint16_t telemetryCounter = 0;
float dcBaseline = 2048.0f;
float noiseFloor = 8.0f;
float latestRaw = 2048.0f;
float latestFiltered = 0.0f;
float previousInput = 2048.0f;
float highPassState = 0.0f;
float lowPassState = 0.0f;
float signalEnergy = 0.0f;
float slowEnergy = 0.0f;
float fastEnergy = 0.0f;
float blinkEnvelope = 0.0f;
uint16_t blinkCountWindow = 0;
uint32_t lastBlinkMs = 0;
String serialLine;

BLEServer *bleServer = nullptr;
BLECharacteristic *txCharacteristic = nullptr;
QueueHandle_t commandQueue;

float clampValue(float value, float minimum, float maximum) {
  if (value < minimum) return minimum;
  if (value > maximum) return maximum;
  return value;
}

String chipId() {
  uint64_t mac = ESP.getEfuseMac();
  char id[25];
  snprintf(id, sizeof(id), "IUI-ESP32-%04X%08X", (uint16_t)(mac >> 32), (uint32_t)mac);
  return String(id);
}

// Every packet is also printed to USB, making diagnostics and fallback identical.
void sendPacket(const String &packet) {
  Serial.println(packet);
  if (bleConnected && txCharacteristic != nullptr) {
    String framed = packet + "\n";
    txCharacteristic->setValue((uint8_t *)framed.c_str(), framed.length());
    txCharacteristic->notify();
  }
}

void sendHello() {
  String packet = "{\"type\":\"hello\",\"deviceId\":\"" + chipId() +
    "\",\"name\":\"" + DEVICE_NAME + "\",\"firmware\":\"" + FIRMWARE_VERSION +
    "\",\"sensor\":\"" + SENSOR_MODEL + "\",\"sampleRate\":" + String(SAMPLE_RATE) +
    ",\"adcPin\":" + String(BIOAMP_PIN) + ",\"transport\":\"ble\"}";
  sendPacket(packet);
}

void sendStatus(const char *status) {
  sendPacket("{\"type\":\"status\",\"status\":\"" + String(status) +
             "\",\"deviceId\":\"" + chipId() + "\"}");
}

void calibrateSensor() {
  streaming = false;
  sendStatus("calibrating");
  const uint16_t count = 750;
  double sum = 0.0;
  double sumSquares = 0.0;
  for (uint16_t i = 0; i < count; i++) {
    int value = analogRead(BIOAMP_PIN);
    sum += value;
    sumSquares += (double)value * value;
    delayMicroseconds(SAMPLE_PERIOD_US);
  }
  dcBaseline = sum / count;
  double variance = (sumSquares / count) - (dcBaseline * dcBaseline);
  noiseFloor = max(3.0f, (float)sqrt(max(0.0, variance)));
  previousInput = dcBaseline;
  highPassState = 0.0f;
  lowPassState = 0.0f;
  calibrated = true;
  sendStatus("calibrated");
}

float filterSample(float input) {
  constexpr float hpAlpha = 0.9876f;
  highPassState = hpAlpha * (highPassState + input - previousInput);
  previousInput = input;
  constexpr float lpAlpha = 0.5013f;
  lowPassState += lpAlpha * (highPassState - lowPassState);
  return lowPassState;
}

void updateMetrics(float current, float previous) {
  float absoluteSignal = fabsf(current);
  signalEnergy = 0.97f * signalEnergy + 0.03f * absoluteSignal;
  slowEnergy = 0.992f * slowEnergy + 0.008f * absoluteSignal;
  fastEnergy = 0.94f * fastEnergy + 0.06f * fabsf(current - previous);
  blinkEnvelope = 0.90f * blinkEnvelope + 0.10f * absoluteSignal;
  float blinkThreshold = max(noiseFloor * 9.0f, 110.0f);
  uint32_t now = millis();
  if (blinkEnvelope > blinkThreshold && now - lastBlinkMs > 280) {
    blinkCountWindow++;
    lastBlinkMs = now;
  }
}

void sendTelemetry() {
  float clippingPenalty = (latestRaw < ADC_MIN_SAFE || latestRaw > ADC_MAX_SAFE) ? 75.0f : 0.0f;
  float noisePenalty = clampValue((signalEnergy - noiseFloor * 5.0f) * 0.22f, 0.0f, 45.0f);
  float signalQuality = clampValue(100.0f - clippingPenalty - noisePenalty, 0.0f, 100.0f);
  float ratio = fastEnergy / max(1.0f, slowEnergy);
  float attention = clampValue(48.0f + ratio * 22.0f, 0.0f, 100.0f);
  float meditation = clampValue(78.0f - ratio * 18.0f, 0.0f, 100.0f);
  float focus = clampValue(attention * 0.72f + signalQuality * 0.28f, 0.0f, 100.0f);
  float engagement = clampValue(attention * 0.62f + focus * 0.38f, 0.0f, 100.0f);
  float relaxation = clampValue(meditation * 0.80f + (100.0f - attention) * 0.20f, 0.0f, 100.0f);

  // Compact JSON keeps BLE notifications small while retaining the website contract.
  String packet;
  packet.reserve(190);
  packet = "{\"raw\":" + String((int)latestRaw) +
    ",\"attention\":" + String(attention, 1) +
    ",\"meditation\":" + String(meditation, 1) +
    ",\"engagement\":" + String(engagement, 1) +
    ",\"focus\":" + String(focus, 1) +
    ",\"relaxation\":" + String(relaxation, 1) +
    ",\"blink\":" + String(blinkCountWindow) +
    ",\"signal\":" + String(signalQuality, 1) + "}";
  sendPacket(packet);
  blinkCountWindow = 0;
}

void handleCommand(String command) {
  command.trim();
  command.toUpperCase();
  if (command == "INFO" || command == "HELLO") sendHello();
  else if (command == "START") { streaming = true; nextSampleUs = micros(); sendStatus("streaming"); }
  else if (command == "STOP") { streaming = false; sendStatus("stopped"); }
  else if (command == "CALIBRATE") calibrateSensor();
  else if (command == "PING") sendStatus("pong");
}

class IuiServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *) override { bleConnected = true; }
  void onDisconnect(BLEServer *server) override {
    bleConnected = false;
    streaming = false;
    delay(120);
    server->getAdvertising()->start();
  }
};

class IuiRxCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) override {
    String value = characteristic->getValue();
    if (value.isEmpty()) return;
    char command[81] = {0};
    size_t count = min(value.length(), sizeof(command) - 1);
    memcpy(command, value.c_str(), count);
    xQueueSend(commandQueue, command, 0);
  }
};

void setupBluetooth() {
  BLEDevice::init(DEVICE_NAME);
  BLEDevice::setMTU(247);
  bleServer = BLEDevice::createServer();
  bleServer->setCallbacks(new IuiServerCallbacks());
  BLEService *service = bleServer->createService(SERVICE_UUID);
  txCharacteristic = service->createCharacteristic(TX_UUID, BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_READ);
  txCharacteristic->addDescriptor(new BLE2902());
  BLECharacteristic *rx = service->createCharacteristic(RX_UUID, BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
  rx->setCallbacks(new IuiRxCallbacks());
  service->start();
  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  advertising->setMinPreferred(0x06);
  advertising->start();
}

void readCommands() {
  while (Serial.available()) {
    char character = (char)Serial.read();
    if (character == '\n') { handleCommand(serialLine); serialLine = ""; }
    else if (character != '\r' && serialLine.length() < 80) serialLine += character;
  }
  char queued[81];
  while (xQueueReceive(commandQueue, queued, 0) == pdTRUE) handleCommand(String(queued));
}

void setup() {
  Serial.begin(SERIAL_BAUD);
  delay(350);
  analogReadResolution(12);
  analogSetPinAttenuation(BIOAMP_PIN, ADC_11db);
  pinMode(BIOAMP_PIN, INPUT);
  commandQueue = xQueueCreate(6, 81);
  setupBluetooth();
  sendHello();
  nextSampleUs = micros();
}

void loop() {
  readCommands();
  if (!streaming) { delay(2); return; }
  uint32_t now = micros();
  if ((int32_t)(now - nextSampleUs) < 0) return;
  nextSampleUs += SAMPLE_PERIOD_US;
  latestRaw = analogRead(BIOAMP_PIN);
  float previous = latestFiltered;
  latestFiltered = filterSample(latestRaw - dcBaseline);
  updateMetrics(latestFiltered, previous);
  if (++telemetryCounter >= TELEMETRY_DIVIDER) { telemetryCounter = 0; sendTelemetry(); }
  if ((int32_t)(micros() - nextSampleUs) > (int32_t)(SAMPLE_PERIOD_US * 4)) nextSampleUs = micros() + SAMPLE_PERIOD_US;
}
