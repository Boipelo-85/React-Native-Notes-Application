import AsyncStorage from '@react-native-async-storage/async-storage';

import { noteCategories, type Note, type Notebook } from '../types/note';
import { readStored, writeStored } from './storage';

type StoredNote = Omit<Note, 'category'> & { category: string | null };
type LegacyNotebook = { notes: StoredNote[] };
const loads = new Map<string, Promise<Notebook>>();

function notebookKey(email: string) {
  return `@notes/notebook/${encodeURIComponent(email)}`;
}

function notePrefix(email: string) {
  return `${notebookKey(email)}/notes/`;
}

export function loadNotebook(email: string): Promise<Notebook> {
  const pending = loads.get(email);
  if (pending) return pending;

  const load = readNotebook(email).finally(() => loads.delete(email));
  loads.set(email, load);
  return load;
}

function normalizeNote(note: StoredNote): Note {
  const category = note.category?.trim().toLowerCase();
  return { ...note, category: noteCategories.find((item) => item.toLowerCase() === category) ?? null };
}

async function readNotebook(email: string): Promise<Notebook> {
  // The old category key also marks completion of the legacy notebook migration.
  const categoryKey = notebookKey(email) + '/categories';
  if (!(await readStored<unknown>(categoryKey))) {
    const legacy = await readStored<LegacyNotebook>(notebookKey(email));
    if (legacy) {
      const notes = legacy.notes.map(normalizeNote);
      if (notes.length) {
        await AsyncStorage.multiSet(notes.map((note) => [
          notePrefix(email) + encodeURIComponent(note.id),
          JSON.stringify(note),
        ]));
      }
      await writeStored(categoryKey, true);
      await AsyncStorage.removeItem(notebookKey(email));
      return { notes };
    }
  }

  const storageKeys = await AsyncStorage.getAllKeys();
  if (storageKeys.includes(notebookKey(email))) {
    await AsyncStorage.removeItem(notebookKey(email));
  }
  const keys = storageKeys.filter((key) => key.startsWith(notePrefix(email)));
  const records = keys.length ? await AsyncStorage.multiGet(keys) : [];
  const notes = records.flatMap(([, value]) => value === null ? [] : [normalizeNote(JSON.parse(value) as StoredNote)]);
  return { notes };
}

export function saveNote(email: string, note: Note) {
  return writeStored(notePrefix(email) + encodeURIComponent(note.id), note);
}

export function removeNote(email: string, id: string) {
  return AsyncStorage.removeItem(notePrefix(email) + encodeURIComponent(id));
}
