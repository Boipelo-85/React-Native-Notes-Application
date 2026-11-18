export type Note = {
  id: string;
  title: string;
  body: string;
  category: string;
  date: number;
  isNew?: boolean;
};

export type Notebook = { notes: Note[]; tags: string[] };
