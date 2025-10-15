import React from 'react';
import { View, TextInput, Button } from 'react-native';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSearch?: () => void;
};

export default function SearchBar({ value, onChange, onSearch }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, padding: 12 }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Nome (ex.: pikachu) ou nº (ex.: #25)"
        autoCapitalize="none"
        style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 }}
        returnKeyType={onSearch ? 'search' : 'done'}
        onSubmitEditing={onSearch}
      />
      {!!onSearch && <Button title="Buscar" onPress={onSearch} />}
    </View>
  );
}
