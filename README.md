

# 📌 LinkWise 專案文檔中心

歡迎來到 LinkWise 專案！本文檔為第一次接觸此專案的利害關係人提供快速導覽和關鍵資訊。

---

## 🎯 項目概述

**LinkWise** 是一個採用 **7-Agent AI 協作框架** 的現代軟體開發專案。

### 核心特色
- ✅ **系統化工作流程** - 從需求分析到測試交付的完整自動化流程
- ✅ **完整文檔跟蹤** - 每個決策、設計、代碼都有對應文檔
- ✅ **品質保證** - 內置代碼評審、設計評審、需求驗證
- ✅ **模組化架構** - `linkwise-core` 和 `linkwise-front` 獨立開發

---

## 🗺️ 快速導航

根據您的角色，以下是關鍵文檔位置：

### 📖 所有人必讀
| 角色 | 必讀文檔 | 位置 |
|------|----------|------|
| **專案經理** | 項目計畫、進度、里程碑 | [`docs/plans/active/`](docs/plans/active/) |
| **業務分析師** | 需求文檔、功能規格 | [`docs/analysis/requirements/`](docs/analysis/requirements/) |
| **系統架構師** | 系統設計、架構文檔 | [`docs/design/architecture/`](docs/design/architecture/) |
| **開發工程師** | 編碼標準、技術指南 | [`docs/reference/guidelines/`](docs/reference/guidelines/) |
| **QA/測試人員** | 測試計畫、測試案例 | [`docs/testing/`](docs/testing/) |
| **專案主管** | 架構文檔、工作流程 | [`docs/INDEX.md`](docs/INDEX.md) |

---

## 📁 文檔中心地圖

```
📦 LinkWise/
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




