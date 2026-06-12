import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#71717a"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: '#a1a1aa', // zinc-400
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#18181b', // zinc-900
    borderWidth: 1,
    borderColor: '#27272a', // zinc-800
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: '#ef4444', // red-500
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  }
});
