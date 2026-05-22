import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAI } from "@/lib/openai";
import {
  checkAndIncrementUsage,
  validateWidgetAccess,
} from "@/lib/chat-api";

const bodySchema = z.object({
  botId: z.string().uuid(),
  apiKey: z.string().min(10),
  message: z.string().min(1).max(4000),
  visitorId: z.string().min(1).max(128),
  conversationId: z.string().uuid().optional(),
});

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const { botId, apiKey, message, visitorId, conversationId } = parsed.data;

    const access = await validateWidgetAccess(botId, apiKey);
    if ("error" in access) {
      return NextResponse.json(
        { error: access.error },
        { status: 401, headers: corsHeaders(origin) },
      );
    }

    const { bot, workspace, admin } = access;

    const usageCheck = await checkAndIncrementUsage(
      admin,
      workspace.id,
      workspace.plan,
    );
    if ("error" in usageCheck) {
      return NextResponse.json(
        { error: usageCheck.error },
        { status: 429, headers: corsHeaders(origin) },
      );
    }

    let convId = conversationId;

    if (convId) {
      const { data: existing } = await admin
        .from("conversations")
        .select("id")
        .eq("id", convId)
        .eq("bot_id", botId)
        .eq("workspace_id", workspace.id)
        .maybeSingle();

      if (!existing) convId = undefined;
    }

    if (!convId) {
      const { data: conv, error: convError } = await admin
        .from("conversations")
        .insert({
          workspace_id: workspace.id,
          bot_id: botId,
          visitor_id: visitorId,
        })
        .select("id")
        .single();

      if (convError || !conv) {
        return NextResponse.json(
          { error: "Could not start conversation" },
          { status: 500, headers: corsHeaders(origin) },
        );
      }
      convId = conv.id;
    }

    await admin.from("messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    });

    const { data: history } = await admin
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(20);

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: bot.system_prompt },
        ...(history ?? []).map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      max_tokens: 500,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "Sorry, I could not generate a response.";

    const tokens = completion.usage?.total_tokens ?? 0;

    await admin.from("messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: reply,
      tokens_used: tokens,
    });

    return NextResponse.json(
      {
        reply,
        conversationId: convId,
      },
      { headers: corsHeaders(origin) },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { error: msg },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
