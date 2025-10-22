#!/bin/bash

# FSAE Backend Docker Validation Script
# This script validates that the Docker setup is working correctly

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for service to be ready at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" >/dev/null 2>&1; then
            print_success "Service is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo ""
    print_error "Service failed to start within $(($max_attempts * 2)) seconds"
    return 1
}

# Main validation function
main() {
    echo "=========================================="
    echo "FSAE Backend Docker Validation Script"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    print_success "Docker is installed"
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    print_success "Docker Compose is installed"
    
    if ! command_exists curl; then
        print_warning "curl is not installed - some health checks may fail"
    else
        print_success "curl is installed"
    fi
    
    # Check if port 8000 is available
    if port_in_use 8000; then
        print_warning "Port 8000 is already in use. Make sure to stop other services."
    else
        print_success "Port 8000 is available"
    fi
    
    echo ""
    
    # Check required files
    print_status "Checking required files..."
    
    required_files=(
        "Dockerfile"
        "docker-compose.yml"
        "requirements.txt"
        "manage.py"
        "config/settings.py"
    )
    
    missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
    print_success "All required files are present"
    
    # Check .env file
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please edit .env with your actual configuration values"
        else
            print_warning "No .env.example file found. You may need to create .env manually."
        fi
    else
        print_success ".env file exists"
    fi
    
    echo ""
    
    # Build and start the application
    print_status "Building Docker image..."
    if docker-compose build; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
    
    echo ""
    
    print_status "Starting application..."
    if docker-compose up -d; then
        print_success "Application started successfully"
    else
        print_error "Failed to start application"
        exit 1
    fi
    
    echo ""
    
    # Wait for service to be ready
    if wait_for_service "http://localhost:8000/"; then
        print_success "Application is responding to HTTP requests"
    else
        print_error "Application is not responding"
        docker-compose logs backend
        exit 1
    fi
    
    echo ""
    
    # Run Django checks
    print_status "Running Django system checks..."
    if docker-compose exec -T backend python manage.py check; then
        print_success "Django system checks passed"
    else
        print_error "Django system checks failed"
        docker-compose logs backend
        exit 1
    fi
    
    echo ""
    
    # Run migrations
    print_status "Running Django migrations..."
    if docker-compose exec -T backend python manage.py migrate; then
        print_success "Django migrations completed successfully"
    else
        print_error "Django migrations failed"
        docker-compose logs backend
        exit 1
    fi
    
    echo ""
    
    # Test API endpoints
    print_status "Testing API endpoints..."
    
    # Test health endpoint
    if curl -f -s "http://localhost:8000/api/health/" >/dev/null; then
        print_success "Health endpoint is working"
    else
        print_warning "Health endpoint is not responding"
    fi
    
    # Test homepage
    if curl -f -s "http://localhost:8000/" >/dev/null; then
        print_success "Homepage is accessible"
    else
        print_warning "Homepage is not accessible"
    fi
    
    echo ""
    
    # Show container status
    print_status "Container status:"
    docker-compose ps
    
    echo ""
    print_success "=========================================="
    print_success "Docker validation completed successfully!"
    print_success "=========================================="
    echo ""
    echo "Your application is running at: http://localhost:8000"
    echo "API health check: http://localhost:8000/api/health/"
    echo ""
    echo "Useful commands:"
    echo "  make logs          - View application logs"
    echo "  make shell         - Access Django shell"
    echo "  make down          - Stop the application"
    echo "  make restart       - Restart the application"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    docker-compose down >/dev/null 2>&1 || true
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"
