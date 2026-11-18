import type { Notebook } from '../types/note';
import { readStored, writeStored } from './storage';

function notebookKey(email: string) {
  return `@notes/notebook/${encodeURIComponent(email)}`;
}

export async function loadNotebook(email: string): Promise<Notebook> {
  return await readStored<Notebook>(notebookKey(email)) ?? {
    notes: [],
    tags: ['Design', 'Marketing', 'Work'],
  };
}

export function saveNotebook(email: string, notebook: Notebook) {
  return writeStored(notebookKey(email), notebook);
}
