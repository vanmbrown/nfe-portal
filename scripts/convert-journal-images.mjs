import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SOURCE_DIR = path.join(
  process.cwd(),
  'NFE_Developer_Handoff',
  '08_Journal_Article_Images'
)
const OUTPUT_DIR = path.join(
  process.cwd(),
  'public',
  'images',
  'journal',
  'the-new-language-of-well-aging'
)

const MAPPINGS = [
  {
    source: '01-well-aging-is-not-disappearing.jpg',
    output: 'well-aging-not-disappearing-hero.webp',
  },
  {
    source: '02-mature-skin-is-underbuilt.jpg',
    output: 'mature-skin-underbuilt-hero.webp',
  },
  {
    source: '03-calm-is-part-of-the-science.jpg',
    output: 'calm-is-part-of-science-hero.webp',
  },
  {
    source: '04-glow-is-a-barrier-story.jpg',
    output: 'glow-barrier-story-hero.webp',
  },
  {
    source: '05-dark-spots-inflammation-story.jpg',
    output: 'dark-spots-inflammation-story-hero.webp',
  },
  {
    source: '06-body-care-neglected.jpg',
    output: 'body-care-prestige-gap-hero.webp',
  },
  {
    source: '07-sensuality-gap.jpg',
    output: 'sensuality-gap-skincare-hero.webp',
  },
  {
    source: '08-mature-skin-makeup.jpg',
    output: 'mature-skin-makeup-needs-hero.webp',
  },
  {
    source: '09-shaving-is-a-barrier-event.jpg',
    output: 'shaving-barrier-event-hero.webp',
  },
]

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const report = []

  for (const { source, output } of MAPPINGS) {
    const inputPath = path.join(SOURCE_DIR, source)
    const outputPath = path.join(OUTPUT_DIR, output)

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Missing source image: ${inputPath}`)
    }

    const inputMeta = await sharp(inputPath).metadata()
    const inputStats = fs.statSync(inputPath)

    await sharp(inputPath)
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath)

    const outputStats = fs.statSync(outputPath)
    const outputMeta = await sharp(outputPath).metadata()

    report.push({
      source,
      output,
      inputBytes: inputStats.size,
      outputBytes: outputStats.size,
      inputWidth: inputMeta.width,
      inputHeight: inputMeta.height,
      outputWidth: outputMeta.width,
      outputHeight: outputMeta.height,
      savingsPercent: Math.round(
        (1 - outputStats.size / inputStats.size) * 100
      ),
    })
  }

  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
