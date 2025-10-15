import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, FlatList, SafeAreaView, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import { list, details, allNames } from '../services/pokeapi';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import ErrorView from '../components/ErrorView';
import PokemonCard from '../components/PokemonCard';

type Props = StackScreenProps<RootStackParamList, 'Home'>;
type Item = { id?: number; name: string; sprite?: string };

export default function HomeScreen({ navigation }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [nameIndex, setNameIndex] = useState<string[] | null>(null);
  const [searchCards, setSearchCards] = useState<Item[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const query = q.trim().toLowerCase();
  const inSearchMode = query.length > 0;

  const detailsCache = useRef<Map<string, Item>>(new Map());

  async function loadDetailsCached(key: string): Promise<Item | null> {
    const k = key.toLowerCase();
    if (detailsCache.current.has(k)) return detailsCache.current.get(k)!;
    try {
      const d = await details(k);
      const item: Item = { id: d.id, name: d.name, sprite: d?.sprites?.front_default ?? undefined };
      detailsCache.current.set(String(d.id), item);
      detailsCache.current.set(d.name.toLowerCase(), item);
      return item;
    } catch {
      return null;
    }
  }

  async function loadPage(initial = false) {
    try {
      if (initial) { setOffset(0); setItems([]); }
      setLoading(true); setError(null);
      const page = await list(initial ? 0 : offset, 20);
      const enriched = await Promise.all(
        page.results.map(async r => {
          const it = await loadDetailsCached(r.name);
          return it ?? { name: r.name };
        })
      );
      setItems(prev => initial ? enriched : [...prev, ...enriched]);
      setOffset(prev => initial ? 20 : prev + 20);
    } catch {
      setError('Falha ao carregar a lista. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPage(true); }, []);

  async function onRefresh() {
    try { setRefreshing(true); await loadPage(true); }
    finally { setRefreshing(false); }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!inSearchMode) { setSearchCards([]); return; }


      const numericRaw = query.replace('#', '');
      const isNumeric = /^\d+$/.test(numericRaw);

      if (isNumeric) {
        setSearchLoading(true);
        const item = await loadDetailsCached(numericRaw);
        if (!cancelled) {
          setSearchCards(item ? [item] : []);
          setSearchLoading(false);
        }
        return;
      }

      try {
        setSearchLoading(true);
        const idx = nameIndex ?? await allNames().then(n => { setNameIndex(n); return n; });
        const filteredNames = idx
          .filter(n => n.includes(query))
          .slice(0, 40);

        const cards: Item[] = [];
        for (const name of filteredNames) {
          const it = await loadDetailsCached(name);
          cards.push(it ?? { name });
        }
        if (!cancelled) setSearchCards(cards);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [inSearchMode, query, nameIndex]);

  const dataToRender = inSearchMode ? searchCards : items;

  const canLoadMore = useMemo(() => !loading, [loading]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <SearchBar value={q} onChange={setQ} />

      {error && !inSearchMode && <ErrorView message={error} />}
      {loading && !inSearchMode && items.length === 0 && <Loader />}
      {inSearchMode && searchLoading && dataToRender.length === 0 && <Loader />}

      {dataToRender.length === 0 && !(loading || searchLoading) ? (
        <View style={{ padding: 16 }}>
          <Text>
            {/^\#?\d+$/.test(query)
              ? `Nenhum Pokémon com o número ${query.replace('#','')}.`
              : `Nenhum Pokémon encontrado para “${q}”.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={dataToRender}
          keyExtractor={(it) => it.name}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          renderItem={({ item }) => (
            <PokemonCard
              name={item.name}
              sprite={item.sprite}
              onPress={() => navigation.navigate('Details', { idOrName: item.name })}
            />
          )}
          refreshing={!inSearchMode ? refreshing : false}
          onRefresh={!inSearchMode ? onRefresh : undefined}
          ListFooterComponent={
            !inSearchMode ? (
              <View style={{ padding: 12 }}>
                {loading && items.length > 0 ? <Loader /> :
                 <Button title="Carregar mais" onPress={() => canLoadMore && loadPage()} />}
              </View>
            ) : null
          }
        />
      )}

      <View style={{ position: 'absolute', right: 16, bottom: 16 }}>
        <Button title="Favoritos" onPress={() => navigation.navigate('Favorites')} />
      </View>
    </SafeAreaView>
  );
}
