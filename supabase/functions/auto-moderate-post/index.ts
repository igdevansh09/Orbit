import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    
    // Only process on report insert
    if (payload.type !== 'INSERT') return new Response('Ignored', { status: 200 })

    const { experience_id } = payload.record

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Check exact report count to prevent infinite AI billing
    const { count, error: countError } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('experience_id', experience_id)

    if (countError) throw countError

    // ONLY TRIGGER ON EXACTLY 10 REPORTS.
    if (count !== 10) {
      return new Response(`Report count is ${count}, waiting for 10.`, { status: 200 })
    }

    // 2. Fetch the experience data
    const { data: expData, error: expError } = await supabaseAdmin
      .from('experiences')
      .select('*')
      .eq('id', experience_id)
      .single()

    if (expError || !expData) return new Response('Post already deleted or missing', { status: 200 })

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing")

    // 3. Assemble Prompt for Gemini (Text + Vision)
    const promptText = `You are a strict content moderator for a university job portal. Review this post.
Company: ${expData.company}
Role: ${expData.role}
Description: ${expData.description}

Determine if this is spam, completely fake, wildly inappropriate, or hate speech.
Return strict JSON: { "is_spam": boolean, "reason": "brief explanation" }`

    const contents: any[] = [{ parts: [{ text: promptText }] }]

    // If there is an image, we pass it to Gemini Vision via URL (Note: Gemini API requires base64 or File API, but for simple URLs we can ask it to analyze if it's a public URL, or rely on text primarily. For a true multi-modal call via REST, you generally need to fetch the image and convert to base64, which we skip here to avoid Deno timeout limits. We analyze the text mostly).
    
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        generationConfig: { response_mime_type: "application/json" }
      })
    })

    const geminiData = await geminiRes.json()
    const rawJsonString = geminiData.candidates[0].content.parts[0].text
    const analysis = JSON.parse(rawJsonString)

    // 4. Act on the AI's Decision
    if (analysis.is_spam) {
      // A. Delete the image from storage if it exists
      if (expData.image_url) {
        const pathParts = expData.image_url.split("experience-uploads/")
        if (pathParts.length > 1) {
          await supabaseAdmin.storage.from("experience-uploads").remove([pathParts[1]])
        }
      }

      // B. Delete the post (cascades and deletes the reports automatically)
      await supabaseAdmin.from('experiences').delete().eq('id', experience_id)

      // C. Inform the User via the Notification Table
      await supabaseAdmin.from('system_notifications').insert({
        user_id: expData.user_id,
        title: "Post Removed by Community Guidelines",
        message: `Your experience regarding ${expData.company} was flagged by the community and removed by moderation. Reason: ${analysis.reason}`
      })

      return new Response('Post deleted and user notified', { status: 200 })
    }

    return new Response('Post reviewed and marked safe', { status: 200 })

  } catch (error) {
    console.error("Moderation Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})