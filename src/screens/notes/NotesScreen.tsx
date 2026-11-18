import { randomUUID } from 'expo-crypto';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { appColors as palette } from '@/constants/appColors';
import { useAuth } from '@/context/AuthContext';
import { loadNotebook, saveNotebook } from '@/services/noteService';
import type { Note, Notebook } from '@/types/note';

const uncategorized = 'Uncategorized';

const formatDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const sortOrders = ['Ascending', 'Descending'] as const;

export default function NotesScreen() {
  const { user, signOut } = useAuth();
  return user ? <NotebookScreen key={user.email} email={user.email} signOut={signOut} /> : null;
}

function NotebookScreen({ email, signOut }: { email: string; signOut: () => void }) {
  const { user, updateProfile } = useAuth();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const writing = useRef(false);
  const [saveError, setSaveError] = useState('');
  const { notes = [], tags = [] } = notebook ?? {};
  const [tag, setTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<(typeof sortOrders)[number]>('Ascending');
  const [dialog, setDialog] = useState<'tag' | 'note' | 'edit' | 'delete' | 'profile' | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [draft, setDraft] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftTag, setDraftTag] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    let active = true;
    loadNotebook(email).then(
      (stored) => { if (active) setNotebook(stored); },
      () => { if (active) setLoadError(true); },
    );
    return () => { active = false; };
  }, [email, loadAttempt]);

  const noteForm = dialog === 'note' || dialog === 'edit';
  const formOpen = noteForm || dialog === 'tag';
  const profileOpen = dialog === 'profile';
  const changingPassword = !!(currentPassword || newPassword || confirmPassword);
  const profileChanged = profileName.trim() !== user?.name || changingPassword;
  const query = search.trim().toLowerCase();
  const visibleNotes = notes.filter((note) => {
    const matchesTag = !tag || tag === note.category;
    const matchesSearch = [note.title, note.category, note.body ?? '']
      .some((value) => value.toLowerCase().includes(query));
    return matchesTag && matchesSearch;
  }).sort((a, b) => {
    const difference = a.date - b.date;
    return sortOrder === 'Ascending' ? difference : -difference;
  });

  function closeDialog() {
    if (writing.current) return;
    setDialog(null);
    setSelectedNote(null);
    setSaveError('');
    if (profileOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  async function saveProfile() {
    if (writing.current || !profileChanged || !profileName.trim()) return;

    if (changingPassword && (!currentPassword || !newPassword.trim())) {
      setSaveError('Enter your current password and a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSaveError('New passwords must match.');
      return;
    }

    writing.current = true;
    setSaving(true);
    setSaveError('');
    let saved = false;
    try {
      saved = await updateProfile(
        profileName,
        changingPassword ? { current: currentPassword, next: newPassword } : undefined,
      );
      if (!saved) setSaveError('Current password is incorrect.');
    } catch {
      setSaveError('Could not save your profile. Please try again.');
    } finally {
      writing.current = false;
      setSaving(false);
    }
    if (saved) closeDialog();
  }

  function openForm(kind: 'tag' | 'note' | 'edit') {
    const editing = kind === 'edit' ? selectedNote : null;
    setDraft(editing?.title ?? '');
    setDraftBody(editing?.body ?? '');
    setDraftTag(editing ? editing.category === uncategorized ? null : editing.category : tag);
    setDialog(kind);
  }

  async function updateNotebook(next: Notebook) {
    if (writing.current || !notebook) return false;

    writing.current = true;
    setSaving(true);
    setSaveError('');
    try {
      await saveNotebook(email, next);
      setNotebook(next);
      return true;
    } catch {
      setSaveError('Could not save your changes. Please try again.');
      return false;
    } finally {
      writing.current = false;
      setSaving(false);
    }
  }

  async function save() {
    const title = draft.trim();
    if (!title || writing.current || !notebook) return;

    if (dialog === 'tag') {
      const existingTag = tags.find((value) => value.toLowerCase() === title.toLowerCase());
      if (!existingTag && !(await updateNotebook({ notes, tags: [...tags, title] }))) return;
      setTag(existingTag ?? title);
    } else if (noteForm) {
      const fields = { title, body: draftBody.trim(), category: draftTag ?? uncategorized };
      if (dialog === 'edit' && !selectedNote) return;
      const nextNotes = dialog === 'edit'
        ? notes.map((note) => note.id === selectedNote?.id ? { ...note, ...fields } : note)
        : [...notes, { ...fields, id: randomUUID(), date: Date.now(), isNew: true }];
      if (!(await updateNotebook({ notes: nextNotes, tags }))) return;
      setTag(draftTag);
      setSearch('');
    }
    closeDialog();
  }

  async function deleteNote() {
    if (!selectedNote) return;
    if (await updateNotebook({ notes: notes.filter((note) => note.id !== selectedNote.id), tags })) {
      closeDialog();
    }
  }

  if (!notebook) {
    return (
      <SafeAreaView style={[styles.screen, styles.loading]}>
        {loadError ? (
          <>
            <Text accessibilityRole="alert">Could not load your notes.</Text>
            <Pressable accessibilityRole="button" style={styles.option} onPress={() => {
              setLoadError(false);
              setLoadAttempt((attempt) => attempt + 1);
            }}>
              <Text style={styles.optionText}>Retry</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.option} onPress={signOut}>
              <Text style={styles.optionText}>Sign out</Text>
            </Pressable>
          </>
        ) : <ActivityIndicator accessibilityLabel="Loading notes" color={palette.primary} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Text accessibilityRole="header" style={styles.title}>Notes</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            style={styles.profileButton}
            onPress={() => {
              setSortOpen(false);
              setProfileName(user?.name ?? '');
              setDialog('profile');
            }}>
            <View style={styles.profileIcon}>
              <View style={styles.profileHead} />
              <View style={styles.profileShoulders} />
            </View>
          </Pressable>
        </View>

        <View style={styles.toolbar}>
          <View style={[styles.outline, styles.search]}>
            <View accessible={false} style={styles.searchIcon}>
              <View style={styles.searchCircle} />
              <View style={styles.searchHandle} />
            </View>
            <TextInput
              accessibilityLabel="Search notes"
              placeholder="Search..."
              placeholderTextColor={palette.muted}
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sort by date added, ${sortOrder.toLowerCase()}`}
            accessibilityState={{ expanded: sortOpen }}
            style={[styles.outline, styles.sortButton]}
            onPress={() => setSortOpen(!sortOpen)}>
            <Text style={styles.sortText}>Sort by</Text>
            <Text style={styles.sortText}>{sortOpen ? '▴' : '▾'}</Text>
          </Pressable>
        </View>

        <View style={styles.notesContent}>
          <View style={styles.tags}>
            <ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
              {[null, ...tags].map((item) => (
                <Pressable key={item === null ? 'all' : `tag-${item}`} accessibilityRole="button" accessibilityState={{ selected: tag === item }}
                  style={[styles.tag, tag === item && styles.activeTag]} onPress={() => setTag(item)}>
                  <Text style={[styles.tagText, tag === item && styles.activeTagText]}>{item ?? 'All tags'}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable accessibilityRole="button" accessibilityLabel="Create tag"
              style={[styles.tag, styles.createTag]} onPress={() => openForm('tag')}>
              <Text style={styles.createTagText}>＋ Tag</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}>
            {visibleNotes.map((note) => (
                <View key={note.id} style={[styles.outline, styles.card]}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Read ${note.title}`}
                    style={styles.noteDetails} onPress={() => setSelectedNote(note)}>
                    <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
                    <Text style={styles.metadata}>{formatDate.format(note.date)}  •  {note.category}</Text>
                  </Pressable>
                  {note.isNew && <Text style={styles.newBadge}>NEW</Text>}
                  <Pressable accessibilityRole="button" accessibilityLabel={`Details for ${note.title}`} hitSlop={6}
                    style={styles.more} onPress={() => setSelectedNote(note)}>
                    <Text style={styles.moreIcon}>⋮</Text>
                  </Pressable>
                </View>
            ))}
            {visibleNotes.length === 0 && (
              <EmptyState title={notes.length ? 'No notes found' : 'No notes yet'}
                message={notes.length ? 'Try another search or tag.' : 'Add a note to get started.'} />
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => openForm('note')}>
              <Text style={styles.primaryText}>＋ Add Note</Text>
            </Pressable>
          </View>
          {sortOpen && (
            <View style={styles.sortOverlay} pointerEvents="box-none">
              <Pressable accessible={false} style={StyleSheet.absoluteFill} onPress={() => setSortOpen(false)} />
              <View style={[styles.outline, styles.sortMenu]}>
                <Text style={styles.menuLabel}>Date added</Text>
                {sortOrders.map((order) => (
                  <Pressable
                    key={order}
                    accessibilityRole="button"
                    accessibilityState={{ selected: order === sortOrder }}
                    style={[styles.option, order === sortOrder && styles.selectedOption]}
                    onPress={() => {
                      setSortOrder(order);
                      setSortOpen(false);
                    }}>
                    <Text style={[styles.optionText, order === sortOrder && styles.selectedOptionText]}>{order}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      <Modal visible={dialog !== null || selectedNote !== null} transparent animationType="fade"
        onRequestClose={closeDialog}>
        <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.dialogPosition}>
            <View style={styles.dialog}>
              <Text accessibilityRole="header" style={styles.dialogTitle}>
                {dialog === 'edit' ? 'Edit Note' : dialog === 'delete' ? 'Delete Note' : dialog === 'tag' ? 'Create tag' :
                  profileOpen ? 'Profile' : selectedNote?.title ?? 'Add Note'}
              </Text>
              {selectedNote && !dialog && (
                <>
                  <Text style={styles.metadata}>{selectedNote.category}</Text>
                  <Text style={styles.noteTitle}>{selectedNote.body || 'This note has no text.'}</Text>
                </>
              )}
              {dialog === 'delete' && <Text style={styles.metadata}>Delete “{selectedNote?.title}” permanently?</Text>}
              {profileOpen && (
                <>
                  <Text style={styles.fieldLabel}>Email address</Text>
                  <Text selectable style={styles.profileEmail}>{email}</Text>
                  <Text style={styles.fieldLabel}>Name</Text>
                  <TextInput accessibilityLabel="Name" autoComplete="name"
                    style={[styles.outline, styles.dialogInput]} value={profileName}
                    onChangeText={setProfileName} editable={!saving} />
                  <Text style={styles.fieldLabel}>Change password (optional)</Text>
                  <TextInput accessibilityLabel="Current password" placeholder="Current password"
                    placeholderTextColor={palette.muted} autoComplete="current-password" secureTextEntry
                    style={[styles.outline, styles.dialogInput]} value={currentPassword}
                    onChangeText={setCurrentPassword} editable={!saving} />
                  <TextInput accessibilityLabel="New password" placeholder="New password"
                    placeholderTextColor={palette.muted} autoComplete="new-password" secureTextEntry
                    style={[styles.outline, styles.dialogInput]} value={newPassword}
                    onChangeText={setNewPassword} editable={!saving} />
                  <TextInput accessibilityLabel="Confirm new password" placeholder="Confirm new password"
                    placeholderTextColor={palette.muted} secureTextEntry
                    style={[styles.outline, styles.dialogInput]} value={confirmPassword}
                    onChangeText={setConfirmPassword} editable={!saving} />
                </>
              )}
              {formOpen && (
                <>
                  <TextInput accessibilityLabel={dialog === 'tag' ? 'Tag name' : 'Note title'}
                    placeholder={dialog === 'tag' ? 'Tag name' : 'Note title'} placeholderTextColor={palette.muted}
                    style={[styles.outline, styles.dialogInput]} value={draft} onChangeText={setDraft}
                    editable={!saving} onSubmitEditing={dialog === 'tag' ? save : undefined} />
                  {noteForm && (
                    <>
                      <TextInput accessibilityLabel="Note text" placeholder="Write a note..." placeholderTextColor={palette.muted}
                        style={[styles.outline, styles.dialogInput, styles.bodyInput]} value={draftBody}
                        onChangeText={setDraftBody} editable={!saving} multiline />
                      <View style={[styles.options, styles.wrapped]}>
                        {tags.map((item) => (
                          <Pressable key={item} accessibilityRole="button" disabled={saving} accessibilityState={{ selected: draftTag === item }}
                            style={[styles.tag, draftTag === item && styles.activeTag]} onPress={() => setDraftTag(draftTag === item ? null : item)}>
                            <Text style={[styles.tagText, draftTag === item && styles.activeTagText]}>{item}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}
              {saveError ? <Text accessibilityRole="alert" style={styles.dangerText}>{saveError}</Text> : null}
              <View style={styles.dialogActions}>
                <Pressable accessibilityRole="button" disabled={saving} style={styles.option} onPress={closeDialog}>
                  <Text style={styles.optionText}>{formOpen || dialog === 'delete' ? 'Cancel' : 'Close'}</Text>
                </Pressable>
                {selectedNote && !dialog && (
                  <>
                    <Pressable accessibilityRole="button" style={styles.option} onPress={() => openForm('edit')}>
                      <Text style={styles.optionText}>Edit</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" style={styles.option} onPress={() => setDialog('delete')}>
                      <Text style={[styles.optionText, styles.dangerText]}>Delete</Text>
                    </Pressable>
                  </>
                )}
                {profileOpen && (
                  <>
                    <Pressable accessibilityRole="button" disabled={saving} style={styles.option} onPress={signOut}>
                      <Text style={styles.optionText}>Sign out</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" disabled={saving || !profileChanged || !profileName.trim()}
                      style={[styles.primaryButton, (saving || !profileChanged || !profileName.trim()) && styles.disabled]}
                      onPress={saveProfile}>
                      <Text style={styles.primaryText}>{saving ? 'Saving…' : 'Save profile'}</Text>
                    </Pressable>
                  </>
                )}
                {formOpen && (
                  <Pressable accessibilityRole="button" disabled={saving || !draft.trim()}
                    style={[styles.primaryButton, (saving || !draft.trim()) && styles.disabled]} onPress={save}>
                    <Text style={styles.primaryText}>{saving ? 'Saving…' : 'Save'}</Text>
                  </Pressable>
                )}
                {dialog === 'delete' && (
                  <Pressable accessibilityRole="button" disabled={saving}
                    style={styles.primaryButton} onPress={deleteNote}>
                    <Text style={styles.primaryText}>{saving ? 'Deleting…' : 'Confirm delete'}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  dangerText: { color: palette.text },
  screen: { flex: 1, backgroundColor: palette.background },
  page: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, marginBottom: 14 },
  profileButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.soft, alignItems: 'center', justifyContent: 'center' },
  profileIcon: { alignItems: 'center', gap: 2 },
  profileHead: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: palette.accent },
  profileShoulders: { width: 17, height: 9, borderWidth: 1.5, borderRadius: 5, borderColor: palette.accent },
  fieldLabel: { color: palette.text, fontSize: 14, fontWeight: '600' },
  profileEmail: { color: palette.muted, fontSize: 15, paddingHorizontal: 11, paddingVertical: 10, backgroundColor: palette.soft, borderRadius: 11 },
  title: { color: palette.text, fontSize: 32, fontWeight: '900' },
  toolbar: { flexDirection: 'row', gap: 10 },
  outline: { borderWidth: 1, borderColor: palette.border, borderRadius: 11, backgroundColor: palette.surface },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 42, gap: 9 },
  searchIcon: { width: 16, height: 16 },
  searchCircle: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.4, borderColor: palette.muted },
  searchHandle: { position: 'absolute', width: 6, height: 1.4, left: 9, top: 11, backgroundColor: palette.muted, transform: [{ rotate: '45deg' }] },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 8, fontSize: 14, color: palette.text },
  sortButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 11, gap: 7 },
  sortText: { fontSize: 13, color: palette.accent, fontWeight: '600' },
  notesContent: { flex: 1 },
  sortOverlay: { ...StyleSheet.absoluteFill, zIndex: 2 },
  sortMenu: { position: 'absolute', top: 6, right: 0, minWidth: 148, padding: 10, gap: 6, elevation: 4 },
  menuLabel: { fontSize: 12, fontWeight: '700', color: palette.muted },
  options: { flexDirection: 'row', gap: 7 },
  wrapped: { flexWrap: 'wrap' },
  option: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 7, backgroundColor: palette.soft },
  selectedOption: { backgroundColor: palette.primary },
  selectedOptionText: { color: palette.surface },
  optionText: { color: palette.accent, fontSize: 13, fontWeight: '600' },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12, marginBottom: 13 },
  tag: { backgroundColor: palette.soft, borderRadius: 7, paddingVertical: 7, paddingHorizontal: 9 },
  createTag: { backgroundColor: palette.subtle },
  createTagText: { color: palette.accent, fontSize: 13, fontWeight: '600' },
  tagText: { color: palette.muted, fontSize: 13, fontWeight: '600' },
  activeTag: { backgroundColor: palette.accent },
  activeTagText: { color: palette.surface },
  list: { gap: 11, paddingTop: 5, paddingBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', minHeight: 73, padding: 9, gap: 12 },
  noteDetails: { flex: 1, gap: 6 },
  noteTitle: { fontSize: 15, fontWeight: '600', color: palette.text },
  metadata: { fontSize: 13, color: palette.muted },
  newBadge: { position: 'absolute', right: 19, top: -6, backgroundColor: palette.subtle, borderRadius: 8, paddingHorizontal: 8, color: palette.accent, fontSize: 10, fontWeight: '700' },
  more: { paddingHorizontal: 5, paddingVertical: 4 },
  moreIcon: { fontSize: 22, color: palette.accent },
  footer: { alignItems: 'center', paddingTop: 10, paddingBottom: 20 },
  primaryButton: { backgroundColor: palette.primary, borderRadius: 10, paddingHorizontal: 17, paddingVertical: 12 },
  primaryText: { color: palette.surface, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.35)' },
  dialogPosition: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 22 },
  dialog: { width: '100%', maxWidth: 400, padding: 18, borderRadius: 14, backgroundColor: palette.background, gap: 12 },
  dialogTitle: { fontSize: 22, color: palette.text, fontWeight: '700' },
  dialogInput: { padding: 11, fontSize: 15, color: palette.text },
  bodyInput: { minHeight: 80, textAlignVertical: 'top' },
  dialogActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
});
