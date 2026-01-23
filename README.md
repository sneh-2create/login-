# LoginScreen — README



---

## Project Overview

This repository contains a small React UI for a login/OTP screen built with Vite and Tailwind CSS. It is a standalone frontend module (not a pnpm monorepo).



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
- Added `.gitignore` and removed duplicate config files.

I ran `npm run build` successfully and verified `dist/` was produced.

---



