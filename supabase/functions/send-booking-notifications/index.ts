import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface BookingData {
  booking_id: string;
  slot_id: string;
  mentor_id: string;
  event_id: string;
  company_name: string;
  booker_email: string;
  start_time: string;
  end_time: string;
  mentor_name: string;
  mentor_email: string;
  mentor_photo_url?: string;
  event_name?: string;
  admin_email?: string;
}

// Generate ICS (iCalendar) file content
function generateICS(data: BookingData): string {
  const uid = `${data.booking_id}@athareg.com`;
  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const start = new Date(data.start_time).toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const end = new Date(data.end_time).toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Athar//Mentor Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
DTSTAMP:${now}
UID:${uid}
ATTENDEE;CN="${data.company_name}";RSVP=TRUE:mailto:${data.booker_email}
ATTENDEE;CN="${data.mentor_name}";RSVP=TRUE:mailto:${data.mentor_email}
${data.admin_email ? `ATTENDEE;CN="Event Admin";RSVP=FALSE:mailto:${data.admin_email}` : ""}
CREATED:${now}
DESCRIPTION:حجز جلسة مرشد مع ${data.mentor_name} لشركة ${data.company_name}
LAST-MODIFIED:${now}
LOCATION:Online
ORGANIZER;CN="Athar":mailto:no-reply@athareg.com
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:جلسة مرشد: ${data.mentor_name} مع ${data.company_name}
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;
}

// Generate HTML email templates
function generateBookerEmail(data: BookingData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد الحجز - جلسة مرشد</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
        .container { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a27c9 0%, #2d3af0 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background-color: #f0f4ff; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-right: 4px solid #1a27c9; }
        .info-box p { margin: 10px 0; }
        .info-box strong { color: #1a27c9; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تم تأكيد حجز جلستك!</h1>
        </div>
        <div class="content">
            <p>مرحباً بك،</p>
            <p>شكراً لحجزك جلسة مرشد! إليك تفاصيل الحجز:</p>
            
            <div class="info-box">
                <p><strong>المرشد:</strong> ${data.mentor_name}</p>
                <p><strong>الشركة:</strong> ${data.company_name}</p>
                <p><strong>التاريخ والوقت:</strong> ${new Date(data.start_time).toLocaleString('ar-EG')}</p>
                <p><strong>المدة:</strong> ${Math.round((new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / (1000 * 60))} دقيقة</p>
                ${data.event_name ? `<p><strong>الحدث:</strong> ${data.event_name}</p>` : ''}
            </div>
            
            <p>تم إرسال دعوة التقويم إلى بريدك الإلكتروني. يرجى قبول الدعوة لإضافة الجلسة إلى تقويمك.</p>
            
            <p>إذا كانت لديك أي استفسارات، فلا تتردد في التواصل معنا.</p>
            
            <p>مع أطيب التحيات،<br>فريق أثر</p>
        </div>
        <div class="footer">
            <p>© 2024 أثر. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
  `;
}

function generateMentorEmail(data: BookingData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>حجز جلسة جديدة!</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
        .container { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a27c9 0%, #2d3af0 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background-color: #f0f4ff; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-right: 4px solid #1a27c9; }
        .info-box p { margin: 10px 0; }
        .info-box strong { color: #1a27c9; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>لديك حجز جلسة جديد!</h1>
        </div>
        <div class="content">
            <p>مرحباً ${data.mentor_name}،</p>
            <p>تهانينا! لقد تم حجز جلسة معك! إليك التفاصيل:</p>
            
            <div class="info-box">
                <p><strong>الشركة:</strong> ${data.company_name}</p>
                <p><strong>بريد الحاجز:</strong> ${data.booker_email}</p>
                <p><strong>التاريخ والوقت:</strong> ${new Date(data.start_time).toLocaleString('ar-EG')}</p>
                <p><strong>المدة:</strong> ${Math.round((new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / (1000 * 60))} دقيقة</p>
                ${data.event_name ? `<p><strong>الحدث:</strong> ${data.event_name}</p>` : ''}
            </div>
            
            <p>تم إرسال دعوة التقويم إلى بريدك الإلكتروني. يرجى قبول الدعوة لإضافة الجلسة إلى تقويمك.</p>
            
            <p>إذا كانت لديك أي استفسارات، فلا تتردد في التواصل معنا.</p>
            
            <p>مع أطيب التحيات،<br>فريق أثر</p>
        </div>
        <div class="footer">
            <p>© 2024 أثر. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
  `;
}

function generateAdminEmail(data: BookingData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إشعار بحجز جلسة جديدة</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
        .container { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a27c9 0%, #2d3af0 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background-color: #f0f4ff; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-right: 4px solid #1a27c9; }
        .info-box p { margin: 10px 0; }
        .info-box strong { color: #1a27c9; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>إشعار بحجز جلسة جديدة</h1>
        </div>
        <div class="content">
            <p>مرحباً،</p>
            <p>يوجد حجز جلسة مرشد جديد! إليك التفاصيل:</p>
            
            <div class="info-box">
                <p><strong>المرشد:</strong> ${data.mentor_name}</p>
                <p><strong>الشركة:</strong> ${data.company_name}</p>
                <p><strong>بريد الحاجز:</strong> ${data.booker_email}</p>
                <p><strong>التاريخ والوقت:</strong> ${new Date(data.start_time).toLocaleString('ar-EG')}</p>
                <p><strong>المدة:</strong> ${Math.round((new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / (1000 * 60))} دقيقة</p>
                ${data.event_name ? `<p><strong>الحدث:</strong> ${data.event_name}</p>` : ''}
            </div>
            
            <p>مع أطيب التحيات،<br>فريق أثر</p>
        </div>
        <div class="footer">
            <p>© 2024 أثر. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
  `;
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 405
      });
    }

    const bookingData: BookingData = await req.json();
    console.log('[Booking Notifications] Received data:', bookingData);

    const icsContent = generateICS(bookingData);
    const icsBase64 = btoa(unescape(encodeURIComponent(icsContent)));
    const icsFileName = `mentor-booking-${bookingData.booking_id}.ics`;

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const emails = [];

    // 1. Email to Booker
    emails.push({
      from: 'no-reply@athareg.com',
      to: bookingData.booker_email,
      subject: `تم تأكيد حجز جلستك مع ${bookingData.mentor_name}!`,
      html: generateBookerEmail(bookingData),
      attachments: [
        {
          filename: icsFileName,
          content: icsBase64,
          content_type: 'text/calendar; method=REQUEST; charset=utf-8'
        }
      ]
    });

    // 2. Email to Mentor
    emails.push({
      from: 'no-reply@athareg.com',
      to: bookingData.mentor_email,
      subject: `حجز جلسة جديدة مع ${bookingData.company_name}!`,
      html: generateMentorEmail(bookingData),
      attachments: [
        {
          filename: icsFileName,
          content: icsBase64,
          content_type: 'text/calendar; method=REQUEST; charset=utf-8'
        }
      ]
    });

    // 3. Email to Admin (if provided)
    if (bookingData.admin_email) {
      emails.push({
        from: 'no-reply@athareg.com',
        to: bookingData.admin_email,
        subject: `إشعار: حجز جلسة مرشد جديد في ${bookingData.event_name || 'الحدث'}`,
        html: generateAdminEmail(bookingData)
      });
    }

    // Send emails using Resend if available
    if (RESEND_API_KEY) {
      console.log('[Booking Notifications] Sending emails via Resend...');
      
      for (const email of emails) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(email)
        });

        const result = await res.json();
        console.log('[Booking Notifications] Resend response:', result);

        if (!res.ok) {
          console.error('[Booking Notifications] Failed to send email:', result);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Emails sent successfully',
        emails_sent: emails.length 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } else {
      console.warn('[Booking Notifications] RESEND_API_KEY not set, emails not sent');
      
      // Store notifications in the database for later processing (optional)
      const { error: dbError } = await supabase
        .from('booking_notifications')
        .insert({
          booking_id: bookingData.booking_id,
          recipients: emails.map(e => e.to),
          data: bookingData,
          sent_at: new Date().toISOString(),
          status: RESEND_API_KEY ? 'sent' : 'pending'
        });

      if (dbError) {
        console.error('[Booking Notifications] Failed to log notification:', dbError);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Notification received (emails pending API key)',
        emails_pending: emails.length 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }
  } catch (error) {
    console.error('[Booking Notifications] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
