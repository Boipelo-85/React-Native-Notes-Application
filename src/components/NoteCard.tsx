import { Pressable, StyleSheet, Text, View } from 'react-native';

type NoteCardProps = {
  title: string;
  preview: string;
  category: string;
  updatedAt: string;
  pinned?: boolean;
  onPress?: () => void;
};

export function NoteCard({ title, preview, category, updatedAt, pinned, onPress }: NoteCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
      <View style={styles.headerRow}>
        <Text style={styles.category}>{category}</Text>
        {pinned ? <Text style={styles.pin}>📌</Text> : null}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.preview} numberOfLines={2}>
        {preview}
      </Text>

      <Text style={styles.meta}>{updatedAt}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fdfdfd',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  category: {
    color: '#595959',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pin: {
    fontSize: 14,
  },
  title: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  preview: {
    color: '#404040',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  meta: {
    color: '#595959',
    fontSize: 12,
    fontWeight: '600',
  },
});
