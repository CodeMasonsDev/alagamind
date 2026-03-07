export type CreateJournal = {
  title: string;
  content: string;
};

export type UpdateJournal = {
  userId: string;
  journalId: string;
  title: string;
  content: string;
};
