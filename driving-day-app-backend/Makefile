# Simple FSAE Backend Docker Makefile
# Essential commands for daily development

.PHONY: help build up down logs shell test clean

# Default target
help: ## Show available commands
	@echo "FSAE Backend - Simple Docker Commands:"
	@echo "======================================"
	@echo "make up      - Start the application"
	@echo "make down    - Stop the application"
	@echo "make logs    - View application logs"
	@echo "make shell   - Access Django shell"
	@echo "make test    - Run validation script"
	@echo "make clean   - Stop and remove containers"
	@echo ""

# Essential Docker commands
up: ## Start the application
	docker-compose up -d

down: ## Stop the application
	docker-compose down

logs: ## View application logs
	docker-compose logs -f backend

shell: ## Access Django shell
	docker-compose exec backend python manage.py shell

# Testing
test: ## Run validation script
	./validate-docker.sh

# Cleanup
clean: ## Stop and remove containers
	docker-compose down --remove-orphans