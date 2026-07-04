import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type GenerateEmailBody = {
  purpose?: string;
  recipient?: string;
  tone?: string;
};

function buildPrompt({ purpose, recipient, tone }: Required<GenerateEmailBody>) {
  return [
    "You are an assistant that writes clear, professional emails.",
    `Email purpose: ${purpose}`,
    `Recipient: ${recipient}`,
    `Tone: ${tone}`,
    "Write the email only. Do not include analysis, markdown fences, or a subject line unless it is strongly helpful.",
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY in environment variables." },
        { status: 500 },
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 },
      );
    }

    const authorizationHeader = request.headers.get("authorization");

    if (!authorizationHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const accessToken = authorizationHeader.slice("Bearer ".length);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in again." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as GenerateEmailBody;
    const purpose = body.purpose?.trim();
    const recipient = body.recipient?.trim();
    const tone = body.tone?.trim();

    if (!purpose || !recipient || !tone) {
      return NextResponse.json(
        { error: "purpose, recipient, and tone are required." },
        { status: 400 },
      );
    }

    const prompt = buildPrompt({ purpose, recipient, tone });
    const endpoint = "https://api.groq.com/openai/v1/chat/completions";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: "Groq request failed.",
          details: errorText,
        },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const generatedEmail = data.choices?.[0]?.message?.content?.trim() ?? "";

    if (!generatedEmail) {
      return NextResponse.json(
        { error: "Groq returned an empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ email: generatedEmail });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Unable to generate email.", details: message },
      { status: 500 },
    );
  }
}