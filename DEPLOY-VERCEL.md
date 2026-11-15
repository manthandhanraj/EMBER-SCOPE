# GitHub → Vercel deployment

This is a standard Next.js app. The Python runner is only a local convenience; Vercel builds the web app directly.

## If you push the complete NASA project folder

Import that GitHub repository in Vercel and select:

| Setting | Value |
| --- | --- |
| Root Directory | `emberscope/apps/web` |
| Framework Preset | Next.js |
| Node.js | 24.x (also pinned in package.json) |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Leave the Next.js default |

If you instead push only the emberscope folder, use `apps/web`. If you push only apps/web, use the repository root (`.`). Select the directory that contains package.json and vercel.json; the full-workspace setting above is the expected route.

## Steps

1. Create a GitHub repository and push the project source. The ignore rules exclude installed dependencies, builds, local uploads and secret files. Keep the scientific JSON files, public assets, package-lock.json, LICENSE and THIRD_PARTY_NOTICES.md in the repository.
2. In Vercel, choose Add New → Project, import the repository, and set the Root Directory above.
3. Deploy. The app includes its research/report endpoints; there is no separate Python server to deploy.
4. The app reads Vercel's production/deployment hostname automatically for metadata. For a custom preferred origin, optionally set NEXT_PUBLIC_SITE_URL to the actual production HTTPS origin and redeploy. Keep Vercel system environment variables enabled.
5. Open the resulting production URL and verify the checks below. Hosting is complete only after an actual deployment succeeds; these settings alone are deployment preparation.

## Optional generated AI explanations

The library, map, comparison, evidence retrieval and research-report exports do not require an AI-provider key. For generated explanations, add one provider's server-only API key and model setting in Vercel Environment Variables, then redeploy. Use the names in apps/web/.env.example. Never prefix a secret key with NEXT_PUBLIC_ or commit a real environment file.

Only configure provider-backed public access when you intend visitors to invoke it. The existing in-memory request limiter/cache resets between server instances; it is not a distributed usage quota. A live provider test and any shared budget/rate controls are separate from deployment verification.

## Check the live site

- Home and all four chapters load from the production HTTPS URL.
- Evidence map selection, source/finding tabs, motion controls and mobile list mode work.
- A smoke-detector query ranks SAME appropriately and retains its objectives-only / no-numerical-results label.
- Markdown and JSON report downloads work from /api/research/report.
- Source links open the original documents. /LICENSE.txt and /THIRD_PARTY_NOTICES.txt keep distribution notices accessible on the hosted site.
- No keys are required for a basic research demo. A provider-enabled explanation needs its own live account test.

## Deployment state

No GitHub push or Vercel deployment has been performed by this configuration step. A separate alternative-hosting draft was reserved during the initial hosting check and was not published. Its local record is excluded from Git; the chosen production route is GitHub/Vercel.

Official references: [Vercel monorepos](https://vercel.com/docs/monorepos), [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json), [environment variables](https://vercel.com/docs/environment-variables).
