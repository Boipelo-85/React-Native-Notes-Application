import { StyleSheet, Text, TextInput, View } from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search notes' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#595959"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d4d4d4',
  },
  icon: {
    fontSize: 18,
    color: '#595959',
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#000000',
    fontSize: 15,
    paddingVertical: 0,
  },
});
