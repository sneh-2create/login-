# OD ERP Dependency Management Strategy

This document outlines the standards for managing dependencies within our Monorepo. It explains **where** to install packages and **why** we follow this specific approach using pnpm.

## 1. The Golden Rule: "Install Where Used"
We follow the principle of **Explicit Dependencies**.
*   If `apps/shell` imports `react`, then `apps/shell/package.json` **MUST** list `react`.
*   If `apps/admission-crm` imports `lodash`, then `apps/admission-crm/package.json` **MUST** list `lodash`.

**Do NOT rely on the Root `package.json` for runtime libraries.**

---

## 2. Where should I install my package?

### A. Root (`/package.json`)
**Purpose:** Development Tools & Orchestration.
**What goes here:** Tools that run across the entire repository or help manage the repo itself.
*   ✅ `typescript` (Global compiler)
*   ✅ `eslint`, `prettier` (Global linting)
*   ✅ `husky`, `lint-staged` (Git hooks)
*   ✅ `turbo` (Task runner)
*   ❌ `react`, `axios`, `express` (Runtime code)

### B. Applications (`apps/*/package.json`)
**Purpose:** Runtime dependencies for the specific application.
**What goes here:** Any library the application code directly imports.
*   ✅ `react`, `react-dom`
*   ✅ `@tanstack/react-query`
*   ✅ `@od-erp/ui` (Our shared package)
*   ✅ `zod`

### C. Shared UI/Logic Packages (`packages/*/package.json`)
**Purpose:** Reusable code libraries.
**Strategy:** Use **`peerDependencies`** for framework libraries.

**Example (`packages/ui`):**
If our UI library provides React components, it should **NOT** bundle its own copy of React. It should "ask" the host app for React.

```json
{
  "name": "@od-erp/ui",
  "peerDependencies": {
    "react": ">=18.0.0" 
  },
  "devDependencies": {
    "react": "^18.2.0" // Only for running tests inside this folder
  }
}
```
*   **Why?** This ensures that when `apps/shell` uses `@od-erp/ui`, valid only **one** instance of React is loaded in the browser.

---

## 3. Why NOT install React in the Root?

You might ask: *"Since all apps use React 18, why not just install it once in the root?"*

### Reason 1: Avoiding "Phantom Dependencies"
If we install `library-x` in the root, Node.js resolution allows any app to access it even if it's not in the app's `package.json`.
*   **The Risk:** If we later extract `apps/fee-module` to a separate repo or Docker container, it will crash instantly because it forgot to list `library-x` as a dependency.
*   **Our Fix:** By forcing every app to declare what it uses, our apps are **portable** and **robust**.

### Reason 2: Decoupled Upgrades (Micro-Frontends Superpower)
Installing in the root forces **lock-step upgrades**.
*   **Scenario:** React 19 is released with breaking changes.
*   **Root Install:** You cannot upgrade *any* app until you fix *every* app. The entire business waits.
*   **App Install:** You can upgrade `admission-crm` to React 19 today. You can leave `fee-module` on React 18 for another 3 months. **Development never stops.**

### Reason 3: Disk Space Efficiency (pnpm)
Using `pnpm` removes the downside of multiple `package.json` files.
*   Even if 10 apps list `"react": "^18.2.0"`, `pnpm` downloads the file **only once** to a global store on your machine.
*   It then creates "hard links" or "symlinks" in the node_modules folders.
*   **Result:** You get the safety of separate manifests with the storage efficiency of a single install.

---

## 4. Summary Checklist

| Action | Where to Run Command | Command |
| :--- | :--- | :--- |
| Adding a UI library for one app | `apps/admission-crm` | `pnpm add mui` |
| Adding a global linter plugin | `root` | `pnpm add -D -w eslint-plugin-custom` |
| Adding a shared utility | `packages/utils` | `pnpm add date-fns` |
| Using a shared package in an app | `apps/shell` | `pnpm add @od-erp/utils` |
