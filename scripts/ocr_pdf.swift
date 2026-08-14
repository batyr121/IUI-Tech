import Foundation
import PDFKit
import Vision
import AppKit

guard CommandLine.arguments.count > 1 else { exit(2) }
let url = URL(fileURLWithPath: CommandLine.arguments[1])
guard let document = PDFDocument(url: url) else { exit(3) }

print("PAGES=\(document.pageCount)")
for index in 0..<document.pageCount {
    guard let page = document.page(at: index) else { continue }
    let bounds = page.bounds(for: .mediaBox)
    let scale: CGFloat = 2.2
    let width = Int(bounds.width * scale)
    let height = Int(bounds.height * scale)
    guard let context = CGContext(
        data: nil,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else { continue }
    context.setFillColor(NSColor.white.cgColor)
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    context.saveGState()
    context.scaleBy(x: scale, y: scale)
    page.draw(with: .mediaBox, to: context)
    context.restoreGState()
    guard let image = context.makeImage() else { continue }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["ru-RU", "kk-KZ", "en-US"]
    request.usesLanguageCorrection = true
    try VNImageRequestHandler(cgImage: image).perform([request])
    let lines = (request.results ?? [])
        .sorted { left, right in
            let dy = abs(left.boundingBox.midY - right.boundingBox.midY)
            return dy > 0.012 ? left.boundingBox.midY > right.boundingBox.midY : left.boundingBox.minX < right.boundingBox.minX
        }
        .compactMap { $0.topCandidates(1).first?.string }
    print("\n--- PAGE \(index + 1) ---\n")
    print(lines.joined(separator: "\n"))
}
