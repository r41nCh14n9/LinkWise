# 🚀 LinkWise 快速啟動指南

## ⚡ 5 分鐘快速開始

### 1️⃣ 第一次啟動？
```bash
make setup              # 設置 .env 文件
```

### 2️⃣ 啟動應用
```bash
make dev                # 開發環境（推薦）
# 或
make prod               # 生產環境
```

### 3️⃣ 訪問應用
- 🌐 **應用首頁**: http://localhost:8080
- 📚 **API 文檔**: http://localhost:8080/swagger-ui.html
- 🔧 **API 端點**: http://localhost:8080/api/v1/users

✅ **完成！** 就這麼簡單！

---

## 📋 常用命令

### 啟動/停止
```bash
make dev                # 啟動開發環境
make prod               # 啟動生產環境
make stop               # 停止服務
make down               # 停止並移除容器
make restart            # 重啟所有服務
```

### 查看狀態
```bash
make ps                 # 顯示容器狀態
make logs               # 查看所有日誌
make logs-backend       # 查看後端日誌
make logs-frontend      # 查看前端日誌
make logs-db            # 查看資料庫日誌
make health-check       # 檢查服務健康狀態
```

### 進入容器
```bash
make shell-backend      # 進入後端容器
make shell-frontend     # 進入前端容器
make shell-db           # 進入資料庫容器
```

### 數據管理
```bash
make db-reset           # 重置資料庫
make clean              # 刪除所有容器和卷
```

### 開發操作
```bash
make rebuild            # 重新編譯所有映像
make version            # 查看 Docker 版本
```

---

## 🆘 故障排查

### Nginx 無法訪問（unhealthy）
```bash
make logs               # 查看 Nginx 日誌
docker-compose restart nginx
```

### 前端/後端無法連接
```bash
make ps                 # 檢查容器是否都在運行
docker network ls       # 檢查網絡
```

### 資料庫連接失敗
```bash
make logs-db            # 查看資料庫日誌
# 確保 DB_HOST=database 在 .env 中
```

---

## 📚 詳細文檔

- 🐳 **Docker 詳細指南**: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
- 🔗 **Nginx 架構**: [GATEWAY_ARCHITECTURE.md](GATEWAY_ARCHITECTURE.md)
- 🏗️ **系統設計**: [docs/design/architecture/](docs/design/architecture/)

---

## ✨ 提示

💡 使用 `make help` 查看所有可用命令  
💡 所有服務都通過單一 8080 端口訪問  
💡 開發環境保留熱更新功能  
💡 使用 `.env` 自定義配置  

**需要幫助？** 查看 [DOCKER_GUIDE.md](DOCKER_GUIDE.md) 或 [GATEWAY_ARCHITECTURE.md](GATEWAY_ARCHITECTURE.md)
