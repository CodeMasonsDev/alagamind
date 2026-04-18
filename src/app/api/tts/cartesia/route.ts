import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const apiKey = process.env.CARTESIA_API_KEY;
    if (!apiKey) {
      console.error("CARTESIA_API_KEY is missing from environment variables");
      return NextResponse.json({ error: "TTS Service Configuration Error" }, { status: 500 });
    }

    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript,
        model_id: "sonic-english",
        voice: {
          id: "bf0a246a-8642-498a-9950-80c35e9276b5", // Sophie - Teacher
        },
        output_format: {
          container: "wav",
          encoding: "pcm_s16le",
          sample_rate: 44100,
        },
        generation_config: {
          speed: 0.6,
          emotion: "calm"
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Cartesia API Error Response:", errorData);
      return NextResponse.json({ 
        error: "Failed to generate speech", 
        details: errorData 
      }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
      },
    });
  } catch (error) {
    console.error("Cartesia TTS Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
