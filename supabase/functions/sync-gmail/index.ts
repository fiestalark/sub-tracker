import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.205.0/http/server.ts"


/* ────────────────────────────────────────────────────────────── */
/* 0.  Environment variables                                     */
/*     (add SUPABASE_SERVICE_ROLE_KEY in the dashboard if needed)*/
const PROJECT_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
/* ────────────────────────────────────────────────────────────── */

/* ------------------------------------------------------------------ */
/* heuristic: does this message look like a recurring‑payment email?  */
/* ------------------------------------------------------------------ */
const SUB_KEYWORDS = [
  'subscription', 'renewal', 'billed', 'charged',
  'auto‑pay', 'your plan', 'membership', 'receipt', 'invoice', 'payment'
]

function looksLikeSubscription(
  subject: string,
  snippet: string,
  sender: string
) {
  const haystack = (subject + ' ' + snippet).toLowerCase()

  // a) must mention a keyword
  if (!SUB_KEYWORDS.some(k => haystack.includes(k))) return false

  // b) must show a currency sign + digits
  if (!/[$€£]\s?\d/.test(haystack)) return false

  // c) skip mail from generic personal domains
  if (/@(gmail|yahoo|outlook)\./i.test(sender)) return false

  return true
}


/* temp client – just to verify the incoming JWT                 */
const authClient = createClient(PROJECT_URL, ANON_KEY, {
  auth: { persistSession: false }
})

const CORS = {
  'Access-Control-Allow-Origin': '*',   // change to your prod domain later
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-provider-token',
}

serve(async (req) => {
  /* pre‑flight -------------------------------------------------- */
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { ...CORS, 'Access-Control-Allow-Methods': 'POST, OPTIONS' },
    })
  }

  /* 1.  Validate the JWT that came from the browser ------------- */
  const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const { data: auth, error: authErr } = await authClient.auth.getUser(jwt)
  if (authErr) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: CORS,
    })
  }
  const userId = auth.user.id

  /* 2.  Real client – impersonates the user for RLS ------------- */
  const supabase = createClient(PROJECT_URL, SERVICE_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth:   { persistSession: false },
  })

  /* 3.  Fetch Google token & watermark ------------------------- */
const { data: userRow } = await supabase
.from('users')
.select('id, email, provider_token, last_internal_date')
.eq('id', userId)
.maybeSingle()                                   // ← null if row missing

const accessToken =
userRow?.provider_token || req.headers.get('x-provider-token')

if (!accessToken) {
return new Response(
  JSON.stringify({ error: 'no_google_token' }),
  { status: 403, headers: CORS },
)
}

/* store token on first run ------------------------------------ */
if (!userRow) {
// first login ➜ create the users row with the required email
const { error: dbErr } = await supabase.from('users').insert({
  id:             userId,
  email:          auth.user.email,               // comes from Supabase Auth
  provider_token: accessToken,
})
if (dbErr) console.error('DB error (users insert)', dbErr)

} else if (!userRow.provider_token) {
// row exists but token was empty ➜ update just that column
const { error: dbErr } = await supabase
  .from('users')
  .update({ provider_token: accessToken })
  .eq('id', userId)
if (dbErr) console.error('DB error (users update)', dbErr)
}


  /* 4.  List & parse e‑mails ------------------------------------ */
  const ninetyDays  = 1000 * 60 * 60 * 24 * 90
  const sinceMs     =
    userRow?.last_internal_date ?? Date.now() - ninetyDays

  const q = `(subscription OR receipt OR invoice OR payment) after:${Math.floor(
    sinceMs / 1000
  )}`
  const listURL =
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=200&q=${encodeURIComponent(
      q
    )}`

  const listResp = await fetch(listURL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!listResp.ok) {
    return new Response(
      JSON.stringify({
        error:  'gmail_api_error',
        status: listResp.status,
        detail: await listResp.text(),
      }),
      { status: listResp.status, headers: CORS }
    )
  }

  const listJson = await listResp.json()
  const ids      = (listJson.messages ?? []).map((m: any) => m.id)

  let newest   = sinceMs
  let inserted = 0
  const unparsed: any[] = []

  for (const id of ids) {
    const metaURL =
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`  
    const msg = await (
      await fetch(metaURL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    ).json()
    
    function qpDecode(str: string): string {
      // soft line‑breaks (=⏎) → remove
      str = str.replace(/=(\r\n|\r|\n)/g, "");
      // =XX hex → byte
      return str.replace(/=([0-9A-F]{2})/gi, (_, h) =>
        String.fromCharCode(parseInt(h, 16))
      );
    }

    /* ❷ helper: grab decoded text/plain ------------------------- */
    function extractPlainText(payload: any): string {
      // --- depth‑first walk ----------------------------------------------------
      const stack: any[] = [payload];
    
      while (stack.length) {
        const node = stack.pop();
        if (!node) continue;
    
        // we only care about leaf parts that carry data
        if (!node.body?.data) {
          if (node.parts) stack.push(...node.parts);
          continue;
        }
    
        // 1) base‑64 → raw string
        const raw =
          atob(node.body.data.replace(/-/g, "+").replace(/_/g, "/"));
    
        // 2) quoted‑printable → string  (handles “=XX” and soft line breaks “=\n”)
        const qp = raw                                  // remove soft breaks
          .replace(/=(?:\r\n?|\n)/g, "")
          .replace(/=([0-9A-F]{2})/gi, (_, h) =>
            String.fromCharCode(parseInt(h, 16)),
          );
    
        // 3) plain or html?
        if (node.mimeType?.startsWith("text/plain")) {
          return qp;
        }
        if (node.mimeType?.startsWith("text/html")) {
          return qp
            .replace(/<[^>]+>/g, " ")          // strip tags
            .replace(/&nbsp;|&#160;/gi, " ")   // entities → space
            .replace(/\s+/g, " ")              // collapse whitespace
            .trim();
        }
      }
      return ""; // none found
    }
    
    
    const headers = Object.fromEntries(
      msg.payload.headers.map((h: any) => [h.name.toLowerCase(), h.value])
    )
    const subject      = headers.subject ?? ''
    const sender       = headers.from ?? ''
    const internalDate = Number(msg.internalDate)
    if (internalDate > newest) newest = internalDate

    /* inside the loop, right after we build `headers` … ---------- */
    const bodyText  = extractPlainText(msg);
    const haystack = `${subject} ${msg.snippet} ${bodyText}`
      .replace(/\u00A0/g, " ")                          // ← NB‑space
      .replace(/[\u034F\u200B-\u200D\u2060\uFEFF]/g, "");// zero‑width
  

    if (subject.includes("JACK INGRAM MEDIA") || subject.includes("Railway")) {
      console.log("‑‑‑ DEBUG haystack ‑‑‑");
      console.log(haystack);
      console.log("amountMatch =", /(?:[$€£]|usd|eur|cad)\s*\d[\d.,]*/i.exec(haystack));
    }

    
    /* tighter amount regex: must have currency sign + digits ----- */
    const amountMatch = /(?:[$€£]|usd|eur|cad)\s?\d[\d.,]*/i.exec(haystack);
  


    /* fallback vendor for Stripe receipts ------------------------ */
    let extractedVendorName: string | null = null
    const domainMatch = /@([\w.-]+\.\w{2,})/.exec(sender)

    if (domainMatch && domainMatch[1]) {
      extractedVendorName = domainMatch[1]
    } else if (sender.toLowerCase().endsWith('@stripe.com')) {
      const receiptMatch = /Receipt from ([A-Z0-9 ._-]+)/i.exec(subject)
      if (receiptMatch && receiptMatch[1]) {
        extractedVendorName = receiptMatch[1]
          .trim()
          .replace(/\s+/g, '_')   // ← one back‑slash
      }
    }

    let errorReason = ''

    if (!amountMatch)          errorReason = 'no_amount'
    else if (!extractedVendorName) errorReason = 'no_vendor'
    else if (!looksLikeSubscription(subject, msg.snippet, sender))
                                errorReason = 'failed_heuristic'

    if (
      amountMatch &&
      extractedVendorName &&
      looksLikeSubscription(subject, msg.snippet, sender)
    ) {
      const amountText = amountMatch[0].replace(/[^0-9.]/g, '')
      const amount = Number(amountText)
      const { error: dbErr }   = await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id:      userId,
            vendor_name:  extractedVendorName,
            amount,
            currency:     'USD',
            email_date:   new Date(internalDate).toISOString(),
            email_subject: subject,
            email_sender:  sender
          },
          { onConflict: 'user_id,vendor_name', ignoreDuplicates: true }
        )
    
      if (dbErr) console.error('DB error (subscriptions)', dbErr)
      else       inserted += 1
    } else {
      unparsed.push({ subject, sender, date: new Date(internalDate).toISOString() })
      const { error: dbErr } = await supabase.from('unparsed_emails').insert({
        user_id:         userId,
        gmail_message_id: id,
        subject,
        sender,
        message_date:    new Date(internalDate).toISOString(),
        parse_error:      errorReason || 'unknown',
      })
      if (dbErr) console.error('DB error (unparsed_emails)', dbErr)
    }
  }

  /* 5.  Update watermark & aggregates --------------------------- */
  await supabase.from('users')
    .update({ last_internal_date: newest })
    .eq('id', userId)

  const { data: totals } = await supabase.rpc('calc_totals', {
    p_user_id: userId,
  })

  return new Response(
    JSON.stringify({
      processed:           ids.length,
      insertedSubscriptions: inserted,
      totals:              totals?.monthly_yearly ?? {},
      upcomingRenewals:    totals?.next_renewals ?? [],
      categoryBreakdown:   totals?.by_category ?? [],
      unparsed,
      moreAvailable:       listJson.resultSizeEstimate > 200,
    }),
    { status: 200, headers: CORS }
  )
})
