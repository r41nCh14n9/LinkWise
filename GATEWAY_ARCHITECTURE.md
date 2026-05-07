# 🏗️ Nginx 網關架構說明

## 📌 架構概覽

LinkWise 採用 **統一 Nginx 網關** 架構，所有外部請求都通過單一入口 (port 8080)，由 Nginx 反向代理到內部服務。

```
┌──────────────────────────────────────────────────────┐
│            客戶端 (外部訪問)                         │
│          http://localhost:8080                      │
└──────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────┐
│         Nginx 反向代理 (Port 8080)                  │
│  ├─ /                    → 前端 (localhost:3000)   │
│  ├─ /api/*               → 後端 (localhost:8080)   │
│  ├─ /swagger-ui.html     → 後端 Swagger           │
│  ├─ /v3/api-docs         → 後端 API 文檔          │
│  └─ /webjars/*           → Swagger 資源           │
└──────────────────────────────────────────────────────┘
         ↙                    ↙                    ↙
    ┌────────────┐      ┌────────────┐      ┌────────────┐
    │ 前端應用   │      │ 後端 API   │      │ 資料庫     │
    │ (3000)     │      │ (8080)     │      │ (5432)     │
    │ React+     │      │ Spring     │      │ PostgreSQL │
    │ Vite       │      │ Boot       │      │            │
    └────────────┘      └────────────┘      └────────────┘
         (內部)              (內部)              (內部)
```

---

## 🎯 為什麼選擇統一網關？

### ✅ 優點

#### 1. **安全性增強**
- ✅ 隱藏內部服務架構
- ✅ 集中安全管理（安全頭部、速率限制等）
- ✅ DDoS 防護更容易實現
- ✅ 後端 API 不直接暴露

#### 2. **消除 CORS 問題**
- ✅ 前端和後端同源 (localhost:8080)
- ✅ 無需配置 CORS 頭部
- ✅ Cookie 和身份驗證更簡單
- ✅ 減少跨域請求的複雜性

#### 3. **簡化部署**
- ✅ 只需配置單一端口 (8080)
- ✅ SSL/TLS 只需在 Nginx 配置
- ✅ 負載均衡在一個地方
- ✅ 易於與 Docker 整合

#### 4. **性能優化**
- ✅ Nginx 用作負載均衡器
- ✅ 靜態文件快取
- ✅ gzip 壓縮
- ✅ 連接複用

#### 5. **開發體驗**
- ✅ 無需處理多個端口
- ✅ 統一的本地開發 URL
- ✅ 生產環境與本地一致

---

## 🔧 Nginx 路由配置

### 路由規則

| 路徑 | 目標 | 用途 |
|------|------|------|
| `/` | 前端 (3000) | 主應用首頁 |
| `/api/*` | 後端 (8080) | REST API 端點 |
| `/swagger-ui.html` | 後端 (8080) | Swagger UI 入口 |
| `/swagger-ui/*` | 後端 (8080) | Swagger 資源（CSS/JS） |
| `/webjars/*` | 後端 (8080) | Swagger UI 依賴 |
| `/v3/api-docs` | 後端 (8080) | OpenAPI 規格 |
| `其他` | 前端 (3000) | 前端路由 |

### 開發環境配置 (nginx/dev.conf)

```nginx
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:8080;
}

server {
    listen 8080;
    server_name _;

    # 禁用快取（便於開發和熱更新）
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";

    # API 路由
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger 文檔
    location /swagger-ui.html {
        proxy_pass http://backend;
    }

    location /swagger-ui/ {
        proxy_pass http://backend;
    }

    location /webjars/ {
        proxy_pass http://backend;
    }

    location /v3/api-docs {
        proxy_pass http://backend;
    }

    # 靜態前端資源
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        
        # 支援 WebSocket
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 生產環境配置 (nginx/default.conf)

```nginx
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:8080;
}

server {
    listen 8080;
    server_name _;

    # 隱藏 Nginx 版本
    server_tokens off;

    # 安全頭部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    
    # 移除 Server 頭部
    proxy_hide_header Server;

    # 快取策略
    expires 1h;
    add_header Cache-Control "public, max-age=3600";

    # API 不快取
    location /api/ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger（生產不建議暴露）
    location /swagger-ui.html {
        proxy_pass http://backend;
    }

    location /swagger-ui/ {
        proxy_pass http://backend;
    }

    location /webjars/ {
        proxy_pass http://backend;
    }

    location /v3/api-docs {
        proxy_pass http://backend;
    }

    # 前端
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}
```

---

## 🔐 安全功能

### 1. 安全頭部

| 頭部 | 作用 | 生產設置 |
|------|------|--------|
| `X-Frame-Options` | 防止點擊劫持 | `SAMEORIGIN` |
| `X-Content-Type-Options` | 防止 MIME 嗅探 | `nosniff` |
| `X-XSS-Protection` | 防止 XSS 攻擊 | `1; mode=block` |
| `Content-Security-Policy` | 內容安全政策 | `default-src 'self'` |
| `Referrer-Policy` | 隱私保護 | `no-referrer-when-downgrade` |

### 2. 隱藏基礎設施信息

```nginx
# 隱藏 Nginx 版本
server_tokens off;

# 移除 Server 頭部
proxy_hide_header Server;

# 隱藏後端信息
proxy_hide_header X-Powered-By;
```

### 3. 速率限制（可選）

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://backend;
}
```

---

## 🔄 流量流向示例

### 前端首頁請求

```
1. 客戶端訪問: http://localhost:8080/
2. Nginx 收到請求
3. 路由匹配 "/" → 前端
4. Nginx 代理到 frontend:3000
5. Vite 返回 HTML/JS
6. 客戶端顯示頁面
```

### API 調用

```
1. 前端 JavaScript 發起: fetch('/api/v1/users')
2. Nginx 收到: /api/v1/users
3. 路由匹配 "/api/" → 後端
4. Nginx 代理到 backend:8080
5. Spring Boot 處理請求
6. 返回 JSON 響應
7. 前端 JavaScript 接收
```

### Swagger UI 訪問

```
1. 客戶端訪問: http://localhost:8080/swagger-ui.html
2. Nginx 收到請求
3. 路由匹配 "/swagger-ui.html" → 後端
4. Nginx 代理到 backend:8080
5. Spring Boot 返回 Swagger UI
6. 瀏覽器加載 CSS/JS (from /swagger-ui/ 和 /webjars/)
7. UI 通過 /v3/api-docs 獲取 API 文檔
8. Swagger UI 渲染 API 文檔
```

---

## 🚀 性能考慮

### 開發環境
- ❌ 無快取（便於熱更新）
- ❌ 詳細日誌（便於調試）
- ✅ 快速反應

### 生產環境
- ✅ 積極快取（靜態資源）
- ✅ gzip 壓縮
- ✅ 連接複用
- ✅ 最小日誌
- ✅ 最優性能

---

## 📊 容器網絡

### 網絡隔離

```yaml
networks:
  linkwise-network:
    driver: bridge
```

### 服務通信

```
所有服務在同一個 Docker 網絡上運行:
- frontend (內部 DNS: frontend)
- backend (內部 DNS: backend)
- database (內部 DNS: database)
- nginx (內部 DNS: nginx)

它們可以通過服務名稱通信，例如:
- backend 可以連接 database://database:5432
- frontend 可以訪問 backend http://backend:8080
```

---

## 🔍 故障排除

### 問題：無法訪問應用

**檢查清單**:
1. Nginx 是否運行？ `docker ps | grep nginx`
2. 後端是否健康？ `curl http://localhost:8080/api/v1/users/health`
3. 前端是否運行？ `curl http://localhost:8080/`
4. Nginx 配置是否正確？ `docker exec linkwise-nginx nginx -t`

### 問題：API 返回 504

**原因**: 後端服務無響應

**解決**:
```bash
# 檢查後端日誌
docker logs linkwise-backend

# 檢查後端健康
docker exec linkwise-backend curl http://localhost:8080/api/v1/users/health

# 重啟後端
docker-compose restart backend
```

### 問題：Swagger UI 顯示 404

**原因**: Nginx 未正確路由到後端資源

**解決**:
```bash
# 驗證 Nginx 配置
docker exec linkwise-nginx cat /etc/nginx/conf.d/default.conf | grep swagger

# 重新加載 Nginx
docker exec linkwise-nginx nginx -s reload
```

---

## 💡 最佳實踐

### ✅ 開發
- 使用 dev 配置以支援熱更新
- 增加詳細日誌便於調試
- 使用 make 命令管理服務

### ✅ 生產
- 啟用 HTTPS/SSL
- 配置速率限制
- 啟用日誌聚合
- 設置監控告警
- 定期更新基礎映像
- 使用 prod 配置進行優化

### ✅ 安全
- 隱藏版本信息
- 配置所有安全頭部
- 驗證所有輸入
- 使用環境變量管理密鑰
- 定期安全審查

---

## 📚 相關資源

- [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - Docker 完整指南
- [QUICKSTART.md](QUICKSTART.md) - 快速開始
- [nginx/dev.conf](nginx/dev.conf) - 開發配置
- [nginx/default.conf](nginx/default.conf) - 生產配置
- [docker-compose.yml](docker-compose.yml) - Docker Compose 配置

---

**最後更新**: 2026-05-07  
**版本**: v1.0
