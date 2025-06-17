# TechZyla Backend

Backend server for TechZyla website deployed on Render.

## Files Structure
```
backend/
├── src/
│   └── index.js          # Main server file
├── package.json          # Dependencies
├── render.yaml          # Render deployment config
├── .gitignore           # Git ignore file
└── README.md            # This file
```

## Required Environment Variables on Render

```
DB_HOST=your-hostinger-mysql-host
DB_USER=your-hostinger-mysql-user
DB_PASS=your-hostinger-mysql-password
DB_NAME=your-hostinger-database-name
GROQ_API_KEY=your-groq-api-key
NODE_ENV=production
```

## API Endpoints

- `GET /` - Health check
- `POST /api/contact` - Contact form submissions
- `POST /api/feedback` - Feedback submissions
- `POST /chat` - AI Chatbot API
- `GET /get-ip` - Get public IP

## Deployment Steps

1. Create new GitHub repository for backend
2. Upload these files to repository
3. Connect repository to Render
4. Set environment variables in Render dashboard
5. Deploy service

## Database Tables Required

### contact_messages
```sql
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  service VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### feedback
```sql
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  company VARCHAR(255),
  rating INT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
