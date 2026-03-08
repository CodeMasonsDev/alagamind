import { GetUserJournal, GetUserJournals } from "@/api/journal";
import { GetAllJournalsByUser } from "@/services/journals";
import { useEffect, useState } from "react";
type JournalPaperProps = {
  user_id: string;
  journal_id: string;
};
export default function JournalPaper({
  user_id,
  journal_id,
}: JournalPaperProps) {
  const [journal, setJournal] = useState();

  useEffect(() => {
    const fetchJournal = async () => {
      const journal = await GetUserJournal(user_id, journal_id);
      setJournal(journal);
      console.log("journal", journal);
    };
    fetchJournal();
  }, []);
  return (
    <section className="p-10">
      <header>
        <h1 className="text-[45px]">{journal?.title}</h1>
      </header>

      <main>
        <p>{journal?.content}</p>
      </main>
    </section>
  );
}
