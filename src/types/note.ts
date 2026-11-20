export const noteCategories = ['Work', 'Study', 'Personal'] as const;
export type NoteCategory = (typeof noteCategories)[number];

export type Note = {
  id: string;
  title: string;
  body: string;
  category: NoteCategory | null;
  date: number;
  isNew?: boolean;
};

export type Notebook = { notes: Note[] };
