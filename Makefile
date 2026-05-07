.PHONY: help dev prod stop down logs clean rebuild \
	shell-frontend shell-backend shell-db db-reset

# 預設目標
.DEFAULT_GOAL := help

# 顏色定義
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m

help: ## 顯示此幫助信息
	@echo "$(BLUE)LinkWise Docker 命令:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)  %-25s$(NC) %s\n", $$1, $$2}'

setup: ## 設置環境：複製 .env 文件
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env from .env.example...$(NC)"; \
		cp .env.example .env; \
		echo "$(GREEN)✓ .env created$(NC)"; \
	else \
		echo "$(GREEN)✓ .env already exists$(NC)"; \
	fi

dev: setup ## 啟動開發環境 (帶熱加載)
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✓ Development environment started$(NC)"
	@echo ""
	@echo "Services:"
	@echo "  Frontend:  http://localhost:3000"
	@echo "Backend (Nginx):   http://localhost:8080"
	@echo "  Database:  localhost:5432"

prod: setup ## 啟動生產環境
	@echo "$(BLUE)Starting production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Production environment started$(NC)"
	@echo ""
	@echo "Services:"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend (Nginx):   http://localhost:8080"
	@echo "  Database:  localhost:5432"

stop: ## 停止所有服務（保留數據）
	@echo "$(BLUE)Stopping all services...$(NC)"
	docker-compose stop
	@echo "$(GREEN)✓ All services stopped$(NC)"

down: ## 停止並移除所有容器（保留數據）
	@echo "$(BLUE)Stopping and removing containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Containers removed$(NC)"

clean: ## 清除所有容器、網絡和卷（刪除所有數據）
	@echo "$(YELLOW)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? (y/n) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)✓ All containers and volumes removed$(NC)"; \
	else \
		echo "$(BLUE)Cancelled$(NC)"; \
	fi

rebuild: ## 重新構建所有映像
	@echo "$(BLUE)Rebuilding all images...$(NC)"
	docker-compose build --no-cache
	@echo "$(GREEN)✓ All images rebuilt$(NC)"

logs: ## 查看所有服務的日誌
	docker-compose logs -f

logs-frontend: ## 查看前端日誌
	docker-compose logs -f frontend

logs-backend: ## 查看後端日誌
	docker-compose logs -f backend

logs-db: ## 查看資料庫日誌
	docker-compose logs -f database

ps: ## 顯示所有容器狀態
	docker-compose ps

shell-frontend: ## 進入前端容器的 shell
	docker-compose exec frontend sh

shell-backend: ## 進入後端容器的 shell
	docker-compose exec backend sh

shell-db: ## 進入資料庫容器的 psql
	docker-compose exec database psql -U linkwise_user -d linkwise_db

db-reset: ## 重置資料庫
	@echo "$(YELLOW)WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? (y/n) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker-compose up -d; \
		echo "$(GREEN)✓ Database reset$(NC)"; \
	else \
		echo "$(BLUE)Cancelled$(NC)"; \
	fi

restart: ## 重新啟動所有服務
	@echo "$(BLUE)Restarting all services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ All services restarted$(NC)"

restart-frontend: ## 重新啟動前端
	docker-compose restart frontend

restart-backend: ## 重新啟動後端
	docker-compose restart backend

restart-db: ## 重新啟動資料庫
	docker-compose restart database

build: ## 構建所有映像
	docker-compose build

status: ## 顯示完整的容器狀態
	@echo "$(BLUE)Container Status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(BLUE)Network Information:$(NC)"
	@docker network ls | grep linkwise
	@echo ""
	@echo "$(BLUE)Volume Information:$(NC)"
	@docker volume ls | grep postgres

health-check: ## 檢查服務健康狀態
	@echo "$(BLUE)Checking services health...$(NC)"
	@echo "Frontend: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || echo 'DOWN')"
	@echo "Backend (Nginx): $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/health || echo 'DOWN')"
	@echo "Database: $$(docker-compose exec -T database pg_isready -U linkwise_user && echo 'UP' || echo 'DOWN')"

version: ## 顯示 Docker 和 Docker Compose 版本
	@echo "Docker version:"
	@docker --version
	@echo "Docker Compose version:"
	@docker-compose --version

# 快速啟動命令（無 make 的替代方案）
.PHONY: up down-v env-setup
up: dev ## 快速別名: 同 'dev'
down-v: clean ## 快速別名: 同 'clean'
env-setup: setup ## 快速別名: 同 'setup'
