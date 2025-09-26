function joinEmailTemplate(user, meeting) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SamZara Welcome</title>
  </head>
  <body style="font-family:Poppins, Arial, sans-serif; margin:0; background:#ffffff; line-height:1.6;">
    
    <!-- Hero Section -->
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
      <p style="font-size:15px; color:#000;"><strong>Hello ${user.name},</strong></p>

      <p style="font-size:15px; color:#666;">
        Thank you for joining <b>SamZara</b>. This is your first step towards a healthier
        and more fulfilling life.
      </p>

      <p style="font-size:15px; color:#666;">
        <b>SamZara</b> is more than a platform – it is a supportive community for addicts
        and their families, built on understanding, compassion, and shared strength.
        Thank you for joining the <b>${meeting.meetingType}</b> Meeting. SamZara provides a certificate
        of participation to recognize your commitment to recovery.
      </p>

      <p style="font-size:15px; color:#000; margin-top:20px;">Here, you will find:</p>
      <ul style="font-size:15px; color:#666; padding-left:20px;">
        <li>Access to online meetings with people across India on the road to recovery</li>
        <li>A safe, non-judgmental space to share and learn</li>
        <li>Encouragement to move forward, one step at a time</li>
        <li>Go to <a href="https://community.samzra.in" target="_blank" style="color:#1f4fa8;">community.samzra.in</a>, 
            click on <strong>Attendance</strong>, and get your participation certificate</li>
      </ul>

      <!-- Call to Action Button -->
      <div style="text-align:center; margin-top:24px;">
        <a href="https://community.samzara.in" 
           style="display:inline-block; background:#1f4fa8; color:#ffffff; font-weight:600; 
                  padding:14px 28px; border-radius:8px; text-decoration:none; text-align:center;">
           Join Meeting & Get Certificate
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f59e48; padding:16px; margin-top:24px; text-align:center; color:#ffffff; font-size:14px; font-weight:500;">
      SamZara – India’s first social network for a social cause, dedicated to supporting
      addicts and families on the path to recovery.
    </div>

  </body>
  </html>
  `;
}

module.exports = joinEmailTemplate;
