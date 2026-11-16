import { Pressable, StyleSheet, Text, View } from 'react-native';

type SortOption = 'Newest' | 'Oldest' | 'A-Z';

type SortSelectorProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

export function SortSelector({ value, onChange }: SortSelectorProps) {
  const options: SortOption[] = ['Newest', 'Oldest', 'A-Z'];

  return (
    <View style={styles.row}>
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          style={[styles.option, value === option && styles.optionActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option }}>
          <Text style={[styles.label, value === option && styles.labelActive]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  option: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  label: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
