export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface dateSelection {
  date: string;
  id: number | null;
  raw?: Date;
  block: number;
}
