import axios from 'axios';
import type { PokemonDetails, PokemonListResponse } from '../types/pokemon';

const api = axios.create({ baseURL: 'https://pokeapi.co/api/v2' });

export async function list(offset = 0, limit = 20): Promise<PokemonListResponse> {
  const { data } = await api.get(`/pokemon?offset=${offset}&limit=${limit}`);
  return data as PokemonListResponse;
}

export async function details(idOrName: string): Promise<PokemonDetails> {
  const { data } = await api.get(`/pokemon/${idOrName}`);
  return data as PokemonDetails;
}

let cachedNames: string[] | null = null;

export async function allNames(): Promise<string[]> {
  if (cachedNames) return cachedNames;
  const { data } = await api.get<PokemonListResponse>('/pokemon?limit=2000&offset=0');
  cachedNames = data.results.map(r => r.name);
  return cachedNames!;
}
