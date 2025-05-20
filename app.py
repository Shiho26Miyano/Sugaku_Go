from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime, date, timedelta
import json

app = Flask(__name__)

MILESTONES_FILE = 'milestones.json'

def load_milestones():
    # Create the file if it doesn't exist
    if not os.path.exists(MILESTONES_FILE):
        with open(MILESTONES_FILE, 'w') as file:
            json.dump([], file)
    
    # Read the milestones
    try:
        with open(MILESTONES_FILE, 'r') as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading milestones: {e}")
        return []

def save_milestones(milestones):
    try:
        with open(MILESTONES_FILE, 'w') as file:
            json.dump(milestones, file, indent=4)
    except Exception as e:
        print(f"Error saving milestones: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/milestones', methods=['GET'])
def get_milestones():
    milestones = load_milestones()
    
    # Calculate days remaining for each milestone
    for milestone in milestones:
        # Parse date and ensure it's interpreted correctly by using datetime.fromisoformat
        target_date_str = milestone['date']
        try:
            # Handle the date correctly and avoid timezone issues
            target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
            today = date.today()
            days_remaining = (target_date - today).days
            milestone['days_remaining'] = days_remaining
        except ValueError as e:
            # In case of any date parsing errors
            print(f"Error parsing date {target_date_str}: {e}")
            milestone['days_remaining'] = 0
    
    return jsonify(milestones)

@app.route('/api/milestones', methods=['POST'])
def add_milestone():
    milestone = request.json
    milestones = load_milestones()
    
    # Add unique ID to milestone
    if milestones:
        max_id = max(m.get('id', 0) for m in milestones)
        milestone['id'] = max_id + 1
    else:
        milestone['id'] = 1
    
    milestones.append(milestone)
    save_milestones(milestones)
    return jsonify(milestone), 201

@app.route('/api/milestones/<int:milestone_id>', methods=['DELETE'])
def delete_milestone(milestone_id):
    milestones = load_milestones()
    milestones = [m for m in milestones if m.get('id') != milestone_id]
    save_milestones(milestones)
    return jsonify({"message": "Milestone deleted"}), 200

if __name__ == '__main__':
    # Make sure the app is accessible from external devices on the network
    # Use port 5001 instead of 5000 which might be blocked
    app.run(debug=True, host='0.0.0.0', port=5001) 