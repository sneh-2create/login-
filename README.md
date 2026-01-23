# LoginScreen — README

Short README for reviewers and mentor. Contains how to run, project structure, changes made, and suggested talking points.

---

## Project Overview

This repository contains a small React UI for a login/OTP screen built with Vite and Tailwind CSS. It is a standalone frontend module (not a pnpm monorepo).

Purpose: provide a production-ready login UI with client-side validation and accessible components that can be integrated into a larger app.

---

## Tech stack

- React (JSX)
- Vite (dev + build)
- Tailwind CSS (via PostCSS + Autoprefixer)
- lucide-react (icons)

---

## Run locally

Install dependencies:

```bash
cd /Users/snehagarg/Desktop/LoginScreen
npm install
```

Start dev server:

```bash
npm run dev
# open the printed Local URL (e.g. http://localhost:5177)
```

Build for production:

```bash
npm run build
npm run preview
```

---

## Main files to review

- `package.json` — scripts and dependencies
- `vite.config.ts` — Vite config
- `tailwind.config.js` — Tailwind theme extensions
- `postcss.config.cjs` — PostCSS plugins (Tailwind + Autoprefixer)
- `src/main.jsx` — app bootstrap (imports global CSS)
- `src/styles/tailwind.css` — global Tailwind entry (equivalent to index.css)
- `src/components/Auth/LoginForm.jsx` — Sign-in form and password rules
- `src/components/Auth/OtpForm.jsx` — OTP flow
- `src/components/Common/Input.jsx` — labeled input with error UI
- `src/components/Cards/FeatureCard.jsx` — feature card UI and hover animation
- `src/components/Layout/AuthLayout.jsx` — card wrapper + mode toggle

---

## What I changed in this branch

- Enforced phone input: numeric-only, max 10 digits, paste handling, and inline error message.
- Password rules: minimum 3 characters; sanitized to remove spaces, brackets, `+`, `-`, `=`; shows inline validation message; Sign In disabled until valid.
- Improved feature cards: colored icons and stronger hover lift/scale animation.
- Normalized config filenames to match mentor style: `tailwind.config.js` and `vite.config.ts`.
- Added `.gitignore` and removed duplicate config files.

I ran `npm run build` successfully and verified `dist/` was produced.

---

## How to present this to your mentor (scripted points)

1. Brief summary:

   "This is a focused React + Vite login UI module. It builds with Vite and uses Tailwind for styling. I implemented strict client-side validation for phone and password and improved the UI interactions (hover, error messages)."

2. If they ask about architecture differences:

   "The mentor guidelines describe a pnpm monorepo with multiple apps and shared packages. This repository is a single-app module. If you want, I can convert it into the monorepo layout (move to `apps/shell`, create `packages/*`, add `pnpm-workspace.yaml`) so it matches your workspace structure exactly."

3. Production readiness checklist (what I completed and what remains):

   - Completed: build verified, input sanitization, responsive UI, cleaned configs.
   - Remaining: server-side validation & auth integration, tests (unit + e2e), ESLint/Prettier, CI pipeline, accessibility audit, TypeScript migration (optional but recommended).

4. If asked why `tailwind.css` instead of `index.css`:

   "`src/styles/tailwind.css` is the global CSS entry and plays the same role as `index.css` — it includes Tailwind layers and the project's global utilities. I can rename to `index.css` if you prefer that naming convention."

---

## Recommended next steps (I can implement any of these)

1. Convert to pnpm monorepo layout (if required by mentor).
2. Extract shared utilities/components into a `packages/ui` and `packages/utils` for reuse.
3. Add ESLint + Prettier and apply code formatting.
4. Add unit tests for validation helpers and basic E2E tests for flows.
5. Integrate with a backend auth API and implement server-side validation.
6. Add a CI workflow to run lint/test/build on PRs.

---

## Git / Push guidance

If you need to push these changes to the mentor repo, I recommend:

```bash
git checkout -b feat/validation-ui
git add .
git commit -m "chore: tighten validation and improve UI; normalize configs"
# add mentor remote if needed:
# git remote add mentor <mentor-repo-url>
git push mentor feat/validation-ui
# then open a PR from feat/validation-ui -> mentor/main
```

If you want me to run the commit & push here, give me the mentor repo URL and confirm.

---

If you'd like, I can also produce a compact `DEVELOPER.md` with run/debug steps, or start converting the repo into the `od-erp` monorepo skeleton.
