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
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d4d4d4',
  },
  cardActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  labelActive: {
    color: '#fdfdfd',
  },
  count: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#d4d4d4',
    color: '#404040',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 11,
    fontWeight: '700',
  },
  countActive: {
    backgroundColor: '#fdfdfd33',
    color: '#fdfdfd',
  },
});
