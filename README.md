# LinkWise - B2B 採購平台

現代化 B2B 採購平台，採用微服務架構、完整自動化工作流程。

## ⚡ 快速開始

```bash
make setup    # 第一次執行：設置環境
make dev      # 啟動開發環境
```

**訪問應用：**
- 🌐 應用: http://localhost:8080
- 📚 API 文檔: http://localhost:8080/swagger-ui.html

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| **前端** | React 19 + TypeScript + Vite 6 + Tailwind CSS 4 |
| **後端** | Spring Boot 3.2 (Java 17) + JPA + Hibernate |
| **數據庫** | PostgreSQL 16 |
| **部署** | Docker + Docker Compose + Nginx |

## 💻 常用命令

```bash
make dev                # 啟動開發環境
make prod               # 啟動生產環境
make stop               # 停止服務
make logs               # 查看日誌
make shell-backend      # 進入後端容器
```

執行 `make help` 查看所有命令。

## 📚 文檔

| 需要 | 查看位置 |
|------|---------|
| **完整文檔索引** | [docs/INDEX.md](docs/INDEX.md) |
| 系統架構設計 | [docs/design/architecture/](docs/design/architecture/) |
| 編碼標準與指南 | [docs/reference/guidelines/](docs/reference/guidelines/) |
| 項目計畫 | [docs/plans/active/](docs/plans/active/) |
| 需求分析 | [docs/analysis/requirements/](docs/analysis/requirements/) |
| Docker 部署 | [docs/deployment/DOCKER_GUIDE.md](docs/deployment/DOCKER_GUIDE.md) |
| Nginx 架構 | [docs/design/GATEWAY_ARCHITECTURE.md](docs/design/GATEWAY_ARCHITECTURE.md) |

## 🚀 新加入團隊

1. 執行 `make dev` 啟動應用
2. 查看 [docs/INDEX.md](docs/INDEX.md) 了解文檔結構
3. 根據角色查看對應文檔：
   - 開發者 → [編碼標準](docs/reference/guidelines/)
   - 架構師 → [系統架構](docs/design/architecture/)
   - 測試人員 → [測試計畫](docs/testing/)
   - 其他 → [完整文檔索引](docs/INDEX.md)

---

**最後更新：** 2026 年 5 月 7 日
