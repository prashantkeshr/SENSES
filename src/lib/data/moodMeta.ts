export interface MoodMeta {
  description: string;
  group: 'calm' | 'energetic' | 'emotional' | 'textural';
}

export const MOOD_META: Record<string, MoodMeta> = {
  airy:         { description: 'Light, open, and unconfined. Work that breathes.',                    group: 'calm'      },
  atmospheric:  { description: 'Thick with texture and feeling. Space you can inhabit.',             group: 'textural'  },
  awakening:    { description: 'The moment before clarity arrives. A first breath.',                 group: 'energetic' },
  'awe-inspiring': { description: 'Scale and wonder that stops you cold.',                           group: 'emotional' },
  calm:         { description: 'The antidote to noise. Still water, clear sky.',                     group: 'calm'      },
  cinematic:    { description: 'The grammar of great film — tension, colour, time.',                 group: 'energetic' },
  clean:        { description: 'Minimal. Precise. Uncluttered.',                                     group: 'calm'      },
  contemplative:{ description: 'Slow time. Work that asks you to sit with it.',                      group: 'calm'      },
  cosy:         { description: 'Warm textures and familiar comfort.',                                group: 'textural'  },
  dramatic:     { description: 'High contrast, high stakes. Nothing understated.',                   group: 'energetic' },
  dynamic:      { description: 'Motion and energy in every frame.',                                  group: 'energetic' },
  emotional:    { description: 'Direct to the chest. No subtlety required.',                         group: 'emotional' },
  epic:         { description: 'Grand scale and operatic feeling.',                                  group: 'energetic' },
  ethereal:     { description: 'Barely-there beauty. The edge of visibility.',                       group: 'calm'      },
  focused:      { description: 'Clarity and purpose. No distractions.',                              group: 'calm'      },
  grounding:    { description: 'Earth, texture, presence. Feet on the ground.',                     group: 'textural'  },
  hypnotic:     { description: "The kind of beautiful you can't stop looking at.",                   group: 'textural'  },
  intense:      { description: 'Dense, concentrated, demanding your full attention.',               group: 'energetic' },
  joyful:       { description: 'Unguarded happiness. Easy and bright.',                              group: 'energetic' },
  meditative:   { description: 'Repetition, breath, and internal quiet.',                           group: 'calm'      },
  moody:        { description: 'Complex atmosphere. Neither fully light nor fully dark.',            group: 'textural'  },
  mysterious:   { description: 'Withheld information. Space for imagination.',                       group: 'textural'  },
  nostalgic:    { description: 'The ache of time passing. Memory in visible form.',                 group: 'emotional' },
  open:         { description: 'Wide horizons and possibility. Room to think.',                      group: 'calm'      },
  otherworldly: { description: 'Outside the familiar. The uncanny made beautiful.',                  group: 'textural'  },
  peaceful:     { description: 'Undisturbed quiet. Ease without effort.',                            group: 'calm'      },
  powerful:     { description: 'Undeniable force and weight.',                                       group: 'energetic' },
  primal:       { description: 'Old and elemental. Pre-language feeling.',                           group: 'textural'  },
  quiet:        { description: 'The value of near-silence.',                                         group: 'calm'      },
  relaxed:      { description: 'Loose, unhurried, comfortable.',                                     group: 'calm'      },
  restorative:  { description: 'Work that gives something back.',                                    group: 'emotional' },
  rhythmic:     { description: 'Beat and pattern. The pleasure of repetition.',                      group: 'energetic' },
  romantic:     { description: 'Longing and closeness. The warmth between people.',                 group: 'emotional' },
  serene:       { description: 'Absolute stillness. Perfected calm.',                                group: 'calm'      },
  social:       { description: 'People, energy, the pleasure of company.',                           group: 'energetic' },
  vast:         { description: 'Immensity that makes you feel small in the best way.',              group: 'calm'      },
  warm:         { description: 'Soft light and golden tones. Comfort you can see.',                 group: 'textural'  },
  zen:          { description: 'Balance and emptiness. The space between things.',                   group: 'calm'      },
};

export const MOOD_GROUP_LABEL: Record<MoodMeta['group'], string> = {
  calm:      'Calm & Quiet',
  energetic: 'Dynamic & Energetic',
  emotional: 'Emotional',
  textural:  'Atmospheric & Textural',
};
