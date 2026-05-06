# 📊 Diagram Standards for SD Agent Output

> **Scope:** Diagram specifications for System Design (SD) agent outputs
> **Apply To:** SD agent when generating design documents
> **Status:** Active
> **Extends:** `.github/skills/reference/assets/DIAGRAM-STANDARDS.md`

---

## 🎯 SD Diagram Focus

The SD agent generates diagrams for **technical architecture, component design, data models, and system infrastructure**.

---

## 📐 Supported Diagram Types (SD)

### 1. **Architecture Diagrams** (Primary)

**Purpose:** High-level system architecture and component relationships

**Mermaid Format:**
```mermaid
graph TD
    subgraph Client["Client Layer"]
        A["Web Browser"]
        B["Mobile App"]
    end
    
    subgraph API["API Layer"]
        C["API Gateway"]
        D["Auth Service"]
    end
    
    subgraph Data["Data Layer"]
        E["Database"]
        F["Cache"]
    end
    
    A -->|HTTPS| C
    B -->|HTTPS| C
    C --> D
    C --> E
    C --> F
```

**Naming:** `ARCHITECTURE-[ComponentName].md`

**Embedding Location:** `docs/design/architecture/`

**Example Use Cases:**
- System architecture overview
- Layer architecture (presentation, business, data)
- Microservices architecture
- Cloud infrastructure layout

---

### 2. **Component Diagrams** (Secondary)

**Purpose:** Detailed component structure and dependencies within a system

**Mermaid Format:**
```mermaid
graph TD
    subgraph Auth["Auth Component"]
        A["Authenticator"]
        B["Token Manager"]
        C["Session Store"]
    end
    
    subgraph API["API Component"]
        D["Request Router"]
        E["Request Handler"]
    end
    
    A --> B
    B --> C
    D --> E
    D --> A
    E --> A
```

**Naming:** `COMPONENT-[ComponentName].md`

**Embedding Location:** `docs/design/components/`

**Example Use Cases:**
- Authentication system components
- Data processing pipeline
- Message queue components
- Service orchestration

---

### 3. **Data Model / ER Diagrams** (Primary)

**Purpose:** Database schema, entity relationships, and data structures

**Mermaid Format:**
```mermaid
erDiagram
    USERS ||--o{ TASKS : "owns"
    USERS ||--o{ SESSIONS : "has"
    TASKS ||--o{ COMMENTS : "has"
    
    USERS {
        int user_id PK
        string email UK
        string name
        datetime created_at
    }
    
    TASKS {
        int task_id PK
        int user_id FK
        string title
        string status
        datetime due_date
    }
    
    SESSIONS {
        int session_id PK
        int user_id FK
        string token
        datetime expires_at
    }
    
    COMMENTS {
        int comment_id PK
        int task_id FK
        int user_id FK
        string content
        datetime created_at
    }
```

**Naming:** `SCHEMA-[EntityName].md` or `SCHEMA-[Context]-Relationships.md`

**Embedding Location:** `docs/design/database/`

**Example Use Cases:**
- Complete database schema
- Entity relationships
- Data type definitions
- Constraint specifications

---

### 4. **Deployment Diagrams** (Supporting)

**Purpose:** Infrastructure, deployment topology, and environment setup

**Mermaid Format:**
```mermaid
graph TD
    subgraph Cloud["☁️ AWS Cloud"]
        subgraph Compute["Compute"]
            A["ECS Cluster"]
            B["Lambda Functions"]
        end
        
        subgraph Database["Database"]
            C["RDS - PostgreSQL"]
            D["ElastiCache"]
        end
        
        subgraph Storage["Storage"]
            E["S3 - Assets"]
            F["CloudFront - CDN"]
        end
    end
    
    G["Internet Users"] -->|HTTPS| F
    F --> E
    A --> C
    A --> D
    B --> C
```

**Naming:** `DEPLOYMENT-[Environment].md`

**Embedding Location:** `docs/design/architecture/`

**Example Use Cases:**
- Production deployment architecture
- Development environment setup
- Cloud infrastructure
- Scaling and load balancing

---

## 🎨 SD-Specific Styling

### Color Conventions

```mermaid
graph TD
    A["Component: #1E90FF"]:::component
    B["Data Layer: #32CD32"]:::data
    C["External: #FF8C00"]:::external
    D["Infrastructure: #9370DB"]:::infra
    
    classDef component fill:#1E90FF,stroke:#0047AB,color:#fff
    classDef data fill:#32CD32,stroke:#228B22,color:#000
    classDef external fill:#FF8C00,stroke:#FF6347,color:#fff
    classDef infra fill:#9370DB,stroke:#4B0082,color:#fff
```

### Layer/Subsystem Grouping

```mermaid
graph TD
    subgraph Presentation["Presentation Layer 🖥️"]
        A["UI Components"]
        B["View Models"]
    end
    
    subgraph Business["Business Layer 🔧"]
        C["Services"]
        D["Orchestrators"]
    end
    
    subgraph Persistence["Persistence Layer 🗄️"]
        E["Repositories"]
        F["Database"]
    end
```

---

## 📋 Template: SD Document with Diagrams

```markdown
# Design: [Component/System Name]

## Overview
[Design description]

## System Architecture

\`\`\`mermaid
graph TD
    [Architecture diagram here]
\`\`\`

## Component Structure

\`\`\`mermaid
graph TD
    [Component relationships here]
\`\`\`

## Data Model

\`\`\`mermaid
erDiagram
    [Entity relationships here]
\`\`\`

## Deployment Architecture

\`\`\`mermaid
graph TD
    [Infrastructure diagram here]
\`\`\`

## Design Decisions
[Rationale and trade-offs]

## Technology Stack
[Selected technologies]

## API Specifications
[Interface definitions]
```

---

## ✅ SD Diagram Checklist

Before finalizing SD diagrams:

- [ ] Architecture clearly shows component boundaries
- [ ] Dependencies and data flow are accurate
- [ ] All entities and relationships in ER diagram
- [ ] Database constraints clearly documented
- [ ] Infrastructure components properly labeled
- [ ] Color scheme applied consistently
- [ ] Diagram is embedded in markdown (not separate)
- [ ] Following SD naming convention
- [ ] Located in appropriate `docs/design/` subfolder
- [ ] Diagram supports the design narrative

---

## 📚 Related

- [Framework: Diagram Standards](../reference/assets/DIAGRAM-STANDARDS.md)
- [SD Skill](../SKILL.md)
- [Output Locations](../../../docs/design/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-05-06 | Initial SD diagram specifications |
