// MailTemplate/joinEmailTemplate.js

function createMettingTemplate(userName, meetingType, meetingRepeat, meetingLink) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
      <p>Hi ${userName},</p>
      <p>You have successfully joined the meeting: <strong>${meetingType}</strong>.</p>
      <p><strong>Repeats:</strong> ${meetingRepeat}</p>
      ${meetingLink ? `<p><a href="${meetingLink}" style="display:inline-block; padding:10px 15px; background-color:#007bff; color:#fff; text-decoration:none; border-radius:5px;">Join Meeting</a></p>` : ''}
      <p>See you there!</p>
    </div>
  </div>
  `;
}

module.exports = createMettingTemplate;
