import { NextRequest, NextResponse } from "next/server";

const DEEPGRAM_TTS_URL = "https://api.deepgram.com/v1/speak";
const DEFAULT_MODEL = "aura-2-amalthea-en";
const DEFAULT_ENCODING = "mp3";
const DEFAULT_BIT_RATE = "48000";
const DEFAULT_SPEED = "1.2";

type DeepgramRequestBody = {
  text?: string;
  language?: string | null;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "Deepgram API key is not configured." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as DeepgramRequestBody;
    const text = String(body.text ?? "").trim();

    if (!text) {
      return NextResponse.json(
        { message: "Text is required to synthesize audio." },
        { status: 400 },
      );
    }

    const searchParams = new URLSearchParams({
      model: resolveDeepgramModel(body.language),
      encoding: DEFAULT_ENCODING,
      bit_rate: DEFAULT_BIT_RATE,
      speed: DEFAULT_SPEED,
    });

    const deepgramResponse = await fetch(
      `${DEEPGRAM_TTS_URL}?${searchParams.toString()}`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      },
    );

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();

      return NextResponse.json(
        {
          message: "Deepgram failed to synthesize audio.",
          details: errorText,
        },
        { status: deepgramResponse.status },
      );
    }

    const audioBuffer = await deepgramResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          deepgramResponse.headers.get("content-type") ?? "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Deepgram TTS request failed:", error);

    return NextResponse.json(
      { message: "Unable to generate voice playback right now." },
      { status: 500 },
    );
  }
}

function resolveDeepgramModel(language?: string | null) {
  switch ((language ?? "").trim().toLowerCase()) {
    case "tagalog":
    case "bisaya":
    case "visaya":
    case "cebuano":
      return DEFAULT_MODEL;
    default:
      return DEFAULT_MODEL;
  }
}
