"""
RateUs Flask Application
Backend API for rating system with persistent database storage
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rateus.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Models
class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    avatar = db.Column(db.String(200), nullable=False)
    ratings = db.relationship('Rating', backref='person', lazy=True, cascade='all, delete-orphan')
    messages = db.relationship('Message', backref='person', lazy=True, cascade='all, delete-orphan')

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.Integer, db.ForeignKey('person.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.Integer, db.ForeignKey('person.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize database and seed data
def init_db():
    with app.app_context():
        db.create_all()

        # Check if people already exist
        if Person.query.count() == 0:
            # Seed initial people data
            people_data = [
                {"id": 1, "name": "Jihan", "avatar": "images/avatars/avatar-1.png"},
                {"id": 2, "name": "Ahmad", "avatar": "images/avatars/avatar-2.png"},
                {"id": 3, "name": "Syifa", "avatar": "images/avatars/avatar-3.png"},
                {"id": 4, "name": "Bima", "avatar": "images/avatars/avatar-4.png"},
                {"id": 5, "name": "Azkel", "avatar": "images/avatars/avatar-5.png"},
                {"id": 6, "name": "Ryu", "avatar": "images/hero-character-removebg-preview.png"}
            ]

            for person_data in people_data:
                person = Person(
                    id=person_data["id"],
                    name=person_data["name"],
                    avatar=person_data["avatar"]
                )
                db.session.add(person)

            db.session.commit()
            print("Database initialized with people data")

# API Endpoints
@app.route('/api/people', methods=['GET'])
def get_people():
    """Get all people"""
    people = Person.query.all()
    return jsonify([{
        'id': person.id,
        'name': person.name,
        'avatar': person.avatar
    } for person in people])

@app.route('/api/ratings/<int:person_id>', methods=['GET'])
def get_ratings(person_id):
    """Get all ratings for a specific person"""
    ratings = Rating.query.filter_by(person_id=person_id).all()
    return jsonify([{
        'id': rating.id,
        'rating': rating.rating,
        'timestamp': rating.timestamp.isoformat()
    } for rating in ratings])

@app.route('/api/messages/<int:person_id>', methods=['GET'])
def get_messages(person_id):
    """Get all messages for a specific person"""
    messages = Message.query.filter_by(person_id=person_id).order_by(Message.timestamp.desc()).all()
    return jsonify([{
        'id': message.id,
        'message': message.message,
        'rating': message.rating,
        'timestamp': message.timestamp.isoformat()
    } for message in messages])

@app.route('/api/ratings', methods=['POST'])
def submit_rating():
    """Submit a new rating and message"""
    data = request.get_json()

    if not data or 'person_id' not in data or 'rating' not in data or 'message' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    person_id = data['person_id']
    rating_value = data['rating']
    message_text = data['message']

    # Validate rating range
    if not (1 <= rating_value <= 5):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    # Check if person exists
    person = Person.query.get(person_id)
    if not person:
        return jsonify({'error': 'Person not found'}), 404

    # Create rating and message
    new_rating = Rating(person_id=person_id, rating=rating_value)
    new_message = Message(person_id=person_id, message=message_text, rating=rating_value)

    db.session.add(new_rating)
    db.session.add(new_message)
    db.session.commit()

    return jsonify({
        'message': 'Rating and message submitted successfully',
        'rating_id': new_rating.id,
        'message_id': new_message.id
    }), 201

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get overall statistics"""
    total_people = Person.query.count()
    total_ratings = Rating.query.count()
    total_messages = Message.query.count()

    return jsonify({
        'total_people': total_people,
        'total_ratings': total_ratings,
        'total_messages': total_messages
    })

@app.route('/api/migrate', methods=['POST'])
def migrate_data():
    """Migrate data from localStorage format to database"""
    data = request.get_json()

    if not data or 'localStorageData' not in data:
        return jsonify({'error': 'No localStorage data provided'}), 400

    local_data = data['localStorageData']
    migrated_count = 0

    try:
        for person_id_str, person_data in local_data.items():
            person_id = int(person_id_str)

            # Check if person exists
            person = Person.query.get(person_id)
            if not person:
                continue

            ratings = person_data.get('ratings', [])
            messages = person_data.get('messages', [])

            # Add ratings
            for rating_value in ratings:
                new_rating = Rating(person_id=person_id, rating=rating_value)
                db.session.add(new_rating)

            # Add messages
            for msg_data in messages:
                new_message = Message(
                    person_id=person_id,
                    message=msg_data['message'],
                    rating=msg_data['rating'],
                    timestamp=datetime.fromisoformat(msg_data['timestamp'])
                )
                db.session.add(new_message)

            migrated_count += 1

        db.session.commit()
        return jsonify({
            'message': f'Successfully migrated data for {migrated_count} people',
            'migrated_people': migrated_count
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Migration failed: {str(e)}'}), 500

# Serve static files
@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def serve_static(path):
    return app.send_static_file(path)

# Initialize database on app startup
init_db()

if __name__ == '__main__':
    print("RateUs Flask API Server")
    print("Database initialized and ready")
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting server on port {port}")
    app.run(debug=False, host='0.0.0.0', port=port)
