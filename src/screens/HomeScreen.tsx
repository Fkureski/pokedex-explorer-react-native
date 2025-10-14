import React, { useEffect, useMemo, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { list, details, search } from '../services/pokeapi';
import Loader from '../components/Loader';
import ErrorView from '../components/ErrorView';
import SearchBar from '../components/SearchBar';
import PokemonCard from '../components/PokemonCard';
import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

type Item = { name: string; sprite?: string };

export default function HomeScreen({ navigation }: Props) {
    const [items, setItems] = useState<Item[]>([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [q, setQ] = useState('');

    const canLoadMore = useMemo(() => !loading, [loading]);

    async function loadPage(initial = false) {
        try {
            setLoading(true); setError(null);
            const page = await list(initial ? 0 : offset, 20);
            // pega sprites básicas pra lista
            const enriched = await Promise.all(
                page.results.map(async r => {
                    try {
                        const d = await details(r.name);
                        return { name: r.name, sprite: d?.sprites?.front_default as string | undefined };
                    } catch {
                        return { name: r.name };
                    }
                })
            );
            setItems(prev => initial ? enriched : [...prev, ...enriched]);
            setOffset(prev => initial ? 20 : prev + 20);
        } catch (e: any) {
            setError('Falha ao carregar a lista. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadPage(true); }, []);

    async function doSearch() {
        if (!q.trim()) return;
        navigation.navigate('Details', { idOrName: q.trim().toLowerCase() });
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            <SearchBar value={q} onChange={setQ} onSearch={doSearch} />

            {error && <ErrorView message={error} />}
            {loading && items.length === 0 && <Loader />}

            <FlatList
                data={items}
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
                ListFooterComponent={
                    loading && items.length > 0 ? <Loader /> :
                        <View style={{ padding: 12 }}>
                            <Button title="Carregar mais" onPress={() => canLoadMore && loadPage()} />
                        </View>
                }
            />

            <View style={{ position: 'absolute', right: 16, bottom: 16 }}>
                <Button title="Favoritos" onPress={() => navigation.navigate('Favorites')} />
            </View>
        </View>
    );
}
