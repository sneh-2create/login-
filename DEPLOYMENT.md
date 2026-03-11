# Micro-Frontend Deployment Architecture

## Overview
Our OD ERP uses a **Reverse Proxy Micro-Frontend Architecture** where each module is a standalone React application that can be developed, deployed, and scaled independently.

---

## Development Environment

### How It Works Locally

When you run `pnpm dev`, each app starts on its own port:

```
Shell:          http://localhost:3000
Admission CRM:  http://localhost:3001
Fee Module:     http://localhost:3002
Academic:       http://localhost:3003
Exam/COE:       http://localhost:3004
HRM:            http://localhost:3005
Back Office:    http://localhost:3006
```

### The Shell's Role in Development

The **Shell** (`apps/shell`) is the **container application** that provides:
1. **Navigation** - Sidebar with links to all modules
2. **Layout** - Header, Sidebar, Footer
3. **Shared State** - Redux store for auth, session, user data
4. **Routing** - React Router that defines routes like `/admission`, `/fee`, etc.

**Important:** In development, when you click "Admission" in the Shell's sidebar, it will navigate to `/admission` **within the Shell app itself**. The Admission module code is NOT running yet - we'll build placeholder pages first.

---

## Production Deployment (Docker + Nginx)

### Architecture Diagram

```
                    ┌─────────────────────────────────┐
                    │   User Browser                  │
                    │   https://erp.yourcompany.com   │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │   Nginx Reverse Proxy           │
                    │   (Docker Container)            │
                    └──────────────┬──────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────▼────────┐      ┌──────────▼─────────┐    ┌──────────▼─────────┐
│  Shell         │      │  Admission CRM     │    │  Fee Module        │
│  Container     │      │  Container         │    │  Container         │
│  Port: 3000    │      │  Port: 3001        │    │  Port: 3002        │
└────────────────┘      └────────────────────┘    └────────────────────┘
```

### Nginx Configuration

Nginx acts as a **reverse proxy** that routes requests to the correct container:

```nginx
# /etc/nginx/nginx.conf

server {
    listen 80;
    server_name erp.yourcompany.com;

    # Shell - Default route
    location / {
        proxy_pass http://shell:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Admission CRM Module
    location /admission {
        proxy_pass http://admission-crm:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Fee Module
    location /fee {
        proxy_pass http://fee-module:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # HRM Module
    location /hrm {
        proxy_pass http://hrm:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker Compose Example

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - shell
      - admission-crm
      - fee-module

  shell:
    build: ./apps/shell
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production

  admission-crm:
    build: ./apps/admission-crm
    ports:
      - "3001:80"
    environment:
      - NODE_ENV=production

  fee-module:
    build: ./apps/fee-module
    ports:
      - "3002:80"
    environment:
      - NODE_ENV=production
```

---

## How Routing Works

### Scenario 1: User Visits the Homepage

1. **User types:** `https://erp.yourcompany.com`
2. **Nginx routes to:** Shell container (port 3000)
3. **Shell renders:** Dashboard with sidebar navigation
4. **User sees:** Main dashboard with module cards

### Scenario 2: User Clicks "Admission CRM"

**Option A: Client-Side Navigation (Current Plan)**
1. **User clicks:** "Admission CRM" in sidebar
2. **React Router navigates to:** `/admission` (client-side, no page reload)
3. **Shell renders:** Admission module component
4. **Result:** Fast, SPA-like experience

**Option B: Server-Side Navigation (Alternative)**
1. **User clicks:** Link to `/admission`
2. **Browser requests:** `https://erp.yourcompany.com/admission`
3. **Nginx routes to:** Admission container (port 3001)
4. **Admission app loads:** With its own copy of Sidebar/Header from `@od-erp/ui`
5. **Result:** Full page reload, but truly independent deployment

---

## Shared Code Strategy

### The `@od-erp/ui` Package

All modules import the **same UI components** from the shared package:

```tsx
// apps/shell/src/App.tsx
import { Sidebar, Header } from '@od-erp/ui';

// apps/admission-crm/src/App.tsx
import { Sidebar, Header } from '@od-erp/ui';
```

**In Development:**
- `pnpm` symlinks the package, so changes to `@od-erp/ui` instantly reflect in all apps

**In Production:**
- Each Docker container bundles its own copy of `@od-erp/ui`
- If you update the UI package, you rebuild and redeploy all affected containers

---

## Deployment Workflow

### Step 1: Build Each App

```bash
# Build Shell
cd apps/shell
pnpm build
# Output: dist/

# Build Admission
cd apps/admission-crm
pnpm build
# Output: dist/
```

### Step 2: Create Dockerfiles

```dockerfile
# apps/shell/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 3: Deploy with Docker Compose

```bash
docker-compose up -d
```

---

## Scaling Strategy

### Independent Scaling

Each module can be scaled independently:

```yaml
# Scale only the Fee module (high traffic during payment season)
docker-compose up -d --scale fee-module=3
```

### Independent Updates

Deploy updates to one module without touching others:

```bash
# Only rebuild and redeploy Admission
docker-compose up -d --build admission-crm
```

---

## Session & Authentication

### Shared Authentication

All modules share the same authentication:

1. **User logs in** via Shell
2. **JWT token stored** in cookies (domain: `.yourcompany.com`)
3. **All modules** read the same cookie
4. **Redux state** in each app hydrates from the token

### Cross-Module Communication

Modules communicate via:
1. **Shared Redux Store** (if using Module Federation)
2. **URL Parameters** (e.g., `/admission?studentId=123`)
3. **LocalStorage/SessionStorage** (for simple data)
4. **Backend API** (source of truth)

---

## Summary

| Aspect | Development | Production |
|--------|-------------|------------|
| **Routing** | React Router (client-side) | Nginx Reverse Proxy |
| **Ports** | 3000, 3001, 3002... | All via port 80 |
| **Shared Code** | Symlinked via pnpm | Bundled in each container |
| **Deployment** | `pnpm dev` | Docker Compose |
| **Scaling** | N/A | Independent per module |

---

## Next Steps

1. **Phase 1 (Now):** Build Shell with routing and shared UI
2. **Phase 2:** Build Admission CRM as a standalone app
3. **Phase 3:** Set up Nginx reverse proxy
4. **Phase 4:** Create Dockerfiles for each app
5. **Phase 5:** Deploy to production with Docker Compose
