import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()

    // 1. Guard Clauses: Only process new inserts that have a description
    if (payload.type !== 'INSERT' || !payload.record?.description) {
      return new Response(JSON.stringify({ message: 'Ignored: Not an insert or missing description' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      })
    }

    const { id, description } = payload.record
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing in Edge Function environment")

    // 2. The LLM Call (Gemini)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const prompt = `You are a strict data extractor. Read this interview experience. 
Extract:
1. A list of specific technical questions asked.
2. A list of DSA or core computer science topics mentioned (e.g., Dynamic Programming, React, OS).
3. The total number of rounds mentioned (integer).

Return ONLY a valid JSON object matching this exact structure, with no markdown formatting and no extra text:
{
  "technical_questions": ["Question 1", "Question 2"],
  "dsa_topics": ["Topic 1", "Topic 2"],
  "rounds": 3
}
If data is missing, use empty arrays for lists and null for rounds.
Text: ${description}`

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" } // Force JSON output
      })
    })

    const geminiData = await geminiRes.json()
    
    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Gemini Response:", JSON.stringify(geminiData))
        throw new Error("Invalid response structure from Gemini")
    }

    const rawJsonString = geminiData.candidates[0].content.parts[0].text
    const extractedData = JSON.parse(rawJsonString)

    // 3. Inject back into Supabase using Service Role Key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabaseAdmin
      .from('experiences')
      .update({
        technical_questions: extractedData.technical_questions || [],
        dsa_topics: extractedData.dsa_topics || [],
        extracted_rounds: typeof extractedData.rounds === 'number' ? extractedData.rounds : null
      })
      .eq('id', id)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Extraction Error:", error.message)
    // Return 500 so the Supabase webhook logs register it as a failure
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, 
    })
  }
})