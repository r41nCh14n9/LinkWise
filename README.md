

# LinkWise - B2B 採購平台

> 採用 **7-Agent AI 協作框架** 的現代軟體開發專案。從需求分析到上線部署的完整自動化工作流程。

## ⚡ 快速開始（30 秒）

```bash
# 1️⃣ 第一次使用？設置環境
make setup

# 2️⃣ 啟動應用
make dev

# 3️⃣ 訪問應用
# 🌐 http://localhost:8080
# 📚 http://localhost:8080/swagger-ui.html
```

**詳細步驟** → 查看 [QUICKSTART.md](QUICKSTART.md)

---

## 🛠️ 技術棧

### 前端 (linkwise-front)
- **框架**: React 19 + TypeScript
- **構建**: Vite 6
- **樣式**: Tailwind CSS 4
- **運行環境**: Node.js (Docker 容器)

### 後端 (linkwise-core)
- **框架**: Spring Boot 3.2 (Java 17)
- **ORM**: Spring Data JPA + Hibernate
- **數據庫**: PostgreSQL 16
- **文檔**: Springdoc OpenAPI (Swagger UI)
- **構建**: Maven 3.9+

### 部署
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx Alpine
- **開發環境**: 熱更新支援
- **生產環境**: 優化配置

### 網絡架構
```
┌──────────────────────────────────────┐
│     Nginx 網關 (localhost:8080)      │
├──────────────────────────────────────┤
│                                      │
├─ 前端 (Vite 3000)                   │
├─ 後端 API (Spring Boot 8080)        │
└─ 資料庫 (PostgreSQL 5432)           │
```

---

## 📋 核心特色

- ✅ **系統化工作流程** - 從需求分析到測試交付的完整自動化流程
- ✅ **完整文檔跟蹤** - 每個決策、設計、代碼都有對應文檔
- ✅ **品質保證** - 內置代碼評審、設計評審、需求驗證
- ✅ **模組化架構** - `linkwise-core` 和 `linkwise-front` 獨立開發
- ✅ **企業級安全** - 統一 Nginx 網關、安全頭部、隱藏基礎設施

---

## 🗺️ 文檔導航

### 📖 按角色查找文檔

| 你是... | 必讀文檔 | 快速鏈接 |
|---------|---------|--------|
| **新加入成員** | 全部 | [新人上手指南](#-新加入團隊成員) |
| **專案經理** | 計畫、進度 | [`docs/plans/active/`](docs/plans/active/) |
| **業務分析師** | 需求、功能 | [`docs/analysis/requirements/`](docs/analysis/requirements/) |
| **系統架構師** | 架構、設計 | [`docs/design/architecture/`](docs/design/architecture/) |
| **開發工程師** | 編碼標準、技術 | [`docs/reference/guidelines/`](docs/reference/guidelines/) |
| **QA/測試人員** | 測試計畫 | [`docs/testing/`](docs/testing/) |
| **DevOps/運維** | Docker、部署 | [DOCKER_GUIDE.md](DOCKER_GUIDE.md), [GATEWAY_ARCHITECTURE.md](GATEWAY_ARCHITECTURE.md) |

### 🚀 我想...

| 我想做... | 查看文檔 |
|----------|---------|
| 30 秒快速開始 | [QUICKSTART.md](QUICKSTART.md) ⭐ |
| 了解項目進度 | [`docs/plans/active/`](docs/plans/active/) |
| 查看系統架構 | [`docs/design/architecture/`](docs/design/architecture/) |
| 開始開發 | [`docs/reference/guidelines/`](docs/reference/guidelines/) |
| 學習代碼示例 | [`docs/reference/examples/good/`](docs/reference/examples/good/) |
| 執行測試 | [`docs/testing/`](docs/testing/) |
| 部署應用 | [DOCKER_GUIDE.md](DOCKER_GUIDE.md) |
| 找完整文檔地圖 | [`docs/INDEX.md`](docs/INDEX.md) |

---

## 📚 主要文檔

| 文檔 | 用途 | 適合對象 |
|------|------|--------|
| [QUICKSTART.md](QUICKSTART.md) | 30 秒快速開始 | 所有人 |
| [DOCKER_GUIDE.md](DOCKER_GUIDE.md) | Docker 使用指南 | 開發者、運維 |
| [GATEWAY_ARCHITECTURE.md](GATEWAY_ARCHITECTURE.md) | Nginx 網關架構 | 架構師、運維 |
| [docs/INDEX.md](docs/INDEX.md) | 完整文檔地圖 | 所有人 |
| [.github/ARCHITECTURE.md](.github/ARCHITECTURE.md) | 系統設計理念 | 架構師、技術主管 |

---

## 💻 常用命令

### 首次設置
```bash
make setup                # 初始化環境（建立 .env 文件）
```

### 開發工作流

```bash
# 啟動/停止
make dev                # 啟動開發環境
make prod               # 啟動生產環境
make stop               # 停止服務
make down               # 停止並移除容器

# 查看狀態
make ps                 # 顯示容器狀態
make logs               # 查看所有日誌
make logs-backend       # 查看後端日誌
make health-check       # 檢查服務健康狀態

# 進入容器
make shell-backend      # 進入後端容器
make shell-frontend     # 進入前端容器
make shell-db           # 進入資料庫容器
```

更多命令 → 執行 `make help` 或查看 [QUICKSTART.md](QUICKSTART.md)

---

## 📁 完整文檔結構

```
├── 📄 README.md (本文件)
├── 🏗️ .github/
│   ├── ARCHITECTURE.md ⭐ 系統設計精神指南
│   ├── agents/           7個 AI Agent 定義
│   └── skills/           Agent 技能實現
│
└── 📚 docs/ (所有項目輸出和指南)
    │
    ├── 📌 INDEX.md ⭐ 完整文檔導航
    │
    ├── 📋 reference/     所有 Agent 共用的標準
    │   ├── guidelines/   編碼標準、技術棧、工作流
    │   ├── templates/    代碼模板、文件模板
    │   ├── examples/     最佳實踐和反面教材
    │   └── requirements/ 項目需求(Agent 輸入)
    │
    ├── 📊 plans/         📋 [Plan Agent 輸出]
    │   ├── active/       當前活躍計畫
    │   └── completed/    已完成計畫
    │
    ├── 📈 analysis/      📊 [SA Agent 輸出]
    │   ├── requirements/ ⭐ 需求分析
    │   └── system-analysis/ 系統分析
    │
    ├── 🏗️ design/        🎨 [SD Agent 輸出]
    │   ├── architecture/ 系統架構
    │   ├── components/   組件規格
    │   ├── apis/         API 設計
    │   ├── database/     數據庫設計
    │   └── diagrams/     架構圖
    │
    ├── 💻 implementation/ 👨‍💻 [Development Agent 輸出]
    │   ├── plans/        實現計畫
    │   ├── code-records/ 代碼文檔
    │   ├── review-guides/ 評審清單
    │   └── integration-guides/ 集成指南
    │
    ├── ✨ review/        🔍 [Review Agent 輸出]
    │   ├── code-reviews/ 代碼質量評審
    │   ├── design-reviews/ 設計評審
    │   └── requirements-reviews/ 需求驗證
    │
    └── ✅ testing/       🧪 [Test Agent 輸出]
        ├── integration/  集成測試
        ├── user/         用戶驗收測試
        └── unit/         單元測試

源代碼:
    src/
    ├── linkwise-core/    核心邏輯層
    └── linkwise-front/   前端介面層
```

---

## 🔄 項目工作流程

### 新專案啟動流程

```
1️⃣ DRAFT 草稿
   └─ 初步概念與目標定義

2️⃣ PLAN 規劃
   └─ 📋 輸出→ docs/plans/active/
   └─ 項目計畫、時程表、里程碑

3️⃣ REQUIREMENTS 需求
   └─ 收集需求、製作記錄、逐字稿
   └─ 輸出→ docs/analysis/requirements/

4️⃣ SYSTEM ANALYSIS (SA)
   └─ 📊 輸出→ docs/analysis/
   └─ 需求代碼對照表
   └─ 非功能性需求文檔
   └─ 系統分析文檔

5️⃣ SYSTEM DESIGN (SD)
   └─ 🏗️ 輸出→ docs/design/
   └─ 架構設計、組件設計、API 設計
   └─ 數據庫設計

6️⃣ DEVELOPMENT
   └─ 💻 輸出→ docs/implementation/
   └─ 實現代碼
   └─ 代碼文檔和評審指南

7️⃣ QUALITY ASSURANCE
   └─ 🔍 代碼評審 → docs/review/code-reviews/
   └─ 🎨 設計評審 → docs/review/design-reviews/
   └─ 📋 需求驗證 → docs/review/requirements-reviews/

8️⃣ TESTING
   └─ ✅ 輸出→ docs/testing/
   └─ 集成測試、用戶驗收測試
```

### 舊系統逆向工程流程

```
1️⃣ 系統分析
   └─ 使用逆向 SA Skill
   └─ 📊 輸出→ docs/analysis/system-analysis/

2️⃣ 設計文檔化
   └─ 基於系統分析產生設計文檔
   └─ 🏗️ 輸出→ docs/design/
```

---

## 🎯 新加入團隊成員

歡迎加入 LinkWise 團隊！以下是快速上手指南：

### 📍 前 30 分鐘

1. **查看項目概覽** → [README.md](README.md) (本文件)
2. **5 分鐘快速啟動** → [QUICKSTART.md](QUICKSTART.md)
3. **執行命令啟動**
   ```bash
   make setup    # 設置環境
   make dev      # 啟動服務
   ```
4. **訪問應用**
   - 🌐 應用: http://localhost:8080
   - 📚 API 文檔: http://localhost:8080/swagger-ui.html

### 🏗️ 了解系統

- **系統架構** → [.github/ARCHITECTURE.md](.github/ARCHITECTURE.md)
- **網關架構** → [GATEWAY_ARCHITECTURE.md](GATEWAY_ARCHITECTURE.md)
- **Docker 指南** → [DOCKER_GUIDE.md](DOCKER_GUIDE.md)

### 👨‍💻 查找您的角色

根據您的職位，查看下方的 **利害關係人快速指南**：

| 您是... | 查看章節 |
|--------|--------|
| 開發工程師 | [👨‍💻 開發工程師](#-開發工程師-developer) |
| 系統架構師 | [🏗️ 系統架構師](#-系統架構師-system-architect) |
| 業務分析師 | [📊 業務分析師](#-業務分析師-business-analyst) |
| 專案經理 | [📋 專案經理](#-專案經理-project-manager) |
| QA/測試人員 | [🧪 QA/測試人員](#-qa測試人員-qa-engineer) |
| DevOps/運維 | [🔧 DevOps](#-devopsdevops-engineer) |

### ❓ 常見問題

**Q: 我應該先做什麼？**  
A: 執行 `make dev` 啟動應用，然後查看與您角色相關的文檔。

**Q: 如何找到特定的文檔？**  
A: 查看 [docs/INDEX.md](docs/INDEX.md) 完整文檔地圖。

**Q: 編碼標準是什麼？**  
A: 查看 [`docs/reference/guidelines/`](docs/reference/guidelines/)。

**Q: 如何參與開發？**  
A: 查看 [`docs/implementation/`](docs/implementation/) 實現指南。

### 🤝 聯絡

- 有問題？查看 [docs/INDEX.md](docs/INDEX.md) 的"文檔地圖"
- 需要幫助？聯繫您的團隊主管

---

## 👥 利害關係人快速指南

### 📋 專案經理 (Project Manager)

**您需要了解：** 進度、時程、里程碑

**關鍵文檔：**
- 👉 [項目計畫](docs/plans/active/) - 當前活躍計畫
- 👉 [實現進度](docs/implementation/plans/) - 開發進度跟蹤
- 👉 [架構概覽](.github/ARCHITECTURE.md) - 系統工作方式

**快速查詢：** "項目現在在哪個階段?" → 查看 `docs/plans/active/` 中最新的計畫文檔

---

### 📊 業務分析師 (Business Analyst)

**您需要了解：** 需求、功能、業務邏輯

**關鍵文檔：**
- 👉 [需求分析](docs/analysis/requirements/) - ⭐ **必讀**
- 👉 [非功能性需求](docs/analysis/requirements/) - 性能、安全、可用性
- 👉 [需求驗證評審](docs/review/requirements-reviews/) - 需求覆蓋度

**快速查詢：** "某功能為什麼這樣設計?" → 查看需求分析文檔中的需求對照表

---

### 🏗️ 系統架構師 (System Architect)

**您需要了解：** 架構、設計、系統決策

**關鍵文檔：**
- 👉 [架構文檔](docs/design/architecture/) - 系統整體架構
- 👉 [組件設計](docs/design/components/) - 各模組詳細設計
- 👉 [API 設計](docs/design/apis/) - API 規格
- 👉 [設計評審](docs/review/design-reviews/) - 設計驗證

**快速查詢：** "系統架構是什麼?" → 查看 `docs/design/architecture/`

---

### 👨‍💻 開發工程師 (Developer)

**您需要了解：** 編碼標準、技術棧、實現指南

**關鍵文檔：**
- 👉 [編碼標準](docs/reference/guidelines/) - ⭐ **必讀**
- 👉 [技術棧指南](docs/reference/guidelines/) - 使用的技術
- 👉 [代碼模板](docs/reference/templates/) - 推薦的代碼結構
- 👉 [最佳實踐](docs/reference/examples/good/) - 參考實現
- 👉 [實現指南](docs/implementation/code-records/) - 具體實現方式
- 👉 [集成指南](docs/implementation/integration-guides/) - 集成步驟

**快速查詢：** "怎樣寫符合標準的代碼?" → 查看 `docs/reference/guidelines/` 和 `docs/reference/templates/`

---

### 🧪 QA/測試人員 (QA/Tester)

**您需要了解：** 測試計畫、測試案例、驗收標準

**關鍵文檔：**
- 👉 [集成測試計畫](docs/testing/integration/) - 整體系統測試
- 👉 [用戶驗收測試](docs/testing/user/) - UAT 案例
- 👉 [單元測試](docs/testing/unit/) - 代碼級測試
- 👉 [代碼評審](docs/review/code-reviews/) - 代碼質量指標

**快速查詢：** "應該測試什麼?" → 查看 `docs/testing/`

---

### 🎓 新加入團隊成員

**推薦閱讀順序：**

1. **第一天** 📌
   - 本文件 (README.md) - 了解全局
   - [文檔中心索引](docs/INDEX.md) - 了解文檔結構
   - [架構文檔](.github/ARCHITECTURE.md) - 理解系統設計理念

2. **第二週** 📋
   - [編碼標準](docs/reference/guidelines/) - 了解技術標準
   - [代碼模板](docs/reference/templates/) - 了解代碼結構
   - [最佳實踐](docs/reference/examples/good/) - 學習推薦做法

3. **開發前** 🚀
   - [項目計畫](docs/plans/active/) - 了解當前任務
   - [需求分析](docs/analysis/requirements/) - 了解功能需求
   - [架構設計](docs/design/architecture/) - 了解系統設計

---

## 🚀 快速開始

### 我想...

#### 📋 "了解項目目前做什麼"
👉 查看 [`docs/plans/active/`](docs/plans/active/) - 當前活躍計畫

#### 🔍 "找到某個功能的文檔"
👉 查看 [`docs/analysis/requirements/`](docs/analysis/requirements/) - 需求文檔中有功能說明

#### 🏗️ "了解系統架構"
👉 查看 [`docs/design/architecture/`](docs/design/architecture/) - 架構文檔

#### 💻 "開始開發"
👉 依序查看：
   1. [`docs/reference/guidelines/`](docs/reference/guidelines/) - 編碼標準
   2. [`docs/reference/templates/`](docs/reference/templates/) - 代碼模板
   3. [`docs/implementation/code-records/`](docs/implementation/code-records/) - 實現指南

#### 🧪 "執行測試"
👉 查看 [`docs/testing/`](docs/testing/) - 測試計畫和案例

#### ✅ "提交代碼評審"
👉 查看 [`docs/review/code-reviews/`](docs/review/code-reviews/) - 評審標準

#### ❓ "找不到某個文檔"
👉 查看 [`docs/INDEX.md`](docs/INDEX.md) - 完整文檔地圖

---

## 📞 獲得幫助

| 問題類型 | 查看位置 |
|----------|----------|
| 項目計畫和進度 | [`docs/plans/active/`](docs/plans/active/) |
| 功能和需求 | [`docs/analysis/requirements/`](docs/analysis/requirements/) |
| 系統架構 | [`docs/design/architecture/`](docs/design/architecture/) |
| 編碼標準 | [`docs/reference/guidelines/`](docs/reference/guidelines/) |
| 代碼示例 | [`docs/reference/examples/good/`](docs/reference/examples/good/) |
| 實現指南 | [`docs/implementation/code-records/`](docs/implementation/code-records/) |
| 測試計畫 | [`docs/testing/`](docs/testing/) |
| 項目整體結構 | [`docs/INDEX.md`](docs/INDEX.md) 或 [`.github/ARCHITECTURE.md`](.github/ARCHITECTURE.md) |

---

## 📚 延伸閱讀

- **完整文檔導航** - [`docs/INDEX.md`](docs/INDEX.md)
- **系統架構設計** - [`.github/ARCHITECTURE.md`](.github/ARCHITECTURE.md)
- **Agent 定義** - [`.github/agents/`](.github/agents/)
- **Skill 詳細說明** - [`.github/skills/`](.github/skills/)

---

**最後更新：** 2026 年 5 月 6 日  
**專案名稱：** LinkWise  
**文檔版本：** 1.0




