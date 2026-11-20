import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Note, Notebook } from '../types/note';
import { readStored, writeStored } from './storage';

type LegacyNotebook = { notes: Note[]; tags: string[] };
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

async function readNotebook(email: string): Promise<Notebook> {
  const categories = await readStored<string[]>(`${notebookKey(email)}/categories`);
  if (!categories) {
    const legacy = await readStored<LegacyNotebook>(notebookKey(email));
    if (!legacy) {
      const defaults = ['Design', 'Marketing', 'Work'];
      await saveCategories(email, defaults);
      return { notes: [], categories: defaults };
    }

    // Older records used the same value for missing categories and an explicit
    // category with this name. Keep existing assignments if that category exists.
    const explicitUncategorized = legacy.tags.includes('Uncategorized');
    const notes = legacy.notes.map((note) => ({
      ...note,
      category: !explicitUncategorized && note.category === 'Uncategorized' ? null : note.category,
    }));
    if (notes.length) {
      await AsyncStorage.multiSet(notes.map((note) => [
        notePrefix(email) + encodeURIComponent(note.id),
        JSON.stringify(note),
      ]));
    }
    // Publish the new format only after all notes have been copied.
    await saveCategories(email, legacy.tags);
    await AsyncStorage.removeItem(notebookKey(email));
    return { notes, categories: legacy.tags };
  }

  const storageKeys = await AsyncStorage.getAllKeys();
  if (storageKeys.includes(notebookKey(email))) {
    await AsyncStorage.removeItem(notebookKey(email));
  }
  const keys = storageKeys.filter((key) => key.startsWith(notePrefix(email)));
  const records = keys.length ? await AsyncStorage.multiGet(keys) : [];
  const notes = records.flatMap(([, value]) => value === null ? [] : [JSON.parse(value) as Note]);
  return { notes, categories };
}

export function saveCategories(email: string, categories: string[]) {
  return writeStored(`${notebookKey(email)}/categories`, categories);
}

export function saveNote(email: string, note: Note) {
  return writeStored(notePrefix(email) + encodeURIComponent(note.id), note);
}

export async function removeCategory(email: string, categories: string[], detachedNotes: Note[]) {
  if (detachedNotes.length) {
    await AsyncStorage.multiSet(detachedNotes.map((note) => [
      notePrefix(email) + encodeURIComponent(note.id),
      JSON.stringify(note),
    ]));
  }
  await saveCategories(email, categories);
}

export function removeNote(email: string, id: string) {
  return AsyncStorage.removeItem(notePrefix(email) + encodeURIComponent(id));
}
