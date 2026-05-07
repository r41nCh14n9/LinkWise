# 🐳 Docker 使用指南

## 概覽

LinkWise 採用 Docker 和 Docker Compose 進行容器化部署，支持開發、測試和生產環境。

---

## 🚀 快速開始

### 使用 Makefile（推薦）

```bash
# 啟動開發環境
make dev

# 啟動生產環境
make prod

# 查看容器狀態
make ps

# 查看日誌
make logs

# 停止服務
make stop

# 完整幫助
make help
```

### 使用 Docker Compose 直接命令

```bash
# 開發環境
docker-compose -f docker-compose.dev.yml up -d

# 生產環境
docker-compose -f docker-compose.prod.yml up -d

# 停止所有服務
docker-compose down

# 查看日誌
docker-compose logs -f
```

---

## 🏗️ 架構概覽

LinkWise 使用統一的 Nginx 網關架構：

```
┌─────────────────────────────────────────┐
│        外部訪問 (localhost:8080)        │
├─────────────────────────────────────────┤
│                                         │
│    Nginx 反向代理（Port 8080）         │
│                                         │
├──────────────────┬──────────────────────┤
│                  │                      │
│  前端路由 (/)    │  後端路由 (/api/*)  │
│  (Port 3000)     │  (Port 8080)         │
│                  │                      │
│  Vite React App  │  Spring Boot API    │
│                  │                      │
└──────────────────┴──────────────────────┘
          ↓                    ↓
    ┌─────────────────────────────────┐
    │   PostgreSQL (Port 5432)        │
    │   Database (linkwise_db)        │
    └─────────────────────────────────┘
```

### 關鍵點：
- **單一入口**: 所有訪問都通過 Nginx 網關 (port 8080)
- **內部通信**: 前端、後端、資料庫通過容器網絡通信
- **安全性**: 隱藏內部服務，只暴露 Nginx 網關
- **簡化配置**: 無需處理 CORS，統一域名

---

## 📦 容器構成

### 1. Frontend (linkwise-front)
- **映像**: Node.js 20 基礎
- **端口**: 內部 3000 (不暴露)
- **工具**: Vite + React + TypeScript
- **構建**: `src/linkwise-front/Dockerfile.dev` 和 `Dockerfile`

### 2. Backend (linkwise-core)
- **映像**: Eclipse Temurin 17 JRE Alpine
- **端口**: 內部 8080 (不暴露)
- **框架**: Spring Boot 3.2
- **構建**: `src/linkwise-core/Dockerfile`

### 3. Database (PostgreSQL)
- **映像**: PostgreSQL 16-alpine
- **端口**: 內部 5432 (不暴露)
- **持久化**: 數據卷 `postgres_data`
- **用戶**: `linkwise_user`

### 4. Nginx (Reverse Proxy)
- **映像**: Nginx 1.27-alpine
- **端口**: 外部 8080
- **配置**: `nginx/dev.conf` 或 `nginx/default.conf`
- **職責**: 路由、安全頭部、SSL 終止

---

## 🔧 環境配置

### 1. 設置環境變量

```bash
# 首次設置
make setup

# 或手動建立 .env
cp .env.example .env
```

### 2. .env 文件結構

```
# 環境
NODE_ENV=development

# 資料庫
DB_HOST=database
DB_PORT=5432
DB_USER=linkwise_user
DB_PASSWORD=linkwise_password
DB_NAME=linkwise_db

# 後端
BACKEND_PORT=8080
SPRING_PROFILES_ACTIVE=dev

# 前端
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:8080

# 應用
APP_URL=http://localhost:8080
```

### 3. 各環境專用配置

**開發環境** (`docker-compose.dev.yml`):
- ✅ 熱更新支援
- ✅ 詳細日誌
- ✅ 寬鬆的快取設置
- ✅ 易於調試

**生產環境** (`docker-compose.prod.yml`):
- ✅ 最小化日誌
- ✅ 最優化性能
- ✅ 嚴格快取策略
- ✅ 安全優先

---

## 🎯 常見操作

### 查看容器狀態

```bash
# 列出所有運行中的容器
make ps

# 詳細狀態檢查
make health-check

# 查看特定容器日誌
make logs-backend
make logs-frontend
make logs-db
```

### 進入容器執行命令

```bash
# 進入後端容器
make shell-backend

# 進入前端容器
make shell-frontend

# 進入資料庫容器
make shell-db

# 示例：在後端容器執行 Maven 命令
make shell-backend
> mvn clean package
```

### 管理資料庫

```bash
# 重置資料庫（清空所有數據）
make db-reset

# 查看資料庫日誌
make logs-db

# 進入 PostgreSQL CLI
make shell-db
> psql -U linkwise_user -d linkwise_db
```

### 重建和重啟

```bash
# 重建所有映像
make rebuild

# 重啟所有服務
make restart

# 完全移除（包括卷）
make down
docker volume prune  # 清理未使用卷
```

---

## 🐛 故障排除

### 問題：容器無法啟動

**症狀**: 執行 `make dev` 後容器立即退出

**排查**:
1. 檢查日誌: `make logs`
2. 檢查端口佔用: `lsof -i :8080` (Mac/Linux) 或 `netstat -ano | findstr :8080` (Windows)
3. 檢查 .env 文件是否存在

**解決**:
```bash
# 確保 .env 存在
make setup

# 清理舊容器
make down

# 重新啟動
make dev
```

### 問題：前端無法連接後端

**症狀**: 前端顯示連接錯誤，API 請求失敗

**原因**: 通常是 Nginx 路由配置問題

**排查**:
1. 檢查後端是否運行: `curl http://localhost:8080/api/v1/users/health`
2. 檢查 Nginx 配置: `docker exec linkwise-nginx nginx -t`
3. 查看 Nginx 日誌: `docker logs linkwise-nginx`

**解決**:
```bash
# 重啟 Nginx
docker-compose restart nginx

# 或完整重啟
make restart
```

### 問題：資料庫連接失敗

**症狀**: 後端日誌顯示 "connection refused" 或類似錯誤

**排查**:
1. 檢查 PostgreSQL 容器: `docker ps | grep postgres`
2. 檢查資料庫日誌: `make logs-db`
3. 測試連接: `docker exec linkwise-db pg_isready -U linkwise_user`

**解決**:
```bash
# 重啟資料庫
docker-compose restart database

# 完整重置
make db-reset
make restart
```

### 問題：磁盤空間已滿

**症狀**: 容器無法啟動，顯示 "no space left on device"

**解決**:
```bash
# 清理未使用的映像
docker image prune -a

# 清理未使用的卷
docker volume prune

# 清理構建快取
docker builder prune
```

---

## 📊 性能調優

### 開發環境優化

```yaml
# docker-compose.dev.yml 中
services:
  backend:
    environment:
      JAVA_OPTS: "-Xmx512m -Xms256m"  # 增加 JVM 記憶體
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### 生產環境優化

```yaml
# docker-compose.prod.yml 中
services:
  backend:
    environment:
      JAVA_OPTS: "-Xmx2g -Xms1g"      # 生產級記憶體
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 3G
```

---

## 🔐 安全最佳實踐

### 1. 環境變量管理
✅ 不要在 Dockerfile 中硬編碼密碼  
✅ 使用 .env 文件，且 .env 不要提交到 Git  
✅ 使用 .env.example 作為模板

### 2. 映像安全
✅ 使用官方映像 (postgres, node, eclipse-temurin)  
✅ 定期更新基礎映像  
✅ 掃描映像中的漏洞: `docker scan linkwise-backend`

### 3. 網絡隔離
✅ 使用專用 Docker 網絡 (linkwise-network)  
✅ 不暴露內部服務端口  
✅ 只暴露 Nginx 網關 (port 8080)

### 4. 卷安全
✅ 設置正確的卷權限  
✅ 定期備份資料庫卷  
✅ 加密敏感數據卷

---

## 📋 Makefile 命令參考

| 命令 | 說明 |
|------|------|
| `make help` | 顯示所有可用命令 |
| `make setup` | 初始化環境（建立 .env） |
| `make dev` | 啟動開發環境 |
| `make prod` | 啟動生產環境 |
| `make stop` | 停止所有服務 |
| `make down` | 停止並移除容器 |
| `make ps` | 顯示容器狀態 |
| `make logs` | 查看所有日誌 |
| `make logs-backend` | 查看後端日誌 |
| `make logs-frontend` | 查看前端日誌 |
| `make logs-db` | 查看資料庫日誌 |
| `make health-check` | 檢查服務健康狀態 |
| `make restart` | 重啟所有服務 |
| `make rebuild` | 重建所有映像 |
| `make shell-backend` | 進入後端容器 |
| `make shell-frontend` | 進入前端容器 |
| `make shell-db` | 進入資料庫容器 |
| `make db-reset` | 重置資料庫 |

---

## 📚 相關資源

- [QUICKSTART.md](QUICKSTART.md) - 5 分鐘快速開始
- [GATEWAY_ARCHITECTURE.md](GATEWAY_ARCHITECTURE.md) - 網關架構詳解
- [docker-compose.yml](docker-compose.yml) - 預設配置
- [docker-compose.dev.yml](docker-compose.dev.yml) - 開發環境配置
- [docker-compose.prod.yml](docker-compose.prod.yml) - 生產環境配置
- [Makefile](Makefile) - 自動化命令

---

**最後更新**: 2026-05-07  
**版本**: v1.0
