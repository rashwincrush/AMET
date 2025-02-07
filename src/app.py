import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
CORS(app)

# Import models and routes
from models import User, Alumni, Event, JobPosting
from routes import auth_routes, alumni_routes, event_routes, job_routes

# Register blueprints
app.register_blueprint(auth_routes, url_prefix='/auth')
app.register_blueprint(alumni_routes, url_prefix='/alumni')
app.register_blueprint(event_routes, url_prefix='/events')
app.register_blueprint(job_routes, url_prefix='/jobs')

@app.route('/')
def index():
    return jsonify({"message": "Alumni Management SaaS API"})

if __name__ == '__main__':
    app.run(debug=True)
