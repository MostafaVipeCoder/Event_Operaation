import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const eventId = url.searchParams.get('id')

  if (!eventId) {
    return new Response("Missing event ID", { status: 400 })
  }

  // Initialize Supabase Client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Fetch event data
  const { data: event, error } = await supabaseClient
    .from('events')
    .select('event_name, description, header_image_url, seo_title, seo_description, seo_image_url')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    return new Response("Event not found", { status: 404 })
  }

  // Define metadata
  const title = event.seo_title || `Athar | ${event.event_name}`
  const description = event.seo_description || event.description || "انضم إلينا في هذا الحدث الرائع وتعرف على الأجندة والمتحدثين."
  
  // Use a helper for Google Drive links if needed (simplified version for server-side)
  const getImageUrl = (rawUrl) => {
    if (!rawUrl) return "https://mostafavipecoder.github.io/Event_Operaation/vite.svg"
    if (rawUrl.includes('drive.google.com')) {
      const id = rawUrl.match(/[-\w]{25,}/);
      return id ? `https://lh3.googleusercontent.com/d/${id}` : rawUrl;
    }
    return rawUrl;
  }
  
  const imageUrl = getImageUrl(event.seo_image_url || event.header_image_url)
  const appUrl = `https://mostafavipecoder.github.io/Event_Operaation/#/agenda/${eventId}`

  // Return HTML with Meta Tags and JS Redirect
  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${req.url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${req.url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">

    <!-- Redirection Logic -->
    <meta http-equiv="refresh" content="0;url=${appUrl}">
    <script>
        window.location.href = "${appUrl}";
    </script>
</head>
<body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
    <div style="text-align: center;">
        <h1 style="color: #1a27c9;">جاري توجيهك إلى الفعالية...</h1>
        <p>إذا لم يتم توجيهك تلقائياً، <a href="${appUrl}">اضغط هنا</a></p>
    </div>
</body>
</html>
  `

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=UTF-8" },
  })
})
