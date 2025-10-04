# Modern Web App Template

This repository provides a UI-only starter for building modern customer-facing experiences that plug directly into Microsoft Power Apps. It ships with the Power Platform SDK already wired up through `PowerProvider.tsx`, so you can focus on composing React interfaces before connecting to a backend or data source.

## Tech Stack

- Vite for fast bundling and local development
- React with TypeScript for type-safe, component-driven UI work
- Tailwind-based design tokens and reusable components
- Power Apps SDK integration via `PowerProvider.tsx`

## Project Layout

```
src/
├── App.tsx             # Application shell
├── app/                # Route-level pages and entry layouts
├── assets/             # UI imagery, icons, and design tokens
├── components/         # Shared UI building blocks (`components/ui` for primitives)
├── features/           # Domain modules (accounts, contacts, dashboard, reports)
├── hooks/              # Cross-cutting client hooks
├── lib/                # Utilities and helpers
├── main.tsx            # Vite entry point
└── PowerProvider.tsx   # Power Platform context bridge
```

Static assets meant for the build pipeline live in `src/assets/`, while public files served unchanged reside in `public/`. Production bundles are emitted to `dist/` when you run the build.

## Getting Started

```bash
# clone the template
git clone <repo-url>
cd paca-modern-web-app-sample

# install dependencies
npm install

# start the Vite + Power Apps development workflow
npm run dev

# build the production bundle
npm run build
```

Use `npm run dev:vite` or `npm run dev:pac` if you prefer to run each process independently. Before pushing changes, verify `npm run lint` and `npm run build` both succeed.

## Deploying to Power Apps

After enabling the Power Apps Code Apps preview features for your environment (Power Platform admin center → Settings → Product → Features → toggle on the Power Apps Code Apps preview), you can use the PAC CLI (`pac auth create`, `pac code push`) to publish this UI to your tenant. Always follow the [official Microsoft documentation](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/) for the latest prerequisites, command syntax, and environment requirements.

> **Tip:** If `pac code push` fails, verify that you are running the latest Power Platform CLI (`pac --version`) and that the `environmentId` in `power.config.json` matches the environment where the preview is enabled.

## Next Steps

- Customize feature modules under `src/features/` to match your domain.
- Integrate data sources by wiring calls into the Power Platform context exposed through `PowerProvider.tsx`.
- Add automated tests (Vitest + React Testing Library) alongside features as your app grows.

## Preview Disclaimer

The Power Apps Code Apps experience (and associated SDK tooling) is currently in preview. Capabilities, commands, and environment switches may change, so monitor Microsoft announcements and release notes to stay aligned with the latest updates.
