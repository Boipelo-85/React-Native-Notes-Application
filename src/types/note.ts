export type Note = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  date: number;
  isNew?: boolean;
};

export type Notebook = { notes: Note[]; categories: string[] };
