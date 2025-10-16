# Resume Optimizer

A full-stack AI-powered resume optimization application that helps job seekers tailor their resumes to specific job postings using Google Gemini AI.

## Features

- 🔐 User authentication (register/login)
- 📄 Resume management (upload, store, and manage multiple resumes)
- 💼 Job posting management (save and organize job postings)
- 🤖 AI-powered resume analysis using Google Gemini
- 📊 Detailed comparison reports with match scores
- 💡 Actionable recommendations for resume improvement

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Google Gemini AI API
- bcryptjs for password hashing

### Frontend
- React 18
- Vite
- React Router
- Axios
- Context API for state management

## Project Structure

```
resume-optimizer/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── JobPosting.js
│   │   └── Comparison.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resumes.js
│   │   ├── jobs.js
│   │   └── comparisons.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Database Schema

### User
- name, email, password (hashed)
- Timestamps

### Resume
- user (reference)
- title, content
- parsedData (structured resume information)
- Timestamps

### JobPosting
- user (reference)
- title, company, description
- parsedData (structured job requirements)
- url (optional)
- Timestamps

### Comparison
- user, resume, jobPosting (references)
- analysis (match scores, recommendations)
- geminiResponse
- Timestamps

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your credentials:
   - Set your MongoDB URI
   - Set your JWT secret
   - Set your Gemini API key

5. Start the server:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example` (optional):
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Resumes
- `GET /api/resumes` - Get all user resumes (protected)
- `GET /api/resumes/:id` - Get single resume (protected)
- `POST /api/resumes` - Create new resume (protected)
- `PUT /api/resumes/:id` - Update resume (protected)
- `DELETE /api/resumes/:id` - Delete resume (protected)

### Job Postings
- `GET /api/jobs` - Get all user job postings (protected)
- `GET /api/jobs/:id` - Get single job posting (protected)
- `POST /api/jobs` - Create new job posting (protected)
- `PUT /api/jobs/:id` - Update job posting (protected)
- `DELETE /api/jobs/:id` - Delete job posting (protected)

### Comparisons
- `GET /api/comparisons` - Get all user comparisons (protected)
- `GET /api/comparisons/:id` - Get single comparison (protected)
- `POST /api/comparisons` - Create comparison (analyze resume vs job) (protected)
- `DELETE /api/comparisons/:id` - Delete comparison (protected)

## Development Roadmap

### Week 1: Foundation & Authentication ✅
- [x] Project setup and architecture
- [x] Database schema design
- [x] User authentication
- [x] Basic CRUD operations

### Week 2: Gemini Integration
- [ ] Implement resume parsing with Gemini
- [ ] Implement job posting analysis
- [ ] Create comparison algorithm
- [ ] Generate optimization recommendations

### Week 3: UI Enhancement
- [ ] Improve dashboard with statistics
- [ ] Add detailed comparison view
- [ ] Implement file upload for resumes
- [ ] Add export functionality

### Week 4: Advanced Features
- [ ] Resume templates
- [ ] Cover letter generation
- [ ] Interview preparation tips
- [ ] Testing and deployment

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Contributing

This is a learning project. Feel free to fork and experiment!

## License

MIT

## Author

Built as part of a 4-week full-stack development learning journey.

---

## Features

**Core Features**
- User authentication with JWT
- Resume management (create, edit, delete multiple versions)
- Job description input (paste or search job boards)
- AI-powered resume-to-job comparison using Gemini API
- Match score calculation (0-100%)
- Detailed improvement suggestions
- Comparison history tracking
- Responsive design for desktop and mobile

**Additional Features**
- Job board integration and search
- Keyword highlighting and skill gap analysis
- Resume strength analysis
- Export improvement suggestions

---

## Tech Stack

**Frontend**
- React.js
- Vite
- TailwindCSS
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Bcrypt for password hashing
- Google Gemini API

**Deployment**
- Vercel (frontend)
- Render (backend)
- MongoDB Atlas (database)

---

## Prerequisites

- Node.js v16 or higher
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key (free at https://ai.google.dev)

---

## Setup

### Backend

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

Start server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Usage

1. Sign up and log in
2. Upload your resume (text format)
3. Paste a job description or search job boards
4. Click "Analyze" to get AI-powered comparison
5. View match score, missing skills, and specific improvement suggestions
6. Review comparison history

---

## API Endpoints

**Authentication**
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify token

**Resumes**
- `POST /api/resume/create` - Create resume
- `GET /api/resume/list` - Get all resumes
- `GET /api/resume/:id` - Get specific resume
- `PUT /api/resume/:id` - Update resume
- `DELETE /api/resume/:id` - Delete resume

**Jobs**
- `POST /api/job/create` - Save job posting
- `GET /api/job/list` - Get saved jobs
- `GET /api/job/search` - Search job boards

**Comparisons**
- `POST /api/compare` - Analyze resume vs job
- `GET /api/comparison/history` - Get comparison history
- `DELETE /api/comparison/:id` - Delete comparison

---

## How It Works

The app uses Google's Gemini API to:
1. Extract key skills and requirements from job descriptions
2. Analyze your resume for existing skills and keywords
3. Calculate a match score based on overlap and keyword density
4. Generate specific, actionable improvement suggestions
5. Provide ATS optimization recommendations

---

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT-based authentication for protected routes
- Input validation and sanitization
- Rate limiting on API endpoints
- Sensitive data stored in environment variables
- CORS properly configured
- No plain text resume storage

---

## Deployment

**Backend (Render)**
1. Push code to GitHub
2. Create Render account
3. Connect GitHub repository
4. Set environment variables
5. Deploy

**Frontend (Vercel)**
1. Create Vercel account
2. Import GitHub repository
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy

---

## Troubleshooting

**Gemini API Error**
- Verify API key in `.env` file
- Check that API is enabled in Google Cloud Console
- Ensure free tier quota not exceeded

**MongoDB Connection Error**
- Check MongoDB URI in `.env`
- Verify MongoDB service is running (if local)
- Check connection string format for MongoDB Atlas

**CORS Error**
- Verify frontend and backend URLs match in configuration
- Check `.env` files have correct URLs

**Resume Not Saving**
- Verify you're logged in
- Check resume text is not empty
- Check browser console for errors

---

## Future Enhancements

- PDF export for improved resume
- AI-generated cover letters
- Job recommendation engine
- Email notifications for job matches
- Real-time resume scoring
- LinkedIn integration
- Interview preparation suggestions

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## Author

Parv Jhanwar
- GitHub: [prvcds](https://github.com/prvcds)
- LinkedIn: [Profile](https://linkedin.com/in/parvjhanwar)
- Email: parvjhanwar@example.com