import fs from 'node:fs'
import path from 'node:path'

const HANDOFF = path.join(
  process.cwd(),
  'NFE_Developer_Handoff',
  '07_NFE_New_Language_of_Well_Aging_Editorial_Handoff.md'
)

const ARTICLES = [
  {
    slug: 'well-aging-is-not-disappearing',
    file: 'well-aging-is-not-disappearing.mdx',
    marker: '# Article 01',
    pullQuote:
      'Well-aging is not the art of disappearing. It is the ritual of remaining beautifully, fully here.',
  },
  {
    slug: 'mature-skin-is-underbuilt',
    file: 'mature-skin-is-underbuilt.mdx',
    marker: '# Article 02',
    pullQuote:
      'Mature skin is not simply asking for more water. It is asking for more support.',
  },
  {
    slug: 'calm-is-part-of-the-science',
    file: 'calm-is-part-of-the-science.mdx',
    marker: '# Article 03',
    pullQuote:
      'Calm is not the opposite of performance. Calm is part of the science.',
  },
  {
    slug: 'glow-is-a-barrier-story',
    file: 'glow-is-a-barrier-story.mdx',
    marker: '# Article 04',
    pullQuote: 'Glow, at its most honest, is a sign of comfort.',
  },
  {
    slug: 'dark-spots-inflammation-before-brightening',
    file: 'dark-spots-inflammation-before-brightening.mdx',
    marker: '# Article 05',
    pullQuote:
      'The mark is not always the beginning. Sometimes it is the evidence.',
  },
  {
    slug: 'body-care-neglected-prestige-beauty',
    file: 'body-care-neglected-prestige-beauty.mdx',
    marker: '# Article 06',
    pullQuote:
      'The body is not where luxury ends. For NFE, it is where luxury becomes most personal.',
  },
  {
    slug: 'sensuality-gap-in-skincare',
    file: 'sensuality-gap-in-skincare.mdx',
    marker: '# Article 07',
    pullQuote:
      'The goal is not to make skincare less scientific. The goal is to make science feel human again.',
  },
  {
    slug: 'what-mature-skin-needs-from-makeup',
    file: 'what-mature-skin-needs-from-makeup.mdx',
    marker: '# Article 08',
    pullQuote:
      'Mature skin does not need makeup to hide it. It needs makeup to cooperate with it.',
  },
  {
    slug: 'shaving-is-a-barrier-event',
    file: 'shaving-is-a-barrier-event.mdx',
    marker: '# Article 09',
    pullQuote: 'Skin should not have to be punished to look maintained.',
  },
]

function extractBody(source, marker, nextMarker) {
  const start = source.indexOf(marker)
  if (start === -1) throw new Error(`Missing marker: ${marker}`)
  const section = source.slice(start)
  const bodyStart = section.indexOf('## Article Body')
  if (bodyStart === -1) throw new Error(`Missing body for ${marker}`)
  let body = section.slice(bodyStart + '## Article Body'.length)
  if (nextMarker) {
    const end = body.indexOf(nextMarker)
    if (end !== -1) body = body.slice(0, end)
  } else {
    const end = body.indexOf('# Developer Checklist')
    if (end !== -1) body = body.slice(0, end)
  }
  return body.trim()
}

function toMdx(body, pullQuote) {
  const escapedQuote = pullQuote.replace(/"/g, '\\"')
  const disclaimer = `\n\n<Divider />\n\n## Disclaimer\n\nNFE provides cosmetic skincare education and products. Nothing here is intended to diagnose, treat, cure, or prevent disease. Results vary based on consistency, skin condition, and care.\n`

  return `import { Callout, Divider } from '@/components/articles/MDXComponents'

<Callout title="Editorial Note" variant="quote">
"${escapedQuote}"
</Callout>

${body.trim()}${disclaimer}
`
}

function main() {
  const source = fs.readFileSync(HANDOFF, 'utf8')
  const outDir = path.join(process.cwd(), 'src', 'content', 'articles')

  for (let i = 0; i < ARTICLES.length; i += 1) {
    const article = ARTICLES[i]
    const nextMarker = ARTICLES[i + 1]?.marker
    const body = extractBody(source, article.marker, nextMarker)
    const mdx = toMdx(body, article.pullQuote)
    fs.writeFileSync(path.join(outDir, article.file), mdx, 'utf8')
    console.log(`Wrote ${article.file}`)
  }
}

main()
