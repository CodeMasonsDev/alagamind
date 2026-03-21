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

type thoughtProps = {
  thought_id: number;
  text: string;
  distortion: string;
  confidence: Float16Array;
  position: number;
  created_at: string;
  context_note: string;
  journal_id: string;
};

export const fetchThoughtsByUsers = async (
  userid: string,
): Promise<thoughtProps> => {
  const res = await axiosInstance.get(
    `${BASEURL}api/thoughts/by-user?user_id=${userid}`,
  );

  if (res == null) console.log("cant process request");

  return res.data;
};

type Reframe = {
  id: string;
  title: string;
  tone: string;
  text: string;
};

type reframeProps = {
  thought_id: number;
  text: string;
};

export const generateReframes = async (
  body: reframeProps,
): Promise<Reframe> => {
  const res = await axiosInstance.post(`${BASEURL}api/reframes/generate`, {
    thought_id: body.thought_id,
    text: body.text,
  });

  if (res == null) console.log("empty response");

  return res.data;
};

type SaveThought = {
  user_id: string;
  thought_id: number;
  style: string;
  text: string;
  corrected_distortion: string;
};

export const saveGeneratedReframeThought = async (
  body: SaveThought,
): Promise<SaveThought> => {
  const res = await axiosInstance.post(`${BASEURL}api/reframes/save`, {
    user_id: body.user_id,
    thought_id: body.thought_id,
    style: body.style,
    text: body.text,
    corrected_distortion: body.corrected_distortion,
  });

  if (res == null) console.log("empty response");

  return res.data;
};

export const getSaveReframe = async (user_id: string): any => {
  const res = await axiosInstance.get(
    `${BASEURL}api/reframes/by-user?user_id=${user_id}`,
  );
  if (res == null) console.log("empty response");

  return res.data;
};
