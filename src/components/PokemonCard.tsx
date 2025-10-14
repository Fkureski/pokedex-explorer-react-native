import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

type Props = { name: string; sprite?: string; onPress: () => void; };

export default function PokemonCard({ name, sprite, onPress }: Props) {
    return (
        <Pressable onPress={onPress} style={{ flex: 1, padding: 8 }}>
            <View style={{
                borderRadius: 12, backgroundColor: '#fff', padding: 12, alignItems: 'center',
                shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
            }}>
                {sprite ? (
                    <Image source={{ uri: sprite }} style={{ width: 80, height: 80 }} />
                ) : <View style={{ width: 80, height: 80 }} />}
                <Text style={{ marginTop: 8, fontWeight: '600', textTransform: 'capitalize' }}>{name}</Text>
            </View>
        </Pressable>
    );
}
