import { useState } from 'react';
import { Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { EmptyState } from '@/components/EmptyState';

type Note = {
  id: number;
  title: string;
  category: string;
  date: number;
  body?: string;
  duration?: string;
  icon?: 'video' | 'audio' | 'file';
  isNew?: boolean;
};

const initialNotes: Note[] = [
  { id: 1, title: 'UX/UI Design Tutorial', category: 'Design', date: Date.UTC(2026, 5, 30), duration: '00:04:59', icon: 'video', isNew: true },
  { id: 2, title: 'Digital Marketing Journey', category: 'Marketing', date: Date.UTC(2026, 6, 12), duration: '00:01:52', icon: 'audio' },
  { id: 3, title: 'Progress in the profession', category: 'Work', date: Date.UTC(2026, 6, 12), duration: '00:05:12', icon: 'file' },
];

const icons = {
  video: { symbol: '▶', background: '#FCEAF0', color: '#DB1748' },
  audio: { symbol: '♩', background: '#EAF0FF', color: '#355BFA' },
  file: { symbol: '▣', background: '#FFF1E5', color: '#D66A19' },
};

const formatDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const sortFields = ['Date', 'Category'] as const;
const sortOrders = ['Ascending', 'Descending'] as const;

export default function NotesScreen() {
  const [notes, setNotes] = useState(initialNotes);
  const [tags, setTags] = useState(['Design', 'Marketing', 'Work']);
  const [tag, setTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortField, setSortField] = useState<(typeof sortFields)[number]>('Date');
  const [sortOrder, setSortOrder] = useState<(typeof sortOrders)[number]>('Ascending');
  const [dialog, setDialog] = useState<'tag' | 'note' | 'settings' | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [draft, setDraft] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftTag, setDraftTag] = useState<string | null>(null);

  const query = search.trim().toLowerCase();
  const visibleNotes = notes.filter((note) => {
    const matchesTag = !tag || tag === note.category;
    const matchesSearch = [note.title, note.category, note.body ?? '']
      .some((value) => value.toLowerCase().includes(query));
    return matchesTag && matchesSearch;
  }).sort((a, b) => {
    const difference = sortField === 'Date' ? a.date - b.date : a.category.localeCompare(b.category);
    return sortOrder === 'Ascending' ? difference : -difference;
  });

  function openForm(kind: 'tag' | 'note') {
    setDraft('');
    setDraftBody('');
    setDraftTag(tag);
    setDialog(kind);
  }

  function save() {
    const title = draft.trim();
    if (!title) return;

    if (dialog === 'tag') {
      const existingTag = tags.find((value) => value.toLowerCase() === title.toLowerCase());
      if (!existingTag) setTags([...tags, title]);
      setTag(existingTag ?? title);
    } else {
      setNotes([...notes, {
        id: notes.length + 1,
        title,
        body: draftBody.trim(),
        category: draftTag ?? 'Uncategorized',
        date: Date.now(),
        isNew: true,
      }]);
      setTag(draftTag);
      setSearch('');
    }
    setDialog(null);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" hitSlop={8} onPress={() => setDialog('settings')}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>
        </View>
        <Text accessibilityRole="header" style={styles.title}>My notes</Text>

        <View style={styles.toolbar}>
          <View style={[styles.outline, styles.search]}>
            <View accessible={false} style={styles.searchIcon}>
              <View style={styles.searchCircle} />
              <View style={styles.searchHandle} />
            </View>
            <TextInput
              accessibilityLabel="Search notes"
              placeholder="Search..."
              placeholderTextColor="#6B7280"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${sortField}, ${sortOrder}`}
            accessibilityState={{ expanded: sortOpen }}
            style={[styles.outline, styles.sortButton]}
            onPress={() => setSortOpen(!sortOpen)}>
            <Text style={styles.sortText}>Sort by</Text>
            <Text style={styles.sortText}>{sortOpen ? '▴' : '▾'}</Text>
          </Pressable>
        </View>

        {sortOpen && (
          <View style={[styles.outline, styles.sortMenu]}>
            <Text style={styles.menuLabel}>Sort by</Text>
            <View style={styles.options}>
              {sortFields.map((field) => (
                <Pressable key={field} accessibilityRole="button" accessibilityState={{ selected: field === sortField }}
                  style={[styles.option, field === sortField && styles.selectedOption]} onPress={() => setSortField(field)}>
                  <Text style={styles.optionText}>{field}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.menuLabel}>Order</Text>
            <View style={styles.options}>
              {sortOrders.map((order) => (
                <Pressable key={order} accessibilityRole="button" accessibilityState={{ selected: order === sortOrder }}
                  style={[styles.option, order === sortOrder && styles.selectedOption]} onPress={() => setSortOrder(order)}>
                  <Text style={styles.optionText}>{order}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.tags}>
        
          <ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
            {[null, ...tags].map((item) => (
              <Pressable key={item ?? 'all'} accessibilityRole="button" accessibilityState={{ selected: tag === item }}
                style={[styles.tag, tag === item && styles.activeTag]} onPress={() => setTag(item)}>
                <Text style={[styles.tagText, tag === item && styles.activeTagText]}>{item ?? 'All tags'}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}>
          {visibleNotes.map((note) => {
            const icon = icons[note.icon ?? 'file'];
            return (
              <View key={note.id} style={[styles.outline, styles.card]}>
                <View style={[styles.noteIcon, { backgroundColor: icon.background }]}>
                  <Text style={[styles.noteSymbol, { color: icon.color }]}>{icon.symbol}</Text>
                </View>
                <View style={styles.noteDetails}>
                  <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
                  <Text style={styles.metadata}>{formatDate.format(note.date)}{note.duration ? `  •  ${note.duration}` : ''}</Text>
                </View>
                {note.isNew && <Text style={styles.newBadge}>NEW</Text>}
                <Pressable accessibilityRole="button" accessibilityLabel={`Details for ${note.title}`} hitSlop={6}
                  style={styles.more} onPress={() => setSelectedNote(note)}>
                  <Text style={styles.moreIcon}>⋮</Text>
                </Pressable>
              </View>
            );
          })}
          {visibleNotes.length === 0 && <EmptyState title="No notes found" message="Try another search or tag." />}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => openForm('note')}>
            <Text style={styles.primaryText}>＋ Add Note</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={dialog !== null || selectedNote !== null} transparent animationType="fade"
        onRequestClose={() => { setDialog(null); setSelectedNote(null); }}>
        <View style={styles.backdrop}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.dialogPosition}>
            <View style={styles.dialog}>
              <Text accessibilityRole="header" style={styles.dialogTitle}>
                {selectedNote?.title ?? (dialog === 'tag' ? 'Create tag' : dialog === 'settings' ? 'Settings' : 'Add Note')}
              </Text>
              {selectedNote && <Text style={styles.metadata}>{selectedNote.body || selectedNote.category}</Text>}
              {dialog === 'settings' && <Text style={styles.metadata}>Settings are not available yet.</Text>}
              {(dialog === 'tag' || dialog === 'note') && (
                <>
                  <TextInput accessibilityLabel={dialog === 'tag' ? 'Tag name' : 'Note title'}
                    placeholder={dialog === 'tag' ? 'Tag name' : 'Note title'} placeholderTextColor="#6B7280"
                    style={[styles.outline, styles.dialogInput]} value={draft} onChangeText={setDraft}
                    onSubmitEditing={dialog === 'tag' ? save : undefined} />
                  {dialog === 'note' && (
                    <>
                      <TextInput accessibilityLabel="Note text" placeholder="Write a note..." placeholderTextColor="#6B7280"
                        style={[styles.outline, styles.dialogInput, styles.bodyInput]} value={draftBody}
                        onChangeText={setDraftBody} multiline />
                      <View style={[styles.options, styles.wrapped]}>
                        {tags.map((item) => (
                          <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: draftTag === item }}
                            style={[styles.tag, draftTag === item && styles.activeTag]} onPress={() => setDraftTag(draftTag === item ? null : item)}>
                            <Text style={[styles.tagText, draftTag === item && styles.activeTagText]}>{item}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}
              <View style={styles.dialogActions}>
                <Pressable accessibilityRole="button" style={styles.option} onPress={() => { setDialog(null); setSelectedNote(null); }}>
                  <Text style={styles.optionText}>{dialog === 'tag' || dialog === 'note' ? 'Cancel' : 'Close'}</Text>
                </Pressable>
                {(dialog === 'tag' || dialog === 'note') && (
                  <Pressable accessibilityRole="button" disabled={!draft.trim()}
                    style={[styles.primaryButton, !draft.trim() && styles.disabled]} onPress={save}>
                    <Text style={styles.primaryText}>Save</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  page: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20 },
  topBar: { alignItems: 'flex-end', paddingTop: 12, paddingBottom: 8 },
  settingsIcon: { color: '#343C4B', fontSize: 25 },
  title: { color: '#14161C', fontSize: 32, fontWeight: '700', marginBottom: 14 },
  toolbar: { flexDirection: 'row', gap: 10 },
  outline: { borderWidth: 1, borderColor: '#E2E4E9', borderRadius: 11, backgroundColor: '#FFFFFF' },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 42, gap: 9 },
  searchIcon: { width: 16, height: 16 },
  searchCircle: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.4, borderColor: '#6B7280' },
  searchHandle: { position: 'absolute', width: 6, height: 1.4, left: 9, top: 11, backgroundColor: '#6B7280', transform: [{ rotate: '45deg' }] },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 8, fontSize: 14, color: '#151821' },
  sortButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 11, gap: 7 },
  sortText: { fontSize: 13, color: '#343C4B', fontWeight: '600' },
  sortMenu: { alignSelf: 'flex-end', padding: 10, marginTop: 6, gap: 6 },
  menuLabel: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  options: { flexDirection: 'row', gap: 7 },
  wrapped: { flexWrap: 'wrap' },
  option: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 7, backgroundColor: '#F4F5F7' },
  selectedOption: { backgroundColor: '#DDE6FF' },
  optionText: { color: '#28344A', fontSize: 13, fontWeight: '600' },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12, marginBottom: 13 },
  tag: { backgroundColor: '#F1F3F6', borderRadius: 7, paddingVertical: 7, paddingHorizontal: 9 },
  createTag: { backgroundColor: '#EAF0FF' },
  createTagText: { color: '#284BD8', fontSize: 13, fontWeight: '600' },
  tagText: { color: '#444C5D', fontSize: 13, fontWeight: '600' },
  activeTag: { backgroundColor: '#4C5363' },
  activeTagText: { color: '#FFFFFF' },
  list: { gap: 11, paddingTop: 5, paddingBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', minHeight: 73, padding: 9, gap: 12 },
  noteIcon: { width: 47, height: 47, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  noteSymbol: { fontSize: 20, fontWeight: '700' },
  noteDetails: { flex: 1, gap: 6 },
  noteTitle: { fontSize: 15, fontWeight: '600', color: '#14161C' },
  metadata: { fontSize: 13, color: '#5E6675' },
  newBadge: { position: 'absolute', right: 19, top: -6, backgroundColor: '#D8E6FF', borderRadius: 8, paddingHorizontal: 8, color: '#233F79', fontSize: 10, fontWeight: '700' },
  more: { paddingHorizontal: 5, paddingVertical: 4 },
  moreIcon: { fontSize: 22, color: '#343C4B' },
  footer: { alignItems: 'center', paddingTop: 10, paddingBottom: 20 },
  primaryButton: { backgroundColor: '#3457F5', borderRadius: 10, paddingHorizontal: 17, paddingVertical: 12 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
  backdrop: { flex: 1, backgroundColor: 'rgba(20, 22, 28, 0.35)' },
  dialogPosition: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 22 },
  dialog: { width: '100%', maxWidth: 400, padding: 18, borderRadius: 14, backgroundColor: '#FFFFFF', gap: 12 },
  dialogTitle: { fontSize: 22, color: '#14161C', fontWeight: '700' },
  dialogInput: { padding: 11, fontSize: 15, color: '#14161C' },
  bodyInput: { minHeight: 80, textAlignVertical: 'top' },
  dialogActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
});
