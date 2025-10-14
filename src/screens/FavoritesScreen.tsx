import React, { useEffect, useState } from 'react';
import { FlatList, View, Text } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { details } from '../services/pokeapi';
import PokemonCard from '../components/PokemonCard';

export default function FavoritesScreen({ navigation }: any) {
    const { all } = useFavorites();
    const [items, setItems] = useState<{ name: string; sprite?: string }[]>([]);

    useEffect(() => {
        (async () => {
            const enriched = await Promise.all(
                all.map(async name => {
                    try {
                        const d = await details(name);
                        return { name, sprite: d?.sprites?.front_default as string | undefined };
                    } catch {
                        return { name };
                    }
                })
            );
            setItems(enriched);
        })();
    }, [all]);

    if (all.length === 0) {
        return <View style={{ padding: 16 }}><Text>Nenhum favorito ainda.</Text></View>;
    }

    return (
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
        />
    );
}
