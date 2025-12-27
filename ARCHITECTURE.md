# OD ERP Architecture Strategy: Micro-Frontends & Monorepo

## Executive Summary
We have transitioned OD ERP from a monolithic Angular application to a **Micro-Frontend Architecture** using **React** (with legacy support for Angular templates). This document details *why* we separate applications and *how* we manage them.

## 1. Why Separate Applications? (The "Micro" Approach)

Instead of building one massive application, we split functionality into distinct, self-contained applications (Admission, Fee, HRM, etc.).

### Key Benefits

#### A. Fault Isolation (Stability)
*   **Problem:** In a monolith, a critical bug in the "Fee Module" could potentially crash the entire ERP, blocking reliable access to "Admission" or "HRM".
*   **Solution:** By separating apps, if the `fee-module` crashes or throws an error, the `shell` and other modules like `admission-crm` remain fully functional.

#### B. Performance & Loading Times
*   **Problem:** Monoliths require users to download code for *every* feature (HRM, Exams, Finance) just to log in, resulting in slow initial load times (large bundle sizes).
*   **Solution:** We only load the code for the module the user is currently visiting. A user handling Admissions never downloads the heavy code for the Exam Controller.

#### C. Independent Development & Deployment
*   **Problem:** In a monolith, updating a small text label in "Student Profile" requires rebuilding and redeploying the entire ERP system.
*   **Solution:** Each application can be developed, tested, built, and deployed independently.
    *   Team A works on **Admission**
    *   Team B works on **Fees**
    *   They do not block each other.

#### D. Technology Agnostic (Hybrid Support)
*   **Context:** We still have valuable legacy Angular code (`document-template-angular`).
*   **Benefit:** Micro-frontends allow us to run React newer modules alongside the legacy Angular module seamlessly under the same "Shell".

## 2. Why a Monorepo? (The "Unified" Management)

If we separate the apps, why keep them in one git repository (Monorepo)?

### A. Shared Dependencies (DRY - Don't Repeat Yourself)
We have common packages in `packages/`:
*   `@od-erp/ui`: Shared buttons, inputs, and layouts.
*   `@od-erp/auth`: Shared login logic and state.
*   `@od-erp/api-client`: Shared API definitions.

If we had separate repositories, updating a Button component would require publishing a new version to npm, and then updating every single app individually. In a monorepo, **one change updates everything**.

### B. Standardized Developer Experience
*   One command to install everything: `pnpm install`
*   One command to lint everything: `pnpm lint`
*   One command to run everything: `pnpm dev`

### C. Atomic Commits
You can make a backend API change, update the shared type definition, and update the frontend consumer in a **single commit**. This prevents version mismatches between libraries and apps.

## 3. Architecture Overview

### The Shell (`apps/shell`)
*   **Role:** The Container / Orchestrator.
*   **Responsibility:** Handles the main navigation (sidebar/header), global authentication, and decides which Micro-Frontend to display.
*   **Tech:** React + Vite.

### Domain Modules
These are the separate applications loaded by the Shell:
*   `apps/admission-crm`: Lead management and student onboarding.
*   `apps/fee-module`: Payment processing and invoicing.
*   `apps/academic-module`: Class scheduling and curriculum.
*   `apps/exam-coe`: Examination controller and result processing.
*   `apps/hrm`: Staff and payroll management.
*   `apps/back-office`: Admin configurations.

### Shared Packages (`packages/*`)
The glue that binds them together:
*   `ui`: Design system.
*   `store`: Global state (Redux/Zustand) if needed.
*   `utils`: Helper functions (date formatting, validation).
