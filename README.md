# AMET
## Alumni Management SaaS

A comprehensive Alumni Management System built with Vue.js and Flask, providing features for alumni networking, event management, and job postings.

### Frontend Technologies
- Vue.js 3
- Vite
- Pinia (State Management)
- TypeScript
- Vue Router

### Backend Technologies
- Flask
- PostgreSQL
- SQLAlchemy

### Features
- User Authentication
- Alumni Profile Management
- Event Registration
- Job Posting and Application
- Alumni Search and Networking

### Frontend Setup and Installation
#### Prerequisites
- Node.js 18+
- npm

#### Installation Steps
1. Clone the repository
   ```bash
   git clone https://github.com/rashwincrush/AMET.git
   cd AMET/frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run development server
   ```bash
   npm run dev
   ```

4. Build for production
   ```bash
   npm run build
   ```

### Backend Setup and Installation
#### Prerequisites
- Python 3.8+
- PostgreSQL

#### Installation Steps
1. Create a virtual environment
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables
   - Copy `config.env` to `.env`
   - Update database and email configurations

4. Initialize the database
   ```bash
   flask db upgrade
   ```

5. Run the application
   ```bash
   flask run
   ```

### API Endpoints
- `/auth/register`: User registration
- `/auth/login`: User login
- `/alumni/profile`: Alumni profile management
- `/alumni/search`: Search alumni
- `/events`: List and register for events
- `/jobs`: List and apply for jobs

### Deployment
The frontend is deployed using GitHub Pages and can be accessed at:
https://rashwincrush.github.io/AMET/

### Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

### License
This project is licensed under the MIT License.
