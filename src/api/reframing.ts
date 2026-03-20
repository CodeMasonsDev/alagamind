import axiosInstance from "@/lib/axios";
import { BASEURL } from "@/lib/base";

type analyzeJournalProps = {
  userId: string;
  journalId: string;
  content: string;
  dateTime: Date;
};

export const AnalyzeJournal = async (
  body: analyzeJournalProps,
): Promise<any> => {
  try {
    const res = await axiosInstance.post(`${BASEURL}api/journal/analyze`, {
      user_id: body.userId,
      journal_id: body.journalId,
      content: body.content,
      created_at: body.dateTime,
    });

    return res.data;
  } catch (error) {
    console.log(error);
  }
};
