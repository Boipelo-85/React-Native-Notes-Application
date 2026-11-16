import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CategoryCard } from '@/components/CategoryCard';
import { EmptyState } from '@/components/EmptyState';
import { NoteCard } from '@/components/NoteCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SearchBar } from '@/components/SearchBar';
import { SortSelector } from '@/components/SortSelector';

type Note = {
  id: number;
  title: string;
  preview: string;
  category: string;
  updatedAt: string;
  pinned?: boolean;
};

const categories = ['All', 'Work', 'Personal', 'Ideas', 'Travel'];

const notes: Note[] = [
  {
    id: 1,
    title: 'Launch checklist',
    preview: 'Finalize the beta feedback form, review the onboarding screens, and confirm the launch comms timeline.',
    category: 'Work',
    updatedAt: '2 hours ago',
    pinned: true,
  },
  {
    id: 2,
    title: 'Weekend trip ideas',
    preview: 'Check cabin prices in the eastern region and shortlist places with a kitchen and good sunrise views.',
    category: 'Travel',
    updatedAt: 'Yesterday',
  },
  {
    id: 3,
    title: 'Journal entry',
    preview: 'Today felt calmer. I finally finished the deep work block and left the office feeling lighter than expected.',
    category: 'Personal',
    updatedAt: '3 days ago',
  },
  {
    id: 4,
    title: 'Product brainstorm',
    preview: 'Maybe we can add a tiny dashboard for saved notes, recurring reminders, and quick note exports.',
    category: 'Ideas',
    updatedAt: '1 week ago',
  },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'Newest' | 'Oldest' | 'A-Z'>('Newest');

  const filteredNotes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const result = notes.filter((note) => {
      const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
      const matchesSearch =
        query.length === 0 ||
        note.title.toLowerCase().includes(query) ||
        note.preview.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'A-Z') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'Oldest') {
        return a.id - b.id;
      }
      return b.id - a.id;
    });
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Your notes</Text>
            <Text style={styles.title}>Keep ideas close</Text>
          </View>
          <PrimaryButton label="New" onPress={() => undefined} />
        </View>

        <SearchBar value={searchTerm} onChangeText={setSearchTerm} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((category) => (
            <CategoryCard
              key={category}
              label={category}
              active={selectedCategory === category}
              count={category === 'All' ? notes.length : notes.filter((note) => note.category === category).length}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>

        <View style={styles.toolbar}>
          <Text style={styles.results}>{filteredNotes.length} notes</Text>
          <SortSelector value={sortBy} onChange={setSortBy} />
        </View>

        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              title={note.title}
              preview={note.preview}
              category={note.category}
              updatedAt={note.updatedAt}
              pinned={note.pinned}
            />
          ))
        ) : (
          <EmptyState
            title="No notes found"
            message="Try a different search or switch to another category."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  categoryRow: {
    paddingRight: 20,
    paddingBottom: 8,
  },
  toolbar: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  results: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
});
