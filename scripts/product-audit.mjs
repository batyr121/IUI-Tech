import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { diagnosticQuestions, scoreAdaptiveDiagnostic, scoreWeeklyCheckIn, weeklyCheckInQuestions } from '../server-dist/diagnostic.js';
import { generateHomeworkTasks } from '../server-dist/homework.js';

const server=readFileSync(new URL('../server/index.ts',import.meta.url),'utf8');
const schema=readFileSync(new URL('../prisma/schema.prisma',import.meta.url),'utf8');
const apiSource=readFileSync(new URL('../src/api.ts',import.meta.url),'utf8');
const platformSource=readFileSync(new URL('../src/PlatformPages.tsx',import.meta.url),'utf8');
const mainSource=readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8');
const firmwareSource=readFileSync(new URL('../firmware/iui_bioamp_esp32/iui_bioamp_esp32.ino',import.meta.url),'utf8');
const builtJs=readFileSync(new URL('../dist/assets/'+readFileSync(new URL('../dist/index.html',import.meta.url),'utf8').match(/assets\/(index-[^"']+\.js)/)?.[1],import.meta.url),'utf8');
const routes=new Map();
for(const match of server.matchAll(/app\.(get|post|patch|delete)\(\s*(['"])(\/api\/[^'"]+)\2/g)){const key=`${match[1].toUpperCase()} ${match[3]}`;routes.set(key,(routes.get(key)||0)+1)}
const duplicates=[...routes].filter(([,count])=>count>1);
assert.deepEqual(duplicates,[],'API contains duplicate route definitions');
for(const model of ['DiagnosticAttempt','HomeworkPlan','HomeworkTask','HomeworkAttempt','WeeklyCheckIn'])assert.match(schema,new RegExp(`model ${model}\\s*{`),`Missing Prisma model ${model}`);
assert.match(schema,/eegSessionId\s+String\?\s+@unique/,'A single EEG session must not create duplicate diagnostics');
for(const field of ['attentionDelta','focusDelta','engagementDelta','fatigueDelta','relaxationDelta','signalQuality'])assert.match(schema,new RegExp(`\\b${field}\\s+Int`),`Weekly check-in is missing ${field}`);
assert.match(server,/eegSessionId:z\.string\(\)\.min\(1\)\.optional\(\)/,'Diagnostic must support knowledge-only mode without a device');
assert.match(server,/if\(eegSession&&sectionTimeline\.some/,'EEG section sample checks must still run when a device is used');
assert.match(server,/answerEntries\.length!==expectedQuestions\.length/,'Initial diagnostic must reject incomplete or foreign answers');
assert.match(server,/saved\.homeworkPlans\[0\]\?\.id\|\|\(await createHomeworkPlan\(saved\)\)\.id/,'Diagnostic retry must recover a missing weekly plan');
assert.match(server,/error\.code!==['"]P2002['"]/,'Concurrent diagnostic retry must be idempotent');
assert.match(server,/connectedByUserId:req\.user!\.id/,'Device ownership check is missing');
assert.match(server,/уже закреплено за другой организацией/,'Device must stay locked to the first registered organization');
assert.match(server,/JWT_SECRET\.length<32/,'Production JWT secret length check is missing');
assert.match(server,/Укажите название школы или учебного центра/,'Teacher organization validation is missing');
assert.match(server,/app\.post\(\['\/api\/students','\/api\/students\/import'\],auth/,'Manual student creation must stay disabled');
assert.match(server,/app\.post\('\/api\/sessions',auth,requireStudent/,'EEG session ownership guard is missing');
assert.match(server,/app\.post\('\/api\/diagnostics',auth,requireStudent/,'Diagnostic role guard is missing');
assert.match(server,/app\.post\('\/api\/homework-checkins',auth,requireStudent/,'Weekly check-in role guard is missing');
assert.match(server,/pg_advisory_xact_lock\(hashtext/,'Concurrent plan/check-in protection is missing');
assert.doesNotMatch(server,/\$queryRaw`SELECT pg_advisory_xact_lock/,'Advisory locks returning void must use executeRaw');
assert.match(mainSource,/useState<Screen>\('boot'\)/,'Authentication session recovery is missing');
assert.match(readFileSync(new URL('../src/WeeklyCheckIn.tsx',import.meta.url),'utf8'),/iui-checkin-\$\{info\.planId\}/,'Weekly check-in draft recovery is missing');
assert.doesNotMatch(mainSource,/organizationName:role==='teacher'\?'IUI Academy'/,'Teacher registration contains a fake organization');
assert.doesNotMatch(apiSource,/requestSerialPort|navigator as any\)\.serial|Web Serial/,'Browser transport must be Bluetooth-only');
assert.match(readFileSync(new URL('../src/bluetoothManager.ts',import.meta.url),'utf8'),/bluetooth\.getDevices/,'Previously authorized Bluetooth device recovery is missing');
assert.match(server,/serial=\(\), bluetooth=\(self\)/,'Permissions policy must disable Serial and allow Bluetooth');
assert.doesNotMatch(platformSource,/initialStudents|Legacy|Данияр|Алия/,'Page router contains legacy or demo data');
for(const fake of ['Данияр Сейтбаев','Алексей Морозов','9А · Итоги','Отличное · 96%'])assert.ok(!builtJs.includes(fake),`Production bundle contains demo value: ${fake}`);
const firmwareVersion=firmwareSource.match(/FIRMWARE_VERSION\s*=\s*"([^"]+)"/)?.[1];
const serverFirmware=server.match(/const currentFirmware='([^']+)'/)?.[1];
assert.equal(firmwareVersion,serverFirmware,'ESP32 and platform firmware versions are out of sync');
const bleService=apiSource.match(/IUI_BLE_SERVICE='([^']+)'/)?.[1];
assert.ok(bleService&&firmwareSource.includes(`SERVICE_UUID = "${bleService}"`),'ESP32 and browser BLE service UUIDs are out of sync');
for(const language of ['ru','kk'])for(let grade=1;grade<=11;grade++){
  const questions=diagnosticQuestions(grade,language);
  assert.ok(questions.length>=20&&questions.length<=30,`Grade ${grade}/${language} must have 20–30 diagnostic questions`);
  assert.equal(new Set(questions.map(item=>item.id)).size,questions.length,`Duplicate diagnostic IDs for grade ${grade}/${language}`);
  assert.deepEqual(new Set(questions.map(item=>item.section)),new Set(['math','logic','language']));
  for(const item of questions){assert.ok(item.correct>=0&&item.correct<item.options.length,`Invalid answer index: ${item.id}`);assert.ok(item.difficulty>=1&&item.difficulty<=5,`Invalid difficulty: ${item.id}`);assert.ok(item.category&&item.estimatedTime>0&&item.recommendedAgeRange?.length===2,`Missing cognitive metadata: ${item.id}`)}
  assert.ok(new Set(questions.map(item=>item.category)).size>=8,`Grade ${grade}/${language} has insufficient cognitive coverage`);
  const perfect=Object.fromEntries(questions.map(item=>[item.id,item.correct]));
  assert.equal(scoreAdaptiveDiagnostic(questions,perfect).totalScore,100,`Perfect score failed for ${grade}/${language}`);
  assert.equal(scoreAdaptiveDiagnostic(questions,{}).totalScore,0,`Empty score failed for ${grade}/${language}`);
  const checkIn=weeklyCheckInQuestions(grade,language,1);
  assert.equal(checkIn.length,6,`Grade ${grade}/${language} must have 6 weekly check-in questions`);
  assert.equal(new Set(checkIn.map(item=>item.id)).size,6,`Duplicate check-in IDs for grade ${grade}/${language}`);
  assert.deepEqual(new Set(checkIn.map(item=>item.section)),new Set(['math','logic','language']));
  assert.equal(checkIn.filter(item=>questions.some(initial=>initial.prompt===item.prompt&&JSON.stringify(initial.options)===JSON.stringify(item.options))).length,0,`Check-in repeats initial diagnostic items for grade ${grade}/${language}`);
  for(const item of checkIn){assert.equal(item.options.length,4);assert.equal(new Set(item.options).size,4,`Duplicate check-in options: ${item.id}`);assert.ok(item.correct>=0&&item.correct<4)}
  const perfectCheckIn=Object.fromEntries(checkIn.map(item=>[item.id,item.correct]));
  assert.equal(scoreWeeklyCheckIn(grade,language,1,perfectCheckIn).totalScore,100,`Perfect check-in failed for ${grade}/${language}`);
  for(let week=1;week<=12;week++){
    const weekly=weeklyCheckInQuestions(grade,language,week);
    assert.equal(weekly.length,6,`Week ${week}, grade ${grade}/${language} has wrong check-in length`);
    assert.equal(new Set(weekly.map(item=>item.id)).size,6,`Week ${week}, grade ${grade}/${language} has duplicate check-in IDs`);
  }
  const tasks=generateHomeworkTasks(grade,language,['Вычисления'],{math:40,logic:65,language:75});
  const expected=(grade<=2?21:grade<=8?28:35)+7;
  assert.equal(tasks.length,expected,`Wrong weekly task count for grade ${grade}`);
  assert.deepEqual(new Set(tasks.map(item=>item.dayIndex)),new Set([0,1,2,3,4,5,6]));
  for(let day=0;day<7;day++)assert.equal(tasks.filter(item=>item.dayIndex===day).length,expected/7,`Uneven daily plan for grade ${grade}`);
  const cognitive=tasks.filter(item=>item.subject==='Нейроразминка'||item.subject==='Ми жаттығуы');
  assert.equal(cognitive.length,7,`Grade ${grade}/${language} must have one cognitive warm-up per day`);
  assert.equal(new Set(cognitive.map(item=>item.dayIndex)).size,7,`Cognitive warm-ups must cover all seven days`);
  for(const task of tasks){assert.equal(task.options.length,4);assert.equal(new Set(task.options).size,4,`Duplicate task options: ${task.prompt}`);assert.ok(task.correctOption>=0&&task.correctOption<4);assert.ok(task.xpReward>0);assert.ok(task.hint.length>5);assert.ok(task.explanation.length>5)}
}
for(const file of ['../dist/index.html','../public/brand/iui-mark-v3.svg','../firmware/iui_bioamp_esp32/iui_bioamp_esp32.ino'])assert.ok(existsSync(new URL(file,import.meta.url)),`Missing release artifact: ${file}`);
console.log(`✓ Product audit passed: ${routes.size} unique API routes, 22 initial + 22 control diagnostic variants, 22 weekly-plan variants.`);
