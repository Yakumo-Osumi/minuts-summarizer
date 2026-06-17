export type Task = {
  id: number;
  assignee: string;
  content: string;
  deadline: string;
};

export type SummarizeResponse = {
  summary: string;
  tasks: Task[];
};

export type SummarizeError = {
  error: string;
};
