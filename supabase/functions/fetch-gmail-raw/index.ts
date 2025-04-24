// deno run --allow-net --allow-env
import { serve } from "https://deno.land/std@0.205.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-provider-token',
}


const PROJECT_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(PROJECT_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

function qpDecode(raw: string) {
  return raw
    .replace(/=(\r\n?|\n)/g, "")                     // soft break
    .replace(/=([0-9A-F]{2})/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16)));
}

function partToText(node: any) {
  const b64 = node.body.data.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const txt = qpDecode(raw);
  return txt;
}

function extractBodies(payload: any) {
  let plain = "", html = "";

  const stack = [payload];
  while (stack.length) {
    const n = stack.pop();
    if (!n) continue;
    if (n.mimeType?.startsWith("text/plain") && n.body?.data && !plain) {
      plain = partToText(n);
    }
    if (n.mimeType?.startsWith("text/html") && n.body?.data && !html) {
      const txt = partToText(n)
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;|&#160;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      html = txt;
    }
    if (n.parts) stack.push(...n.parts);
  }
  return { plain, html };
}

serve(async req => {
  const { jwt: _jwt, accessToken, userId } = /* your auth boiler-plate here */ {};

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { ...CORS, 'Access-Control-Allow-Methods': 'POST, OPTIONS' },
    })
  }
  
  // 1. list the interesting messages
  const q = "(subscription OR receipt OR invoice OR payment)";
  const { messages = [] } = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500&q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  ).then(r => r.json());

  for (const { id } of messages) {
    const msg = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    ).then(r => r.json());

    const headers = Object.fromEntries(
      msg.payload.headers.map((h: any) => [h.name.toLowerCase(), h.value]),
    );
    const { plain, html } = extractBodies(msg.payload);

    await supabase.from("raw_emails").upsert({
      user_id:          userId,
      gmail_message_id: id,
      sent_at:          new Date(+msg.internalDate).toISOString(),
      sender:           headers.from,
      subject:          headers.subject,
      snippet:          msg.snippet,
      plain_text:       plain,
      html_text:        html,
    }, { onConflict: "user_id,gmail_message_id", ignoreDuplicates: true });
  }

  return new Response(JSON.stringify({ stored: messages.length }), {
    headers: { "Content-Type": "application/json", ...CORS },
  });
});
