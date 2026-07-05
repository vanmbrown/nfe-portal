export type ElixirEditorialProfile = {
  slug: 'face-elixir' | 'body-elixir'
  statusLabel: string
  emotionalPromise: string
  formulationThesis: string
  whoItIsFor: string[]
  textureFinish: string
  ritualGuidance: string
  founderNote: string
  bodyEditorialHref?: string
  bodyEditorialLabel?: string
  relatedJournal: Array<{ slug: string; title: string; excerpt: string }>
  scienceHref: string
  scienceLabel: string
}

export const faceElixirEditorial: ElixirEditorialProfile = {
  slug: 'face-elixir',
  statusLabel: 'Pre-order pathway in preparation',
  emotionalPromise:
    'A daily face ritual for skin that has lived: hydration, barrier comfort, visible radiance, and a more even-looking complexion without asking the skin to perform youth.',
  formulationThesis:
    'Face Elixir is built as a complete emulsion, not a crowded stack. The formulation thesis is restraint with intention: barrier support, tone integrity, and a finish that layers calmly beneath sunscreen and makeup.',
  whoItIsFor: [
    'Skin navigating dryness, dullness, or a depleted feel above the neck.',
    'Tone-rich skin that needs barrier comfort before brightening language makes sense.',
    'A measured daily ritual rather than reactive product stacking.',
  ],
  textureFinish:
    'A weightless emulsion that glides on without heaviness: hydrating like water, nourishing like an oil, with a calm finish that layers beneath sunscreen and makeup.',
  ritualGuidance:
    'Morning: after cleansing, apply one to two pumps to face and neck. Press upward, allow two to three minutes of absorption, then sunscreen. Evening: after cleansing, apply one to two pumps as the final hydration step when skin feels dry or depleted.',
  founderNote:
    'I wanted one face formula that could feel complete on its own: hydrating like water, nourishing like an oil, and calm enough for skin that has history. Face Elixir is that daily anchor.',
  relatedJournal: [
    {
      slug: 'glow-is-a-barrier-story',
      title: 'Glow Is a Barrier Story, Not a Shimmer Story',
      excerpt:
        'Radiance begins with comfort, moisture retention, and a barrier that feels calm.',
    },
    {
      slug: 'calm-is-part-of-the-science',
      title: 'Calm Is Part of the Science',
      excerpt:
        'Mature skin often responds best to consistency, barrier support, and calm performance.',
    },
    {
      slug: 'dark-spots-inflammation-before-brightening',
      title: 'Uneven Tone Is a Skin-Stress Story Before It Is a Brightening Story',
      excerpt:
        'Tone support begins with calm before brightening language enters the ritual.',
    },
  ],
  scienceHref: '/science',
  scienceLabel: 'Read the Science',
}

export const bodyElixirEditorial: ElixirEditorialProfile = {
  slug: 'body-elixir',
  statusLabel: 'In development',
  emotionalPromise:
    'Body skin is not secondary. This elixir treats dryness, crepey-looking texture, uneven-looking tone, and daily comfort as face-level concerns.',
  formulationThesis:
    'Body Elixir extends the same layered-care intelligence to the body: deep hydration, barrier comfort, and a sensorial finish that absorbs without leaving the skin feeling neglected or ashy.',
  whoItIsFor: [
    'Body skin navigating chronic dryness, roughness, or crepey-looking texture.',
    'Skin that needs face-level nourishment from shoulders to legs.',
    'A body ritual that feels intentional, not like an afterthought lotion.',
  ],
  textureFinish:
    'A rich emulsion that spreads across larger areas without feeling sticky or slick. The finish is supple and cushioned, not ashy or neglected.',
  ritualGuidance:
    'After bathing, while skin is still slightly damp, massage into arms, legs, torso, and any dryness-prone areas. For elbows, knees, or heels, a second layer can support extra comfort before dressing.',
  founderNote:
    'The body deserved the same formulation discipline I was building for the face. Body Elixir is my answer to body care that feels as considered as everything above the neckline.',
  bodyEditorialHref: '/articles/body-care-neglected-prestige-beauty',
  bodyEditorialLabel: 'Body Care Is Prestige Beauty\'s Missing Ritual',
  relatedJournal: [
    {
      slug: 'body-care-neglected-prestige-beauty',
      title: 'Body Care Is Prestige Beauty\'s Missing Ritual',
      excerpt:
        'The body deserves the same intelligence, performance, and luxury as the face.',
    },
    {
      slug: 'water-vs-oil',
      title: 'Solving the Hidden Problem: Why Oil Alone Fails Mature Melanated Skin',
      excerpt:
        'Hydration and moisture are different needs. Both belong in the ritual.',
    },
    {
      slug: 'sensuality-gap-in-skincare',
      title: 'The Sensuality Gap in Skincare',
      excerpt:
        'Mature skin deserves pleasure, softness, and ritual, not only correction.',
    },
  ],
  scienceHref: '/science',
  scienceLabel: 'Read the Science',
}
