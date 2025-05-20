# Milestone Countdown

A cute, cartoon-style app that helps you set milestones on your calendar and counts down the days to important events.

## Features

- Add milestones with titles, descriptions, dates, and icons
- View remaining days until each milestone
- Interactive monthly calendar to visualize your milestones
- Cute cartoon character that reacts to upcoming milestones
- Automatic sorting of milestones by proximity
- Visual cues for milestones that are coming soon
- Responsive design for mobile and desktop

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask application:
```bash
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## How to Use

1. Fill out the form at the top of the page with your milestone details:
   - Title (required)
   - Description (optional)
   - Date (required)
   - Icon (select from dropdown)

2. Click "Add Milestone" to save your milestone

3. View your milestones in the monthly calendar and as cards below
   - Navigate between months using the calendar controls
   - Click on a milestone in the calendar to highlight its card
   - Color-coding helps identify milestone types

4. View your milestones sorted by date, with a countdown showing days remaining

5. Delete milestones by clicking the trash icon when they're no longer needed

## Technologies Used

- Backend: Flask (Python)
- Frontend: HTML, CSS, JavaScript
- Icons: Font Awesome
- Storage: JSON file for persistence