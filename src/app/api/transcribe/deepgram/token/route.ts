import { NextResponse } from "next/server";

const DEEPGRAM_AUTH_GRANT_URL = "https://api.deepgram.com/v1/auth/grant";

type DeepgramGrantResponse = {
  access_token?: string;
  expires_in?: number;
};

export async function POST() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "Deepgram API key is not configured." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(DEEPGRAM_AUTH_GRANT_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl_seconds: 60 }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          message: "Unable to create Deepgram streaming token.",
          details: errorText,
        },
        { status: response.status },
      );
    }

    const payload = (await response.json()) as DeepgramGrantResponse;

    return NextResponse.json({
      access_token: payload.access_token ?? "",
      expires_in: payload.expires_in ?? 60,
    });
  } catch (error) {
    console.error("Deepgram token grant failed:", error);

    return NextResponse.json(
      { message: "Unable to initialize live transcription right now." },
      { status: 500 },
    );
  }
}
