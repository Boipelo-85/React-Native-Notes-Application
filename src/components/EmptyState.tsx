import { StyleSheet, Text, View } from 'react-native';

import { appColors } from '@/constants/appColors';

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>✦</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: appColors.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    color: appColors.accent,
    fontSize: 30,
  },
  title: {
    color: appColors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: appColors.muted,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});
