import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const eventId = url.searchParams.get('id')
  const userAgent = req.headers.get("user-agent") || ""

  if (!eventId) {
    return new Response("Missing event ID", { status: 400 })
  }

  // Define the target URL (Client-Side App)
  // Note: For branded links to work, make sure this points to your custom domain
  const appUrl = `https://athareg.com/#/agenda/${eventId}`

  // 1. Bot Detection Logic
  // Check if the request is from a crawler (WhatsApp, FB, Twitter, Slack, etc.)
  const isBot = /bot|facebookexternalhit|whatsapp|telegram|twitterbot|pinterest|slackbot|linkedinbot|embedly/i.test(userAgent);

  // 2. Perform Direct 302 Redirect for Real Users
  // This bypasses the script-blocking issue and is much faster for humans.
  if (!isBot) {
    console.log(`[Share] Redirecting human user to app: ${appUrl}`);
    return Response.redirect(appUrl, 302);
  }

  // 3. Serve HTML Meta Tags for Bots/Crawlers
  console.log(`[Share] Serving meta tags to bot: ${userAgent}`);

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
    // If event not found, redirect to home page as fallback
    return Response.redirect("https://athareg.com/", 302);
  }

  // Define metadata
  const title = event.seo_title || `Athar - ${event.event_name}`
  const description = event.seo_description || event.description || "انضم إلينا في هذا الحدث الرائع وتعرف على الأجندة والمتحدثين."
  
  const getImageUrl = (rawUrl: string | null) => {
    if (!rawUrl) return "https://athareg.com/logo.png" // Using a generic logo as fallback
    if (rawUrl.includes('drive.google.com')) {
      const idMatch = rawUrl.match(/[-\w]{25,}/);
      return idMatch ? `https://lh3.googleusercontent.com/d/${idMatch[0]}` : rawUrl;
    }
    return rawUrl;
  }
  
  const imageUrl = getImageUrl(event.seo_image_url || event.header_image_url)

  // Return HTML with Meta Tags ONLY (no scripts needed for crawlers)
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

    <meta property="og:site_name" content="Athar - أثر">
    <meta name="description" content="${description}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${req.url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${title}">
</head>
<body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
    <div style="text-align: center;">
        <h1 style="color: #1a27c9;">جاري توجيهك إلى منصة أثر...</h1>
        <p>إذا لم يتم توجيهك تلقائياً، <a href="${appUrl}">اضغط هنا</a></p>
    </div>
</body>
</html>
  `

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=UTF-8" },
  })
})
