# InfiniteZero website proposal

A community landing-page proposal for [DevNet issue #278](https://github.com/InfiniteZeroFoundation/DevNet/issues/278).

**[Live preview](https://santiagocetran.github.io/infinitezero-website/)** · **[Project discussion](https://github.com/InfiniteZeroFoundation/DevNet/issues/278)**

This personal repository hosts a working proposal for review. It is not an officially adopted InfiniteZero Foundation website. If the direction is accepted, repository ownership and hosting can be coordinated with the foundation.

## Scope

The first milestone is one landing page: explain the protocol and training flow, route participants/model trainers/app developers/contributors to appropriate guides, clarify live network status, and answer common questions. Public documentation hosting and translated pages are later milestones. The footer links to the existing translated project overview.

Built with Astro and static output, locally hosted Geist, a serif headline, and an original ASCII network background. The network drifts continuously and gently responds to the cursor only over open space. It has a pause control, respects reduced motion, stops rendering in hidden tabs and does not intercept touch scrolling. The tagline reveals again on each return into view.

No analytics, cookies, wallet connection, third-party page resources or runtime network requests. Outbound links take visitors to services with their own policies. Reading, navigation and FAQ expansion work without JavaScript. A static illustration remains if canvas is unavailable.

## Develop

Requires Node **22.23.4 or newer** and npm.

```sh
npm ci
npm run dev
```

Production preview:

```sh
npm run build
npm run check
npm run preview
```

Use the localhost URL printed by Astro. Preview binds only to loopback. In agent environments Astro may start preview in the background; `npm run preview:stop` stops it. Generated output and dependencies are ignored by Git.

## Deployment

Pushes to `main` build, check and deploy through `.github/workflows/pages.yml`. GitHub Pages must use **GitHub Actions** as its source. Actions are pinned to commit hashes; deployment uses GitHub's short-lived identity token rather than a stored deployment secret.

The workflow supplies `SITE_URL=https://santiagocetran.github.io` and `SITE_BASE=/infinitezero-website/`. This produces correct asset paths, canonical metadata and an absolute social preview URL. Update these two settings if ownership, repository name or domain changes.

To reproduce the hosted build locally:

```sh
SITE_URL=https://santiagocetran.github.io SITE_BASE=/infinitezero-website/ npm run build
SITE_BASE=/infinitezero-website/ npm run check
npm run preview
```

Open the preview at `/infinitezero-website/`. Rebuild without those variables to return to root paths. Commands shown use a POSIX shell.

## Content maintenance

Primary source: [the official organization overview](https://github.com/InfiniteZeroFoundation/.github/blob/main/profile/README.md), checked 30 October 2026. The review date describes source verification, not a live network health check.

Preserve these distinctions:

- DevNet 1.0 is live and experimental on Optimism Sepolia; test tokens have no real money value. Expect bugs, changes and resets.
- DevNet 2.0's economic layer is in development. App fee sharing and community governance remain future goals.
- MNIST is the only example tested end to end. Other models require custom services and testing.
- Raw data stays local, but model updates are shared. Local training alone does not guarantee privacy; privacy protections remain active work.
- Live participant setup links point to `main`. Model, app, partner and contributor guides intentionally point to `develop` with visible development labels.

Official links are centralized in `src/data/links.ts`; page copy is in `src/pages/index.astro`; styling is in `src/styles/global.css`. The ASCII renderer is in `src/scripts/network.ts`, with other progressive interactions in `src/scripts/site.ts`.

## Verification

`npm run check` checks fragment targets, unique IDs, local asset paths, branch-correct onboarding links, social image and 404 existence, no remote HTML/CSS resources, client JavaScript below 8 kB and total static output below 750 kB.

Browser review covers desktop/tablet/mobile widths down to 320 px, keyboard navigation and modal focus, hover/focus feedback, repeatable scroll reveals, background motion/pause/reduced motion, no-JavaScript navigation, and accessibility scanning. Automated scanning does not replace manual accessibility review.

## License and acknowledgements

Site code is Apache License 2.0, preserving the license from the DevNet project where this proposal began. InfiniteZero's name and project explanations are attributed to the InfiniteZero Foundation. Geist is distributed under the SIL Open Font License; its notice is in `public/geist-LICENSE.txt`. The headline uses local Times New Roman or a serif fallback; no proprietary font files are distributed.

Visual references include [Linear](https://linear.app/), [Ritual](https://ritual.net/), and [ASCII Sharks](https://github.com/stackedlol/ascii-sharks). [Bitmap Forge](https://github.com/Santiagocetran/BitmapForge) was explored for ASCII/LED rendering. The network renderer is original code; no source code from those references is bundled. The social image is a screenshot of this site's hero.
