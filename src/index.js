import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import fetch from 'node-fetch';
import util from 'util';

const app = express();

// Updated CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = ['https://techzyla.com', 'http://localhost:5173', null];
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

// Force HTTPS in production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] === 'http'
  ) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = mysql.createPool(dbConfig);
pool.getConnection = util.promisify(pool.getConnection);

const connectWithRetry = async (retries = 10, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('Connected to database');
      connection.release();
      return pool;
    } catch (err) {
      console.error(`Connection failed (attempt ${i + 1}/${retries}):`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

connectWithRetry().catch(err => {
  console.error('Failed to connect to database after retries:', err.message);
  process.exit(1);
});

// Contact form API
app.post('/api/contact', (req, res) => {
  const { name, email, phone, service, message } = req.body;
  console.log('Received contact request:', { name, email, phone, service, message }); // Log request
  pool.query(
    'INSERT INTO contact_messages (name, email, phone, service, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, service, message],
    (err, result) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Database connection failed' });
      }
      res.json({ success: true });
    }
  );
});

// Feedback API
app.post('/api/feedback', (req, res) => {
  const { name, role, company, rating, message } = req.body;
  console.log('Received feedback request:', { name, role, company, rating, message }); // Log request
  pool.query(
    'INSERT INTO feedback (name, role, company, rating, message) VALUES (?, ?, ?, ?, ?)',
    [name, role, company, rating, message],
    (err, result) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Database connection failed' });
      }
      res.json({ success: true });
    }
  );
});

// Public IP endpoint
app.get('/get-ip', async (req, res) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.send(data.ip);
  } catch (error) {
    res.status(500).send('Error fetching public IP');
  }
});

// --- AI Chatbot Endpoint (Groq LLM, NO file upload support) ---
app.post('/chat', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  const userQuestion = req.body.message || "";

  // Company knowledge base (full content)
  const knowledgeBase = `
### Company Overview
- TechZyla is a forward-thinking software company based in Manchester, UK, founded in 2023.
- Specializes in AI solutions, full-stack website development, graphic designing, social media management, and SEO optimization.
- Works with clients across the UK and internationally, serving all industries (e-commerce, healthcare, finance, education, etc.).
- Mission: Empower businesses through innovative, scalable digital solutions.
- Vision: Enable businesses of all sizes to harness technology for growth and success.

### Contact Information
- Address: 123 Business Street, Manchester, M1 1AB, United Kingdom
- Email: info@techzyla.com, support@techzyla.com
- WhatsApp: +44 7477 579000
- Business Hours: Monday–Friday, 9am–6pm (UK time)
- Contact Form: Available on website for project inquiries.

### Services Offered
#### AI Solutions
- AI-powered chatbots and agents for 24/7 customer engagement.
- Custom AI agent development (automation, analytics, process optimization).
- Machine learning, predictive analytics, custom AI model training.

#### Full-Stack Website Development
- Modern, responsive, and secure websites for all industries.
- User-friendly CMS integration, e-commerce, performance optimization, secure hosting.

#### Graphic Designing
- Brand identity, banners, marketing materials, UI/UX design, animation, motion graphics.

#### Social Media Management
- Content strategy, regular posting, community engagement, analytics, paid campaigns.

#### SEO Optimization
- Website audit, keyword research, on-page/technical SEO, performance reporting.

### Payment Methods
- PayPal, Wise, UK Bank Transfer, JazzCash, EasyPaisa, Crypto (BTC, USDT).

### Support
- 24/7 responsive support for all clients.
- Ongoing maintenance and support packages available.

### Project Process
- Discovery: Understanding business goals and challenges.
- Planning: Strategy and roadmap.
- Development: Building solutions with latest technologies.
- Launch & Support: Deployment, monitoring, ongoing support.

### Testimonials
- Clients report improved efficiency, cost savings, increased traffic, and high satisfaction with TechZyla’s AI and digital solutions.

### FAQ Highlights
- Industries served: E-commerce, healthcare, finance, education, more.
- Project timelines: Most websites delivered in 3–6 weeks.
- Custom AI: Yes, custom AI agents and automation tools available.
- Data security: Follows industry best practices for data security and privacy.
- Pricing: Depends on project scope; free quote available.
- SEO: Proven strategies to boost search rankings and drive organic traffic.
- Feedback: Client feedback and changes are welcome during the project.

### Core Values
- Innovation, transparency, client-centric approach, data security, and continuous improvement.
  `;

  // Prompt with rules
  const prompt = `
You are TechZyla's AI customer support assistant. Here's your knowledge base:
${knowledgeBase}

Strict Response Formatting Rules:
1. Always use clear section headers starting with ###
2. Use bullet points for lists (start with - )
3. Separate sections with two newlines (\\n\\n)
4. For pricing, always use markdown tables
5. Never combine different concepts in one paragraph
6. Maximum 3 bullet points per section
7. End with a clear next step/question
8. Always reply in the same language as the user's question (Urdu, English, etc.)
9. If the question is not directly answered in the knowledge base, generate a response based on your understanding of TechZyla.


Additional Instruction:
If the user's question is related to the company but the information is not found directly in the knowledge base, generate your own answer using your general understanding of the company.

User: ${userQuestion}
`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: userQuestion }
        ],
        max_tokens: 600
      })
    });

    const data = await groqRes.json();
    console.log('Groq API response:', data); // <-- Add this line
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand.";
    res.json({ reply });
  } catch (error) {
    console.error('Groq API error:', error?.response?.data || error.message || error);
    res.json({ reply: "Sorry, AI service error." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


