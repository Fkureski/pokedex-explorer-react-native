export type NamedAPIResource = { name: string; url: string };

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
};

export type PokemonType = { slot: number; type: { name: string; url: string } };
export type PokemonAbility = { is_hidden: boolean; slot: number; ability: { name: string; url: string } };

export type PokemonSprites = {
  front_default?: string | null;
  other?: {
    ['official-artwork']?: { front_default?: string | null };
  };
};

export type PokemonDetails = {
  id: number;
  name: string;
  sprites: PokemonSprites;
  types: PokemonType[];
  abilities: PokemonAbility[];
};
