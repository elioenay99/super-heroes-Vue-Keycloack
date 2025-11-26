// Tipagens para a Superhero API (sem any)

export interface Powerstats {
  intelligence: number | null
  strength: number | null
  speed: number | null
  durability: number | null
  power: number | null
  combat: number | null
}

export interface Appearance {
  gender: string | null
  race: string | null
  height: [string, string]
  weight: [string, string]
  eyeColor: string | null
  hairColor: string | null
}

export interface Biography {
  fullName: string
  alterEgos: string
  aliases: string[]
  placeOfBirth: string
  firstAppearance: string
  publisher: string | null
  alignment: 'good' | 'bad' | 'neutral' | string
}

export interface Work {
  occupation: string
  base: string
}

export interface Connections {
  groupAffiliation: string
  relatives: string
}

export interface Images {
  xs: string
  sm: string
  md: string
  lg: string
}

export interface Hero {
  id: number
  name: string
  slug: string
  powerstats: Powerstats
  appearance: Appearance
  biography: Biography
  work: Work
  connections: Connections
  images: Images
}

// Em algumas telas podemos precisar somente de uma visão enxuta
export type HeroListItem = Pick<Hero, 'id' | 'name' | 'biography' | 'images' | 'slug'>
