import axios from 'axios';
const api = axios.create({ baseURL: 'https://pokeapi.co/api/v2' });

export async function list(offset = 0, limit = 20) {
    const { data } = await api.get(`/pokemon?offset=${offset}&limit=${limit}`);
    return data as { results: { name: string; url: string }[]; next: string | null };
}

export async function details(idOrName: string) {
    const { data } = await api.get(`/pokemon/${idOrName}`);
    return data as any;
}

export async function search(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) throw new Error('Query vazia');
    return details(q);
}
