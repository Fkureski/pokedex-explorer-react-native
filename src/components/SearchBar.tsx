import React from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSearch?: () => void;
};

export default function SearchBar({ value, onChange, onSearch }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Nome (ex.: pikachu) ou nº (ex.: #25)"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        placeholderTextColor="#9CA3AF"
        returnKeyType={onSearch ? 'search' : 'done'}
        onSubmitEditing={onSearch}
      />
      {!!onSearch && (
        <Pressable onPress={onSearch} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
          <Text style={styles.btnText}>Buscar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  btn: {
    marginLeft: 8,
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  btnText: { color: '#FFFFFF', fontWeight: '700' },
});
