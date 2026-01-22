# Project Guidelines & Architecture

## 1. Project Structure

This repository is a **Monorepo** managed by `pnpm` workspaces. It follows a Micro-frontend architecture.

```
/od-erp
├── apps/                       # Application Workspaces (Host & Remotes)
│   ├── shell/                  # The HOST application (Main Container)
│   ├── admission-crm/          # Remote Micro-frontend: Admission Module
│   ├── fee-module/             # Remote Micro-frontend: Fee Module
│   ├── academic-module/        # Remote Micro-frontend: Academic Module
│   ├── exam-coe/               # Remote Micro-frontend: Exam & COE Module
│   ├── hrm/                    # Remote Micro-frontend: HR Module
│   ├── back-office/            # Remote Micro-frontend: Back Office Module
│   └── document-template-angular/ # Legacy Angular wrapper (if applicable)
│
├── packages/                   # Shared Libraries (consumed by apps)
│   ├── api-client/             # Centralized Axios setup & Service files
│   ├── store/                  # Redux Toolkit (Slices, Store, Hooks)
│   ├── ui/                     # Reusable UI Components (Button, Input, Layouts)
│   ├── query/                  # TanStack Query (React Query) Hooks
│   ├── types/                  # Shared TypeScript Interfaces/Types
│   ├── utils/                  # Common Helper Functions (Formatting, Validation)
│   ├── constants/              # Shared Constants (Enums, Configs)
│   └── theme/                  # Design tokens, Tailwind config
```

---

## 2. Naming Conventions

### Directories (Folders)
*   **Root & Workspace Packages**: `kebab-case` (e.g., `admission-crm`, `api-client`).
*   **Component Folders**: `PascalCase` (e.g., `components/Header/`).

### Files
*   **React Components**: `PascalCase` (e.g., `Dashboard.tsx`, `AuthGuard.tsx`).
*   **Hooks**: `camelCase` starting with `use` (e.g., `useAuth.ts`).
*   **Services/Utilities**: `camelCase` (e.g., `auth.service.ts`, `formatDate.ts`).
*   **Redux Slices**: `camelCase` (e.g., `authSlice.ts`).
*   **Constants**: `camelCase` (e.g., `appConstants.ts`).

### Code Variables
*   **Variables/Functions**: `camelCase` (e.g., `isLoading`, `handleSubmit`).
*   **React Components**: `PascalCase` (e.g., `const SubmitButton = ...`).
*   **Constants (Global)**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).
*   **Interfaces/Types**: `PascalCase` (e.g., `interface UserProfile`).

---

## 3. Package Usage & Responsibilities

| Package | Purpose | Usage Example |
| :--- | :--- | :--- |
| **apps/shell** | The entry point. Handles routing, authentication, and layout logic. Loads remote apps lazily. | `pnpm --filter shell dev` |
| **apps/[remote]** | Feature-specific business logic. Can run standalone or as a micro-frontend. | `pnpm --filter admission-crm dev` |
| **@od-erp/api-client** | **API Communication**. Contains `axios` instance and service methods. DO NOT make API calls directly in components; use services imported from here. | `import { authService } from '@od-erp/api-client'` |
| **@od-erp/store** | **State Management**. Redux slices for global data (User, Session, Config). | `import { useAppSelector } from '@od-erp/store'` |
| **@od-erp/ui** | **Design System**. Dumb UI components. buttons, inputs, cards, tables. Prevents styling duplication. | `import { Button } from '@od-erp/ui'` |
| **@od-erp/query** | **Server State**. Custom React Query hooks for fetching data. | `const { data } = useGetStudentList()` |
| **@od-erp/types** | **Type Definitions**. Shared interfaces to ensure type safety across apps/packages. | `import { User } from '@od-erp/types'` |

---

## 4. Development Workflow

### Creating a New Feature
1.  **Define Types**: Add shared entities to `@od-erp/types`.
2.  **Service**: Add API methods to `@od-erp/api-client/src/services/[module].service.ts`.
3.  **Query**: Create query hooks in `@od-erp/query/src/hooks/[module]/`.
4.  **UI Components**: Use `@od-erp/ui` for basic blocks. Create complex feature-specific components in `apps/[app]/src/components/`.
5.  **Page**: specific page in `apps/[app]/src/pages/`.

### Deployment
*   **Build**: `pnpm build` (builds all).
*   **Env Variables**:
    *   `VITE_API_URL`: Backend API URL.
    *   `VITE_LOGIN_URL`: URL for the Shell/Login app.
    *   `VITE_ADMISSION_URL`: Production URL for the Admission remote (required for Shell build).

---

## 5. State Management & Storage Strategy

### Redux (@od-erp/store)
*   **Use for**: Global **Client State** only.
*   Examples: User session data, UI themes, Sidebar open/close state, Multi-step form data (before submission).
*   **Do NOT use for**: Caching API responses (use React Query instead).

### React Query (@od-erp/query)
*   **Use for**: Global **Server State**.
*   Examples: Fetching lists of students, loading reports, submitting forms.
*   **Why**: Handles caching, loading states, refetching, and synchronization automatically.

### Cookies (js-cookie)
*   **Use for**: **Authentication Tokens** (Cross-Domain).
*   **Why**: Essential for sharing the session between `login.oderp.in` and `admission.oderp.in`.
*   **Config**: Must use `domain: '.oderp.in'` in production.

### Local Storage
*   **❌ DO NOT USE**.
*   **Reason**: Insecure for sensitive tokens and does NOT share data across subdomains (Micro-frontends). Use Cookies (for auth) or Redux (for session) instead.
