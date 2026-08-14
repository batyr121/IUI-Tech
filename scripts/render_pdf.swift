import Foundation
import PDFKit
import AppKit

guard CommandLine.arguments.count > 2 else { exit(2) }
let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
try? FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
guard let document = PDFDocument(url: input) else { exit(3) }
print("PAGES=\(document.pageCount)")
for index in 0..<document.pageCount {
    guard let page = document.page(at: index) else { continue }
    let bounds = page.bounds(for: .mediaBox)
    let scale: CGFloat = 1.25
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(bounds.width * scale), pixelsHigh: Int(bounds.height * scale), bitsPerSample: 8, samplesPerPixel: 3, hasAlpha: false, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 24)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    NSColor.white.setFill()
    NSRect(x: 0, y: 0, width: bounds.width * scale, height: bounds.height * scale).fill()
    NSGraphicsContext.current?.cgContext.scaleBy(x: scale, y: scale)
    page.draw(with: .mediaBox, to: NSGraphicsContext.current!.cgContext)
    NSGraphicsContext.restoreGraphicsState()
    let data = rep.representation(using: .png, properties: [:])!
    try data.write(to: output.appendingPathComponent(String(format: "page-%02d.png", index + 1)))
}
