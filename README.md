# AMET (Alumni Management and Engagement Toolkit)

## 🌟 Overview
A comprehensive Alumni Management System built with Vue.js and Flask, providing robust features for alumni networking, event management, and job postings.

## 🚀 Technology Stack

### 💻 Frontend
- Vue.js 3
- Vite
- TypeScript
- Pinia (State Management)
- Vue Router

### 🔧 Backend
- Flask
- PostgreSQL
- SQLAlchemy
- Python 3.8+

## ✨ Features
- 🔐 User Authentication
- 👥 Alumni Profile Management
- 🎉 Event Registration and Management
- 💼 Job Posting and Application
- 🔍 Advanced Alumni Search and Networking

## 📂 Project Structure
```
AMET/
│
├── frontend/         # Vue.js frontend application
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
│
├── backend/          # Flask backend application
│   ├── app.py
│   ├── models/
│   ├── routes/
│   └── requirements.txt
│
└── README.md
```

## 🛠 Setup and Installation

### 🖥 Frontend Setup
#### Prerequisites
- Node.js 18+
- npm

#### Installation Steps
```bash
# Clone the repository
git clone https://github.com/rashwincrush/AMET.git
cd AMET/frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### 🗄 Backend Setup
#### Prerequisites
- Python 3.8+
- PostgreSQL

#### Installation Steps
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp config.env .env
# Edit .env and update configurations

# Initialize database
flask db upgrade

# Run the application
flask run
```

## 🌐 API Endpoints

### 🔑 Authentication
- `POST /auth/register`: User registration
- `POST /auth/login`: User login

### 👤 Alumni
- `GET /alumni/profile`: Retrieve alumni profile
- `PUT /alumni/profile`: Update alumni profile
- `GET /alumni/search`: Search alumni by various criteria

### 🎟 Events
- `GET /events`: List events
- `POST /events/register`: Register for an event

### 💼 Jobs
- `GET /jobs`: List job postings
- `POST /jobs/apply`: Apply for a job

## 🚢 Deployment
- Frontend: Deployed on GitHub Pages at https://rashwincrush.github.io/AMET/
- Backend: To be deployed (Suggestions: Heroku, AWS, or DigitalOcean)

### 🔄 Continuous Integration
- GitHub Actions for automated testing and deployment
- Automatic frontend deployment to GitHub Pages

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.

## 📧 Contact
- Project Link: [https://github.com/rashwincrush/AMET](https://github.com/rashwincrush/AMET)
