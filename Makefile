.PHONY: help dev prod stop down logs clean rebuild restart-all \
	shell-frontend shell-backend shell-db db-reset

# Default target
.DEFAULT_GOAL := help

# Color definitions
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m

help: ## Display this help message
	@echo -e "$(BLUE)LinkWise Docker Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)  %-25s$(NC) %s\n", $$1, $$2}'

setup: ## Setup environment: Copy .env file
	@if [ ! -f .env ]; then \
		echo -e "$(YELLOW)Creating .env from .env.example...$(NC)"; \
		cp .env.example .env; \
		echo -e "$(GREEN)[OK] .env created$(NC)"; \
	else \
		echo -e "$(GREEN)[OK] .env already exists$(NC)"; \
	fi

dev: setup ## Start development environment (with hot reload)
	@echo -e "$(BLUE)Starting development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d
	@echo -e "$(GREEN)[OK] Development environment started$(NC)"
	@echo ""
	@echo "Services:"
	@echo "  Frontend (Nginx):  http://localhost:3000"
	@echo "  Backend (Direct):  http://localhost:8080"
	@echo "  Swagger UI:        http://localhost:8080/swagger-ui/index.html"
	@echo "  Database:          localhost:5432"

prod: setup ## Start production environment
	@echo -e "$(BLUE)Starting production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml up -d
	@echo -e "$(GREEN)[OK] Production environment started$(NC)"
	@echo ""
	@echo "Services:"
	@echo "  Frontend:          http://localhost:3000"
	@echo "  Backend:           http://localhost:8080"
	@echo "  Database:          localhost:5432"

stop: ## Stop all services (keep data)
	@echo -e "$(BLUE)Stopping all services...$(NC)"
	docker-compose stop
	@echo -e "$(GREEN)[OK] All services stopped$(NC)"

down: ## Stop and remove all containers (keep data)
	@echo -e "$(BLUE)Stopping and removing containers...$(NC)"
	docker-compose down
	@echo -e "$(GREEN)[OK] Containers removed$(NC)"

clean: ## Remove all containers, networks and volumes (DELETE all data)
	@echo -e "$(YELLOW)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? (y/n) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo -e "$(GREEN)[OK] All containers and volumes removed$(NC)"; \
	else \
		echo -e "$(BLUE)Cancelled$(NC)"; \
	fi

rebuild: ## Rebuild all images
	@echo -e "$(BLUE)Rebuilding all images...$(NC)"
	docker-compose build --no-cache
	@echo -e "$(GREEN)[OK] All images rebuilt$(NC)"

logs: ## View logs from all services
	docker-compose logs -f

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-db: ## View database logs
	docker-compose logs -f database

ps: ## Display all container status
	docker-compose ps

shell-frontend: ## Enter frontend container shell
	docker-compose exec frontend sh

shell-backend: ## Enter backend container shell
	docker-compose exec backend sh

shell-db: ## Enter database container psql
	docker-compose exec database psql -U linkwise_user -d linkwise_db

db-reset: ## Reset database
	@echo -e "$(YELLOW)WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? (y/n) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker-compose up -d; \
		echo -e "$(GREEN)[OK] Database reset$(NC)"; \
	else \
		echo -e "$(BLUE)Cancelled$(NC)"; \
	fi

restart: ## Restart all services
	@echo -e "$(BLUE)Restarting all services...$(NC)"
	docker-compose restart
	@echo -e "$(GREEN)[OK] All services restarted$(NC)"

restart-frontend: ## Restart frontend
	docker-compose restart frontend

restart-backend: ## Restart backend
	docker-compose restart backend

restart-db: ## Restart database
	docker-compose restart database

restart-all: ## Clean, rebuild, and restart all services (full reset)
	@echo -e "$(YELLOW)WARNING: This will rebuild all images and restart all services!$(NC)"
	@read -p "Are you sure? (y/n) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo -e "$(BLUE)Cleaning...$(NC)"; \
		docker-compose down -v; \
		echo -e "$(BLUE)Building...$(NC)"; \
		docker-compose build --no-cache; \
		echo -e "$(BLUE)Starting services...$(NC)"; \
		docker-compose up -d; \
		echo -e "$(GREEN)[OK] All services cleaned, rebuilt, and restarted$(NC)"; \
	else \
		echo -e "$(BLUE)Cancelled$(NC)"; \
	fi

build: ## Build all images
	docker-compose build

status: ## Display complete container status
	@echo -e "$(BLUE)Container Status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo -e "$(BLUE)Network Information:$(NC)"
	@docker network ls | grep linkwise
	@echo ""
	@echo -e "$(BLUE)Volume Information:$(NC)"
	@docker volume ls | grep postgres

health-check: ## Check service health status
	@echo -e "$(BLUE)Checking services health...$(NC)"
	@echo "Frontend: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || echo 'DOWN')"
	@echo "Backend: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/health || echo 'DOWN')"
	@echo "Database: $$(docker-compose exec -T database pg_isready -U linkwise_user && echo 'UP' || echo 'DOWN')"

version: ## Show Docker and Docker Compose version
	@echo "Docker version:"
	@docker --version
	@echo "Docker Compose version:"
	@docker-compose --version

# Quick start commands (alternative without make)
.PHONY: up down-v env-setup
up: dev ## Quick alias: same as 'dev'
down-v: clean ## Quick alias: same as 'clean'
env-setup: setup ## Quick alias: same as 'setup'
