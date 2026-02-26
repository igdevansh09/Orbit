import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from Orbit Notification Service!")

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    const record = payload.record 

    if (!record) {
      return new Response("No record found", { status: 200 })
    }

    console.log(`New post for ${record.company}. Fetching tokens...`)

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .neq('id', record.user_id) 
      .not('expo_push_token', 'is', null)

    if (error) throw error
    if (!profiles || profiles.length === 0) {
      return new Response("No users to notify", { status: 200 })
    }

    // 4. Create Expo Messages
    const messages = profiles.map(profile => ({
      to: profile.expo_push_token,
      sound: 'default',
      title: 'New Experience on Orbit! 🚀',
      body: `${record.username || 'Someone'} shared their ${record.company} (${record.role}) experience.`,
      data: { url: '/(tabs)/' },
    }))

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()
    console.log(`Sent ${messages.length} notifications.`)

    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } })

  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})