# Alumni Management SaaS

## Overview
A comprehensive Alumni Management System built with Flask, providing features for alumni networking, event management, and job postings.

## Features
- User Authentication
- Alumni Profile Management
- Event Registration
- Job Posting and Application
- Alumni Search and Networking

## Setup and Installation

### Prerequisites
- Python 3.8+
- PostgreSQL

### Installation Steps
1. Clone the repository
2. Create a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Set up environment variables
- Copy `config.env` to `.env`
- Update database and email configurations

5. Initialize the database
```bash
flask db upgrade
```

6. Run the application
```bash
flask run
```

## API Endpoints
- `/auth/register`: User registration
- `/auth/login`: User login
- `/alumni/profile`: Alumni profile management
- `/alumni/search`: Search alumni
- `/events`: List and register for events
- `/jobs`: List and apply for jobs

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License.
