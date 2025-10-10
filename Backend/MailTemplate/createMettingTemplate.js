// MailTemplate/joinEmailTemplate.js

function createMettingTemplate(userName, meetingType, meetingLink) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SamZara Welcome</title>
  </head>
  <body style="font-family:Poppins, Arial, sans-serif; margin:0; background:#ffffff; line-height:1.6;">
    
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="background:#f59e48; padding:32px 0 0 0; text-align:center;">
      <img src="https://res.cloudinary.com/dq2p7tmc2/image/upload/v1758883566/LOGO_iifv8c.png" alt="SamZara Logo" style="max-width:400px; margin-bottom:20px;" />
      <div style="background:#ffffff; max-width:720px; margin:0 auto; padding:24px 16px; border-bottom:1px solid #666;">
        <h1 style="font-size:22px; font-weight:700; margin:8px 0; color:#000000; text-align:center;">
          Welcome to SamZara – <br> A Community for Healing & Hope
        </h1>
      </div>
    </div>

    <!-- Content Section -->
    <div style="background:#ffffff; max-width:720px; margin:0 auto; padding:30px 20px; text-align:left; box-shadow:0 8px 16px rgba(0,0,0,0.15);">
      <p style="font-size:15px; color:#000;"><strong>Hello ${userName},</strong></p>

      <p style="font-size:15px; color:#666;">
  your <b>${meetingType}</b> meeting has been successfully created on SamZara.
</p>

<p style="font-size:15px; color:#666;">
  You are now the host of this meeting and can manage participants, share resources, and facilitate discussions for a meaningful session.
</p>

<p style="font-size:15px; color:#666;">
  This <b>${meetingType}</b> meeting is your opportunity to guide, support, and build a strong community of individuals seeking growth and recovery.
</p>

<p style="font-size:15px; color:#666;">
  Thank you for taking the initiative to create a safe and supportive space for others. Your commitment to fostering connection and healing is appreciated.
</p>

<p style="font-size:15px; color:#666;">
  We look forward to the success of your <b>${meetingType}</b> meeting and the positive impact it will have on the SamZara community.
</p>

      <p style="font-size:15px; color:#000; margin-top:20px;">Here, you will find:</p>
      <ul style="font-size:15px; color:#666; padding-left:20px;">
        <li>Access to online meetings with people across India on the road to recovery</li>
        <li>A safe, non-judgmental space to share and learn</li>
        <li>Encouragement to move forward, one step at a time</li>
      </ul>
      <!-- Call to Action Button -->
      <div style="text-align:center; margin-top:24px;">
       ${meetingLink ? `<a href="${meetingLink}"
           style="display:inline-block; background:#1f4fa8; color:#ffffff; font-weight:600; 
                  padding:14px 28px; border-radius:8px; text-decoration:none; text-align:center;">
            Meeting Link
        </a>`: ''}
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f59e48; padding:16px; margin-top:24px; text-align:center; color:#ffffff; font-size:14px; font-weight:500;">
      SamZara – India’s first social network for a social cause, dedicated to supporting
      addicts and families on the path to recovery.
    </div>
</div>
  </body>
  </html>
  `;
}

module.exports = createMettingTemplate;
