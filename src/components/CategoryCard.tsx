import { Pressable, StyleSheet, Text, View } from 'react-native';

type CategoryCardProps = {
  label: string;
  active?: boolean;
  count?: number;
  onPress?: () => void;
};

export function CategoryCard({ label, active = false, count, onPress }: CategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, active && styles.cardActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}>
      <View style={styles.row}>
        <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
        {typeof count === 'number' && <Text style={[styles.count, active && styles.countActive]}>{count}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  count: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 11,
    fontWeight: '700',
  },
  countActive: {
    backgroundColor: '#FFFFFF33',
    color: '#FFFFFF',
  },
});
