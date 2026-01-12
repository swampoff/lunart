import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Gallery {
  name: string;
  email: string;
}

interface Artwork {
  title: string;
  title_en: string;
  image_url: string;
  price: number;
  price_usd: number;
}

interface NewsletterRequest {
  galleries: Gallery[];
  subject: string;
  message: string;
  artwork?: Artwork | null;
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  
  if (!RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Luna Gallery <gallery@resend.dev>",
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || "Failed to send" };
    }

    return { success: true, id: data.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { galleries, subject, message, artwork }: NewsletterRequest = await req.json();

    if (!galleries || galleries.length === 0) {
      throw new Error("No galleries provided");
    }

    const results = [];
    
    for (const gallery of galleries) {
      const artworkSection = artwork ? `
        <div style="margin: 30px 0; text-align: center;">
          <img src="${artwork.image_url}" alt="${artwork.title_en}" style="max-width: 100%; max-height: 400px; border-radius: 8px;" />
          <h3 style="margin-top: 16px; font-size: 20px; color: #333;">${artwork.title}</h3>
          <p style="color: #666; margin-top: 8px;">Price: $${artwork.price_usd.toLocaleString('en-US')}</p>
        </div>
      ` : '';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 32px; font-weight: 300; margin: 0;">Luna Gallery</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.8;">Dear ${gallery.name},</p>
          
          <div style="font-size: 16px; line-height: 1.8; white-space: pre-wrap;">${message}</div>
          
          ${artworkSection}
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #666;">
              Best regards,<br>
              Luna Gallery<br>
              <a href="https://lunagallery.art" style="color: #333;">lunagallery.art</a>
            </p>
          </div>
        </body>
        </html>
      `;

      const result = await sendEmail(gallery.email, subject, htmlContent);
      results.push({ email: gallery.email, ...result });
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Newsletter sent: ${successCount}/${galleries.length} successful`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        total: galleries.length,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);