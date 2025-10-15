import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import { list, details } from '../services/pokeapi';
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

  function goToDetailsFromQuery() {
    const term = q.trim().toLowerCase().replace(/^#/, '');
    if (!term) return;
    navigation.navigate('Details', { idOrName: term });
  }

  const canLoadMore = useMemo(() => !loading, [loading]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho limpo */}
      <View style={styles.header}>
        <Text style={styles.title}>Pokédex</Text>

        <View style={styles.row}>
          <View style={styles.searchCard}>
            <SearchBar value={q} onChange={setQ} onSearch={goToDetailsFromQuery} />
          </View>

          <Pressable
            onPress={() => navigation.navigate('Favorites')}
            style={({ pressed }) => [styles.favBtn, pressed && styles.favBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Abrir favoritos"
          >
            <Text style={styles.favBtnText}>★ Favoritos</Text>
          </Pressable>
        </View>
      </View>

      {error && <ErrorView message={error} />}
      {loading && items.length === 0 && <Loader />}

      {items.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Nenhum Pokémon carregado.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.name}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.listRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PokemonCard
              name={item.name}
              sprite={item.sprite}
              onPress={() => navigation.navigate('Details', { idOrName: item.name })}
            />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={
            <View style={styles.footer}>
              {loading && items.length > 0 ? <Loader /> :
               <Pressable onPress={() => canLoadMore && loadPage()} style={styles.loadMoreBtn}>
                 <Text style={styles.loadMoreText}>Carregar mais</Text>
               </Pressable>}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, gap: 10 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: 0.2 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  searchCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: Platform.select({ ios: 8, android: 4 }),
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  favBtn: {
    backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  favBtnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  favBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  listContent: { paddingHorizontal: 12, paddingBottom: 24 },
  listRow: { gap: 12 },
  footer: { paddingVertical: 16 },
  loadMoreBtn: {
    alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 999,
    paddingVertical: 10, paddingHorizontal: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  loadMoreText: { fontWeight: '700' },
  emptyWrap: { paddingHorizontal: 16, paddingTop: 24 },
  emptyText: { color: '#6B7280' },
});
