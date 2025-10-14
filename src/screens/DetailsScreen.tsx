import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View, Button } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { details } from '../services/pokeapi';
import { useFavorites } from '../context/FavoritesContext';
import Loader from '../components/Loader';
import ErrorView from '../components/ErrorView';
import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ route }: Props) {
    const { idOrName } = route.params;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isFav, toggleFav } = useFavorites();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true); setError(null);
                const d = await details(idOrName);
                setData(d);
            } catch (e) {
                setError('Não foi possível carregar detalhes.');
            } finally {
                setLoading(false);
            }
        })();
    }, [idOrName]);

    if (loading) return <Loader />;
    if (error) return <ErrorView message={error} />;

    const name = data?.name as string;
    const sprite = data?.sprites?.other?.['official-artwork']?.front_default ?? data?.sprites?.front_default;
    const types = (data?.types ?? []).map((t: any) => t.type.name);
    const abilities = (data?.abilities ?? []).map((a: any) => a.ability.name);

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ alignItems: 'center' }}>
                {!!sprite && <Image source={{ uri: sprite }} style={{ width: 200, height: 200 }} />}
                <Text style={{ marginTop: 12, fontSize: 24, fontWeight: '700', textTransform: 'capitalize' }}>{name}</Text>
                <Text style={{ opacity: 0.7 }}>#{data?.id}</Text>
                <View style={{ marginTop: 8, flexDirection: 'row', gap: 8 }}>
                    {types.map((t: string) => (
                        <Text key={t} style={{ textTransform: 'capitalize' }}>{t}</Text>
                    ))}
                </View>
                <View style={{ marginTop: 12 }}>
                    <Button
                        title={isFav(name) ? 'Desfavoritar' : 'Favoritar'}
                        onPress={() => toggleFav(name)}
                    />
                </View>
            </View>

            <View style={{ marginTop: 24 }}>
                <Text style={{ fontWeight: '700', marginBottom: 8 }}>Habilidades</Text>
                {abilities.map((a: string) => (
                    <Text key={a} style={{ textTransform: 'capitalize' }}>• {a}</Text>
                ))}
            </View>
        </ScrollView>
    );
}
