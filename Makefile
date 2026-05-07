.PHONY: help dev prod stop down logs clean rebuild restart-all \
	restart-all-dev restart-all-prod shell-frontend shell-backend shell-db db-reset

# Default target
.DEFAULT_GOAL := help

# Color definitions
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m

# Compose file selection
COMPOSE_DEV := -f docker-compose.dev.yml
COMPOSE_PROD := -f docker-compose.prod.yml
COMPOSE_FILE ?= $(COMPOSE_DEV)

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
	docker-compose $(COMPOSE_FILE) stop
	@echo -e "$(GREEN)[OK] All services stopped$(NC)"

down: ## Stop and remove all containers (keep data)
	@echo -e "$(BLUE)Stopping and removing containers...$(NC)"
	docker-compose $(COMPOSE_FILE) down
	@echo -e "$(GREEN)[OK] Containers removed$(NC)"

clean: ## Remove all containers, networks and volumes (DELETE all data)
	@echo -e "$(YELLOW)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? (y/n) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose $(COMPOSE_FILE) down -v; \
		echo -e "$(GREEN)[OK] All containers and volumes removed$(NC)"; \
	else \
		echo -e "$(BLUE)Cancelled$(NC)"; \
	fi

rebuild: ## Rebuild all images
	@echo -e "$(BLUE)Rebuilding all images...$(NC)"
	docker-compose $(COMPOSE_FILE) build --no-cache
	@echo -e "$(GREEN)[OK] All images rebuilt$(NC)"

logs: ## View logs from all services
	docker-compose $(COMPOSE_FILE) logs -f

logs-frontend: ## View frontend logs
	docker-compose $(COMPOSE_FILE) logs -f frontend

logs-backend: ## View backend logs
	docker-compose $(COMPOSE_FILE) logs -f backend

logs-db: ## View database logs
	docker-compose $(COMPOSE_FILE) logs -f database

logs-nginx: ## View nginx logs
	docker-compose $(COMPOSE_FILE) logs -f nginx

ps: ## Display all container status
	docker-compose $(COMPOSE_FILE) ps

shell-frontend: ## Enter frontend container shell
	docker-compose $(COMPOSE_FILE) exec frontend sh

shell-backend: ## Enter backend container shell
	docker-compose $(COMPOSE_FILE) exec backend sh

shell-db: ## Enter database container psql
	docker-compose $(COMPOSE_FILE) exec database psql -U linkwise_user -d linkwise_db

db-reset: ## Reset database
	@echo -e "$(YELLOW)WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? (y/n) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose $(COMPOSE_FILE) down -v; \
		docker-compose $(COMPOSE_FILE) up -d; \
		echo -e "$(GREEN)[OK] Database reset$(NC)"; \
	else \
		echo -e "$(BLUE)Cancelled$(NC)"; \
	fi

restart: ## Restart all services
	@echo -e "$(BLUE)Restarting all services...$(NC)"
	docker-compose $(COMPOSE_FILE) restart
	@echo -e "$(GREEN)[OK] All services restarted$(NC)"

restart-frontend: ## Restart frontend
	docker-compose $(COMPOSE_FILE) restart frontend

restart-backend: ## Restart backend
	docker-compose $(COMPOSE_FILE) restart backend

restart-db: ## Restart database
	docker-compose $(COMPOSE_FILE) restart database

restart-all-dev: ## Clean, rebuild, and restart all services in DEV mode (full reset)
	@echo -e "$(YELLOW)WARNING: This will rebuild all images and restart all services in DEV mode!$(NC)"
	@read -p "Are you sure? (y/n) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo -e "$(BLUE)Cleaning...$(NC)"; \
		docker-compose -f docker-compose.dev.yml down -v; \
		echo -e "$(BLUE)Building...$(NC)"; \
		docker-compose -f docker-compose.dev.yml build --no-cache; \
		echo -e "$(BLUE)Starting services...$(NC)"; \
		docker-compose -f docker-compose.dev.yml up -d; \
		echo -e "$(GREEN)[OK] All services cleaned, rebuilt, and restarted in DEV mode$(NC)"; \
	else \
		echo -e "$(BLUE)Cancelled$(NC)"; \
	fi

restart-all-prod: ## Clean, rebuild, and restart all services in PROD mode (full reset)
	@echo -e "$(YELLOW)WARNING: This will rebuild all images and restart all services in PROD mode!$(NC)"
	@read -p "Are you sure? (y/n) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo -e "$(BLUE)Cleaning...$(NC)"; \
		docker-compose -f docker-compose.prod.yml down -v; \
		echo -e "$(BLUE)Building...$(NC)"; \
		docker-compose -f docker-compose.prod.yml build --no-cache; \
		echo -e "$(BLUE)Starting services...$(NC)"; \
		docker-compose -f docker-compose.prod.yml up -d; \
		echo -e "$(GREEN)[OK] All services cleaned, rebuilt, and restarted in PROD mode$(NC)"; \
	else \
		echo -e "$(BLUE)Cancelled$(NC)"; \
	fi

restart-all: ## Clean, rebuild, and restart all services (full reset) - defaults to DEV
	$(MAKE) restart-all-dev

build: ## Build all images
	docker-compose $(COMPOSE_FILE) build

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
