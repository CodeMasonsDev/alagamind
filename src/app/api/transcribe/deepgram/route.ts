import { NextRequest, NextResponse } from "next/server";

const DEEPGRAM_LISTEN_URL =
  "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true&language=en";

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "Deepgram API key is not configured." },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Audio file is required." },
        { status: 400 },
      );
    }

    const contentType = file.type || "audio/webm";
    const audioBuffer = await file.arrayBuffer();

    const deepgramResponse = await fetch(DEEPGRAM_LISTEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body: audioBuffer,
    });

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();

      return NextResponse.json(
        {
          message: "Deepgram failed to transcribe audio.",
          details: errorText,
        },
        { status: deepgramResponse.status },
      );
    }

    const payload = (await deepgramResponse.json()) as DeepgramTranscriptionResponse;
    const transcript =
      payload.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ??
      "";

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Deepgram transcription request failed:", error);

    return NextResponse.json(
      { message: "Unable to transcribe audio right now." },
      { status: 500 },
    );
  }
}

type DeepgramTranscriptionResponse = {
  results?: {
    channels?: Array<{
      alternatives?: Array<{
        transcript?: string;
      }>;
    }>;
  };
};
