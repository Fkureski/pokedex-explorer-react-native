import React from 'react';
import { Text, View } from 'react-native';

export default function ErrorView({ message }: { message: string }) {
    return (
        <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: 'crimson', textAlign: 'center' }}>{message}</Text>
        </View>
    );
}
