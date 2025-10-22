# FSAE Backend Docker Makefile
# This Makefile provides common commands for managing the Dockerized Django backend

.PHONY: help build up down restart logs shell test clean migrate createsuperuser install

# Default target
help: ## Show this help message
	@echo "FSAE Backend Docker Commands:"
	@echo "=============================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Docker commands
build: ## Build the Docker image
	docker-compose build

up: ## Start the application in detached mode
	docker-compose up -d

up-build: ## Build and start the application
	docker-compose up --build -d

down: ## Stop and remove containers
	docker-compose down

restart: ## Restart the application
	docker-compose restart

logs: ## Show application logs
	docker-compose logs -f backend

logs-tail: ## Show last 100 lines of logs
	docker-compose logs --tail=100 backend

# Development commands
shell: ## Access Django shell in container
	docker-compose exec backend python manage.py shell

bash: ## Access bash shell in container
	docker-compose exec backend bash

# Django management commands
migrate: ## Run Django migrations
	docker-compose exec backend python manage.py migrate

makemigrations: ## Create Django migrations
	docker-compose exec backend python manage.py makemigrations

createsuperuser: ## Create Django superuser
	docker-compose exec backend python manage.py createsuperuser

collectstatic: ## Collect static files
	docker-compose exec backend python manage.py collectstatic --noinput

# Testing and validation
test: ## Run Django tests
	docker-compose exec backend python manage.py test

check: ## Run Django system check
	docker-compose exec backend python manage.py check

validate: ## Run validation script
	./validate-docker.sh

# Database commands
db-shell: ## Access database shell
	docker-compose exec backend python manage.py dbshell

db-reset: ## Reset database (WARNING: This will delete all data!)
	docker-compose down
	docker volume rm fsae-backend_postgres_data 2>/dev/null || true
	rm -f db.sqlite3
	docker-compose up -d
	sleep 10
	$(MAKE) migrate

# Cleanup commands
clean: ## Remove containers, networks, and images
	docker-compose down --rmi all --volumes --remove-orphans

clean-volumes: ## Remove all volumes
	docker-compose down -v

clean-images: ## Remove all images
	docker-compose down --rmi all

# Environment setup
install: ## Install dependencies locally (for development)
	pip install -r requirements.txt

setup-env: ## Create .env file from example
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file from .env.example"; \
		echo "Please edit .env with your actual values"; \
	else \
		echo ".env file already exists"; \
	fi

# Production commands
prod-build: ## Build production image
	docker build -t fsae-backend:prod .

prod-up: ## Start production container
	docker run -d --name fsae-backend-prod \
		-p 8000:8000 \
		--env-file .env \
		fsae-backend:prod

prod-down: ## Stop production container
	docker stop fsae-backend-prod
	docker rm fsae-backend-prod

# Monitoring and health
status: ## Show container status
	docker-compose ps

health: ## Check application health
	curl -f http://localhost:8000/ || echo "Application is not responding"

# Backup and restore
backup-db: ## Backup SQLite database
	cp db.sqlite3 db.sqlite3.backup.$$(date +%Y%m%d_%H%M%S)

restore-db: ## Restore SQLite database (usage: make restore-db BACKUP_FILE=filename)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "Usage: make restore-db BACKUP_FILE=filename"; \
		exit 1; \
	fi
	cp $(BACKUP_FILE) db.sqlite3
	$(MAKE) restart
