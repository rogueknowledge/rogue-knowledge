export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, topicType, question, whyCurious } = req.body;

    // Basic validation
    if (!name || !email || !question) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create email content
    const currentDate = new Date().toLocaleDateString();
    const emailContent = `
New Rogue Knowledge Question Submission

📝 CONTACT INFO:
Name: ${name}
Email: ${email}
Date: ${currentDate}

🔍 QUESTION CATEGORY: 
${topicType || 'Not specified'}

❓ QUESTION/TOPIC:
${question}

🤔 WHY THEY'RE CURIOUS:
${whyCurious || 'Not specified'}

---
Sent via Rogue Knowledge website form
    `.trim();

    // Use nodemailer with Gmail SMTP
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS  // Your Gmail App Password
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'reiambrade@gmail.com',
      subject: `New Rogue Knowledge Question: ${topicType || 'General Inquiry'}`,
      text: emailContent,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully!' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
