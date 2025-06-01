# CodeCraft Frontend

A modern, interactive web application for learning coding through practical exercises.

## Features

- Clean and modern authentication system
- Interactive dashboard with exercise tracking
- Real-time code editor with live preview
- Progress tracking and auto-save functionality
- Responsive design for all devices

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Monaco Editor for code editing
- Font Awesome for icons
- Google Fonts (Poppins)

## Project Structure

```
frontend/
├── index.html                 # Sign In / Sign Up page
├── dashboard.html             # Main dashboard UI
├── compiler.html              # Exercise coding interface
├── styles/
│   ├── style.css              # Global styles
│   ├── dashboard.css          # Dashboard styles
│   └── compiler.css           # Compiler page styles
├── scripts/
│   ├── auth.js                # Authentication logic
│   ├── dashboard.js           # Dashboard functionality
│   └── compiler.js            # Code editor and preview
└── assets/
    └── user-icon.png          # Default user avatar
```

## Setup Instructions

1. Clone the repository
2. Navigate to the frontend directory
3. Open `index.html` in your browser or use a local server

### Using a Local Server

You can use any of these methods to run a local server:

#### Using Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run the server
http-server
```

## API Integration

The frontend is designed to work with the following API endpoints:

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login

### User Profile
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile

### Exercises
- GET `/api/exercises` - Get all exercises
- GET `/api/exercises/:id` - Get specific exercise

### Progress
- GET `/api/progress` - Get user progress
- GET `/api/progress/:exerciseId` - Get exercise progress
- POST `/api/progress/:exerciseId` - Save exercise progress

## Features in Detail

### Authentication
- Clean sign-in/sign-up forms with smooth transitions
- Form validation and error handling
- JWT token-based authentication
- Secure password handling

### Dashboard
- User profile display with progress statistics
- Grid layout of available exercises
- Progress tracking for completed and in-progress exercises
- Responsive navigation with user menu

### Code Editor
- Monaco Editor integration for a professional coding experience
- Live preview of HTML/CSS/JS code
- Auto-save functionality
- Code reset option
- Progress tracking

## Browser Support

The application is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 