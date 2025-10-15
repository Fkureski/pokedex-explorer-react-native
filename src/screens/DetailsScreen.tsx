import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  View,
  Button,
  RefreshControl,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import { details } from '../services/pokeapi';
import type { PokemonDetails } from '../types/pokemon';
import { useFavorites } from '../context/FavoritesContext';

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

type Props = StackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ route }: Props) {
  const { idOrName } = route.params;
  const [data, setData] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isFav, toggleFav } = useFavorites();

  const fetchDetails = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const d = await details(idOrName);
      setData(d);
      AccessibilityInfo.announceForAccessibility?.(`Detalhes carregados de ${d.name}`);
    } catch (e) {
      setError('Não foi possível carregar detalhes. Verifique sua conexão e tente novamente.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [idOrName]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchDetails();
    } finally {
      setRefreshing(false);
    }
  }, [fetchDetails]);

  const sprite =
    data?.sprites?.other?.['official-artwork']?.front_default ??
    data?.sprites?.other?.dream_world?.front_default ??
    data?.sprites?.front_default ??
    undefined;

  const name = data?.name ?? '';
  const number = data?.id ? `#${data.id}` : '';
  const types = (data?.types ?? []).map(t => t.type.name);
  const abilities = (data?.abilities ?? []).map(a => a.ability.name);

  if (loading && !refreshing) {
    return (
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.muted}>Carregando detalhes...</Text>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView contentContainerStyle={styles.center} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <Text style={[styles.muted, { textAlign: 'center', marginBottom: 12 }]}>{error}</Text>
        <Button title="Tentar novamente" onPress={fetchDetails} />
      </ScrollView>
    );
  }

  if (!data) {
    return (
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.muted}>Nenhum dado disponível.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        {!!sprite && (
          <Image
            source={{ uri: sprite }}
            style={styles.artwork}
            accessibilityLabel={`Imagem do Pokémon ${name}`}
          />
        )}
        <Text style={styles.title} accessibilityRole="header">
          {capitalize(name)}
        </Text>
        {!!number && <Text style={styles.number}>{number}</Text>}

        <View style={{ marginTop: 12 }}>
          <Button
            title={isFav(name) ? 'Desfavoritar' : 'Favoritar'}
            onPress={() => toggleFav(name)}
            accessibilityLabel={isFav(name) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos</Text>
        <View style={styles.chipsRow}>
          {types.map(t => (
            <TypeChip key={t} type={t} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habilidades</Text>
        {abilities.slice(0, 6).map(a => (
          <Text key={a} style={styles.listItem}>
            • {capitalize(a)}
          </Text>
        ))}
        {abilities.length === 0 && <Text style={styles.muted}>Nenhuma habilidade listada.</Text>}
      </View>
    </ScrollView>
  );
}

function TypeChip({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? '#E0E0E0';
  const fg = getReadableTextColor(color);
  return (
    <View style={[styles.chip, { backgroundColor: color }]}>
      <Text style={[styles.chipText, { color: fg }]}>{capitalize(type)}</Text>
    </View>
  );
}

function capitalize(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
function getReadableTextColor(bg: string) {
  const hex = bg.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.6 ? '#111' : '#FFF';
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  artwork: {
    width: 240,
    height: 240,
    borderRadius: 16,
    backgroundColor: '#fafafa',
  },
  title: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  number: {
    opacity: 0.7,
    marginTop: 2,
    fontSize: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  chipText: {
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  listItem: {
    fontSize: 16,
    marginBottom: 4,
  },
  muted: {
    color: '#666',
  },
});
