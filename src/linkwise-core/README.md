# LinkWise Core Backend

Java Spring Boot 後端服務，負責 LinkWise B2B Procurement Platform 的業務邏輯和數據管理。

## 📋 項目概述

- **技術棧**: Java 17, Spring Boot 3.2.2, Spring Data JPA, PostgreSQL
- **構建工具**: Maven
- **API文檔**: Swagger UI (OpenAPI 3.0)
- **Docker支援**: 完整容器化部署

## 🏗️ 項目結構

```
src/linkwise-core/
├── src/
│   ├── main/
│   │   ├── java/com/linkwise/
│   │   │   ├── LinkWiseCoreApplication.java    # 主應用類
│   │   │   ├── entity/                          # 數據實體
│   │   │   │   └── User.java
│   │   │   ├── repository/                      # 數據訪問層
│   │   │   │   └── UserRepository.java
│   │   │   ├── service/                         # 業務邏輯層
│   │   │   │   └── UserService.java
│   │   │   ├── controller/                      # REST 控制器
│   │   │   │   └── UserController.java
│   │   │   └── config/                          # 配置類
│   │   └── resources/
│   │       ├── application.yml                  # 主配置
│   │       ├── application-dev.yml              # 開發配置
│   │       └── application-prod.yml             # 生產配置
│   └── test/                                    # 測試代碼
├── pom.xml                                      # Maven 依賴配置
├── Dockerfile                                   # Docker 構建文件
└── README.md                                    # 此文件
```

## 🚀 快速開始

### 前置條件

- Java 17 或更高版本
- Maven 3.9+
- PostgreSQL 16
- Docker (可選)

### 1. 本地開發環境

#### 安裝依賴
```bash
mvn clean install
```

#### 啟動應用
```bash
mvn spring-boot:run
```

應用將在容器內的 `http://localhost:8080` 監聽，通過 Nginx 反向代理暴露在外部的 `http://localhost:8080`

#### 查看 API 文檔
訪問 `http://localhost:8080/swagger-ui.html`

### 2. Docker 環境

使用項目根目錄的 Docker Compose 配置：

```bash
# 開發環境
docker-compose -f docker-compose.dev.yml up -d

# 生產環境
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 數據庫配置

### 環境變數

應用程序通過環境變數連接到 PostgreSQL：

```env
DB_HOST=localhost          # 資料庫主機
DB_PORT=5432             # 資料庫端口
DB_USER=linkwise_user    # 數據庫用戶
DB_PASSWORD=password     # 數據庫密碼
DB_NAME=linkwise_db      # 數據庫名稱
```

### 自動建表

第一次啟動時，應用會自動根據實體類創建表：

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # 開發時自動更新schema
```

### 數據庫初始化

支持在 `src/main/resources/db/migration/` 中放置 SQL 初始化文件

## 🔌 API 端點

### 用戶管理 API

#### 創建用戶
```bash
POST /api/v1/users
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STAFF"
}
```

#### 獲取所有用戶
```bash
GET /api/v1/users
```

#### 獲取活躍用戶
```bash
GET /api/v1/users/active
```

#### 根據 ID 獲取用戶
```bash
GET /api/v1/users/{id}
```

#### 根據 Email 獲取用戶
```bash
GET /api/v1/users/email/{email}
```

#### 更新用戶
```bash
PUT /api/v1/users/{id}
Content-Type: application/json

{
  "firstName": "Jane",
  "role": "MANAGER"
}
```

#### 刪除用戶
```bash
DELETE /api/v1/users/{id}
```

#### 健康檢查
```bash
GET /api/v1/users/health
```

## 🔧 配置文件

### application.yml (主配置)

```yaml
spring:
  application:
    name: linkwise-core
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update

server:
  port: ${BACKEND_PORT:5000}
```

### 環境特定配置

- `application-dev.yml` - 開發環境配置
- `application-prod.yml` - 生產環境配置

激活配置：
```bash
# 開發環境
java -jar app.jar --spring.profiles.active=dev

# 生產環境
java -jar app.jar --spring.profiles.active=prod
```

## 📚 主要依賴

| 依賴 | 版本 | 用途 |
|------|------|------|
| spring-boot-starter-web | 3.2.2 | Web MVC 框架 |
| spring-boot-starter-data-jpa | 3.2.2 | ORM 框架 |
| postgresql | 42.7.2 | PostgreSQL 驅動 |
| lombok | 1.18.x | 代碼簡化 |
| springdoc-openapi | 2.2.0 | API 文檔 (Swagger) |

## 🛠️ 開發指南

### 添加新實體

1. 在 `entity/` 目錄下創建實體類
2. 使用 `@Entity` 和 `@Table` 注解
3. 使用 `@Lombok` 簡化代碼

```java
@Entity
@Table(name = "your_table")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class YourEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
}
```

### 添加新 Repository

在 `repository/` 目錄下創建：

```java
@Repository
public interface YourRepository extends JpaRepository<YourEntity, Long> {
    Optional<YourEntity> findByName(String name);
}
```

### 添加新 Service

在 `service/` 目錄下創建：

```java
@Service
@RequiredArgsConstructor
public class YourService {
    private final YourRepository repository;
    
    public YourEntity create(YourEntity entity) {
        return repository.save(entity);
    }
}
```

### 添加新 Controller

在 `controller/` 目錄下創建：

```java
@RestController
@RequestMapping("/api/v1/your-resources")
@RequiredArgsConstructor
public class YourController {
    private final YourService service;
    
    @PostMapping
    public ResponseEntity<YourEntity> create(@RequestBody YourEntity entity) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.create(entity));
    }
}
```

## 🧪 測試

### 運行所有測試
```bash
mvn test
```

### 運行特定測試
```bash
mvn test -Dtest=YourTestClass
```

## 📦 構建

### 開發構建
```bash
mvn clean compile
```

### JAR 包構建
```bash
mvn clean package
```

生成的 JAR 文件在 `target/` 目錄下

### Docker 構建
```bash
docker build -t linkwise-backend:latest .
```

## 🚢 部署

### Docker 部署
```bash
# 構建映像
docker build -t linkwise-backend:latest .

# 運行容器
docker run -d \
  --name linkwise-backend \
  -p 5000:5000 \
  -e DB_HOST=database \
  -e DB_PORT=5432 \
  -e DB_USER=linkwise_user \
  -e DB_PASSWORD=password \
  -e DB_NAME=linkwise_db \
  linkwise-backend:latest
```

### Docker Compose 部署
參考根目錄的 `docker-compose.yml` 或 `DOCKER_GUIDE.md`

## 🔒 安全考慮

- [ ] 使用密碼加密（BCrypt）
- [ ] 實現認證和授權（Spring Security）
- [ ] 輸入驗證和清理
- [ ] SQL 注入防護（使用 JPA）
- [ ] CORS 配置
- [ ] HTTPS 配置
- [ ] API 速率限制

## 📝 Lombok 注解說明

使用的 Lombok 注解：

- `@Data` - 自動生成 getter, setter, toString, equals, hashCode
- `@NoArgsConstructor` - 生成無參構造器
- `@AllArgsConstructor` - 生成全參構造器
- `@Builder` - 生成 Builder 模式
- `@RequiredArgsConstructor` - 生成必需參數的構造器
- `@Slf4j` - 生成 log4j 的 logger 實例

## 🐛 常見問題

### 1. 數據庫連接失敗
```
Error: Connection refused
```

**解決方案:**
- 確保 PostgreSQL 服務正在運行
- 檢查數據庫主機、端口、用戶名和密碼
- 確保 `DB_HOST` 正確（Docker 環境中使用 `database`）

### 2. Maven 依賴下載失敗
```bash
# 清除 Maven 緩存並重試
mvn clean install -U
```

### 3. 端口已被占用
```bash
# 更改端口
java -jar app.jar --server.port=8080
```

## 📖 相關文檔

- [Spring Boot 官方文檔](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Hibernate](https://hibernate.org/)
- [PostgreSQL](https://www.postgresql.org/docs/)

## 📞 支援

如有問題或建議，請提交 Issue 或聯繫開發團隊。

---

**版本**: 0.0.1-SNAPSHOT  
**最後更新**: 2026-05-06
