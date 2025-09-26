const nodemailer = require('nodemailer');

class EmailServer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aapnidukaan612@gmail.com',
        pass: 'jopx vpfp xjty ktbj'
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: 'aapnidukaan612@gmail.com',
        to,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
}

module.exports = new EmailServer();