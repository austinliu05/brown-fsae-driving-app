# Docker Setup for Brown FSAE Backend

This guide will help you set up and run the Brown FSAE backend using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

1. **Clone and navigate to the backend directory:**
   ```bash
   cd driving-day-app-backend
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

3. **Build and run the application:**
   ```bash
   make up-build
   # or
   docker-compose up --build -d
   ```

4. **Validate the setup:**
   ```bash
   ./validate-docker.sh
   ```

5. **Access the application:**
   - Backend API: http://localhost:8000
   - Django Admin: http://localhost:8000/admin

## Available Commands

### Using Makefile (Recommended)

```bash
# Development
make help           # Show all available commands
make up             # Start the application
make up-build       # Build and start the application
make down           # Stop the application
make restart        # Restart the application
make logs           # View application logs

# Django Management
make migrate        # Run Django migrations
make createsuperuser # Create Django superuser
make shell          # Access Django shell
make bash           # Access bash shell in container

# Testing and Validation
make test           # Run Django tests
make check          # Run Django system check
make validate       # Run validation script

# Database
make db-shell       # Access database shell
make db-reset       # Reset database (WARNING: Deletes all data!)

# Cleanup
make clean          # Remove containers, networks, and images
make clean-volumes  # Remove all volumes
```

### Using Docker Compose Directly

```bash
# Development
docker-compose up                    # Start in foreground
docker-compose up -d                 # Start in background
docker-compose up --build            # Rebuild and start
docker-compose down                  # Stop the application

# Database Management
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py shell

# Debugging
docker-compose logs backend          # View logs
docker-compose logs -f backend       # Follow logs in real-time
docker-compose exec backend bash     # Access container shell
```

## Environment Variables

The following environment variables can be configured in your `.env` file:

### Required
- `SECRET_KEY`: Django secret key for security
- `DJANGO_DEBUG`: Set to `True` for development, `False` for production

### Optional (AWS)
- `AWS_ACCESS_KEY_ID`: AWS access key for S3
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3
- `AWS_S3_REGION_NAME`: AWS region (default: us-east-1)
- `AWS_STORAGE_BUCKET_NAME`: S3 bucket name

### Optional (Firebase)
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_PRIVATE_KEY_ID`: Firebase private key ID
- `FIREBASE_PRIVATE_KEY`: Firebase private key
- `FIREBASE_CLIENT_EMAIL`: Firebase client email
- `FIREBASE_CLIENT_ID`: Firebase client ID

## Production Deployment

For production deployment:

1. Set `DJANGO_DEBUG=False` in your `.env` file
2. Use a strong `SECRET_KEY`
3. Configure proper database settings
4. Set up reverse proxy (nginx) if needed
5. Use production-grade secrets management

```bash
# Production build
make prod-build
make prod-up
```

## Validation Script

The `validate-docker.sh` script performs comprehensive checks:

- ✅ Prerequisites verification (Docker, Docker Compose)
- ✅ Required files validation
- ✅ Docker image building
- ✅ Application startup
- ✅ Health checks
- ✅ Django system checks
- ✅ Database migrations
- ✅ API endpoint testing

Run it with:
```bash
./validate-docker.sh
```

## Troubleshooting

### Common Issues

1. **Port 8000 already in use:**
   ```bash
   # Find and stop the process using port 8000
   lsof -i :8000
   # Or change the port in docker-compose.yml
   ```

2. **Permission denied errors:**
   ```bash
   # Make sure the validation script is executable
   chmod +x validate-docker.sh
   ```

3. **Database connection issues:**
   ```bash
   # Reset the database
   make db-reset
   ```

4. **Container won't start:**
   ```bash
   # Check logs for errors
   make logs
   # Or
   docker-compose logs backend
   ```

### Debugging Commands

```bash
# Check container status
make status
# or
docker-compose ps

# Check application health
make health
# or
curl -f http://localhost:8000/

# Access container for debugging
make bash
# or
docker-compose exec backend bash

# View detailed logs
make logs-tail
```

## Project Structure

```
driving-day-app-backend/
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
├── Makefile                # Common commands
├── validate-docker.sh      # Validation script
├── .dockerignore           # Files to ignore in Docker build
├── .env.example            # Environment variables template
├── requirements.txt        # Python dependencies
├── manage.py              # Django management script
├── db.sqlite3             # SQLite database (created on first run)
└── config/                # Django project configuration directory
```

## Support

If you encounter any issues, check the logs first:

```bash
make logs
```

Then run the validation script to diagnose problems:

```bash
./validate-docker.sh
```

For additional help, check the Django logs and container status.
