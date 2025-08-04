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
    const emailText = `
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

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rogue Knowledge <onboarding@resend.dev>',
        to: ['reiambrade@gmail.com'],
        subject: `New Rogue Knowledge Question: ${topicType || 'General Inquiry'}`,
        text: emailText,
        reply_to: email
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email via Resend');
    }

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
