## Web-based Construction Management System

A platform to plan, track, and manage construction projects in one place. Built for SE2030 (Y2S1).

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, shadcn/ui, React Router  
**Backend:** Spring Boot 3, Spring Security (OAuth2 Resource Server), JPA/Hibernate, MySQL  
**Additional Services:** Asgardeo (authentication), Twilio (SMS)

## Prerequisites

Before you start, make sure you have installed or created accounts for:

- [Java 17](https://adoptium.net/) and [Maven](https://maven.apache.org/)
- [Node.js v18+ and npm](https://nodejs.org/)
- [MySQL 8+](https://dev.mysql.com/downloads/mysql/)
- [Asgardeo Account](https://wso2.com/asgardeo/) (for authentication)
- [Twilio Account](https://www.twilio.com/) (for SMS/notifications)
- [OpenWeatherMap](https://openweathermap.org/api) ( for weather updates)

## Setup Process

### 1. Clone the forked Repository

```bash
git clone https://github.com/<username>/SE2030.git
cd SE2030
```

### 2. Backend Setup (Spring Boot)

#### 2.1 Configure MySQL

1. Create a MySQL database (default: `se2030`).
2. Configure credentials via environment variables or edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/se2030}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
```

#### 2.2 Configure Asgardeo (JWT Validation)

Set the issuer and JWKS URLs to match your Asgardeo organization:

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://api.asgardeo.io/t/<org-name>/oauth2/token
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://api.asgardeo.io/t/<org-name>/oauth2/jwks
```

#### 2.3 Configure Twilio (optional)

Provide your Twilio credentials and phone number:

```properties
twilio.account.sid=<account-sid>
twilio.api.key=<api-key>
twilio.api.secret=<api-secret>
twilio.phone.number=<e164-phone-number>
```

#### 2.4 Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend available at: `http://localhost:8080`

---

### 3. Frontend Setup (React + Vite)

#### 3.1 Install Dependencies

```bash
cd webapp
pnpm install
```

#### 3.2 Configure Asgardeo (Frontend)

Create a `.env` file in `webapp/` (Vite uses the `VITE_` prefix):

```env
VITE_ASGARDEO_ISSUER=https://api.asgardeo.io/t/<org-name>/oauth2/token
VITE_ASGARDEO_JWKS=https://api.asgardeo.io/t/<org-name>/oauth2/jwks
VITE_ASGARDEO_CLIENT_ID=<client-id>
```

Adjust to match how your app reads these values.

#### 3.3 Run Frontend

```bash
pnpm dev
```

Frontend available at: `http://localhost:5173`


## Features

- **Project management** – create projects, allocations, and track progress
- **Task management** – assign and track tasks across teams
- **Suppliers & procurement** – manage suppliers and purchasing workflows
- **Materials & equipment** – inventory, usage, and availability
- **Finance** – basic project finance and cost tracking
- **Issues & defects** – log, prioritize, and resolve site issues