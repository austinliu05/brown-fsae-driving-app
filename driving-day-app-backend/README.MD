# Brown FSAE Backend

Django REST API backend for the Brown FSAE driving day application.

## Overview

This backend provides:
- REST API endpoints for data management
- Firebase integration for authentication and data storage
- WebSocket support via Django Channels
- File upload and parsing capabilities
- CORS configuration for frontend integration

## Prerequisites

- Python 3.8+
- Virtual environment (already set up in `venv/`)
- Environment variables configured

## Setup

### 1. Activate Virtual Environment

```bash
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the backend root directory with the following variables:

```env
# Django Configuration
SECRET_KEY=your-django-secret-key-here
DJANGO_DEBUG=True

# AWS Configuration (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_REGION_NAME=us-east-1
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
```

### 4. Database Setup

Run migrations to set up the database:

```bash
python manage.py migrate
```

## Running the Backend

### Development Server

Start the Django development server:

```bash
python manage.py runserver
```

The server will be available at `http://127.0.0.1:8000/`

### Custom Port

To run on a different port:

```bash
python manage.py runserver 8001
```

### Production Server

For production deployment:

```bash
# Reload gunicorn
sudo systemctl restart gunicorn

# Reload nginx
sudo systemctl reload nginx

# Check gunicorn status
sudo systemctl status gunicorn
```

## API Endpoints

The backend provides REST API endpoints accessible at `http://127.0.0.1:8000/api/`

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (local frontend development)
- `https://brown-fsae.vercel.app` (production frontend)
- `https://brown-fsae-austinliu05-austinliu05s-projects.vercel.app` (preview deployments)

## Features

### Firebase Integration
- Authentication handling
- Firestore database operations
- File storage integration

### File Processing
- LD file parsing capabilities
- Data extraction and processing
- Support for various data formats

### WebSocket Support
- Real-time communication via Django Channels
- ASGI application configuration

## SSL Certificate Management

For production SSL certificates:

```bash
# Renew certificates
sudo certbot renew

# Check nginx configuration
sudo cat /etc/nginx/sites-available/yourproject
```

## Project Structure

```
driving-day-app-backend/
├── fsae_backend/           # Django project settings
├── fsae_backend_app/       # Main application
│   ├── firebase/          # Firebase integration
│   ├── ld_parser/         # File parsing utilities
│   └── migrations/        # Database migrations
├── venv/                  # Virtual environment
├── db.sqlite3            # SQLite database
├── manage.py             # Django management script
├── requirements.txt      # Python dependencies
└── README.MD            # This file
```

## Development

### Making Changes

1. Make your code changes
2. Run tests (if available):
   ```bash
   python manage.py test
   ```
3. Apply migrations if you've changed models:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
4. Restart the development server

### Database Management

- **Create migrations**: `python manage.py makemigrations`
- **Apply migrations**: `python manage.py migrate`
- **Create superuser**: `python manage.py createsuperuser`
- **Django admin**: Visit `http://127.0.0.1:8000/admin/`

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure virtual environment is activated
2. **Database errors**: Run migrations with `python manage.py migrate`
3. **CORS errors**: Check CORS configuration in settings.py
4. **Environment variables**: Verify `.env` file exists and contains required variables

### Logs

Check Django logs for debugging information when running the development server.

## Dependencies

Key dependencies include:
- Django 5.1.3
- Django REST Framework 3.15.2
- Firebase Admin SDK 6.6.0
- Django CORS Headers 4.6.0
- Django Channels 4.2.0

See `requirements.txt` for the complete list of dependencies.