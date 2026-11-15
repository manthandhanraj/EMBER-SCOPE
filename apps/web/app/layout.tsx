import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import {cookies} from "next/headers";
import { ResearchNavigation } from "@/components/research/ResearchNavigation";
import { ResearchProvider } from "@/components/guide/EmberGuide";
import "./globals.css";
import "./explorer-ui.css";
import "./research-theme.css";


const deploymentHost=process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL;
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL||(deploymentHost?`https://${deploymentHost}`:"http://localhost:3000")),
  title: { default: "EmberScope", template: "%s · EmberScope" },
  description:
    "Explore NASA microgravity fire experiments test by test: find the evidence closest to a mission scenario, compare outcomes, and see where the data stops.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Render per request so each page gets a fresh CSP nonce (see proxy.ts).
  await connection();
  const theme=(await cookies()).get("emberscope-theme")?.value==="light"?"light":"dark";
  return (
    <html lang="en" className="antialiased" data-scroll-behavior="smooth" data-theme={theme}>
      <body className="min-h-screen flex flex-col" data-design="clear">
        <ResearchProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-panel px-3 py-2">
          Skip to content
        </a>
        <header className="site-header">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="EmberScope home">
              <Mark />
              <span className="display text-[15px] tracking-tight">EmberScope</span>
            </Link>
            <ResearchNavigation initialTheme={theme}/>
          </div>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="site-footer mt-24">
          <div className="footer-invitation mx-auto max-w-7xl px-4 sm:px-6"><div><p className="display text-2xl">A research question. A source trace.</p><p className="text-muted text-sm mt-2">Compare the evidence before transferring a conclusion.</p></div><Link href="/research" className="story-cta">Open research dashboard</Link></div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 text-sm text-muted grid gap-3 sm:grid-cols-2">
            <p>
              EmberScope includes MIT-licensed MicroFire Atlas code. Original notices are retained. Uses public NASA PSI data and technical reports. Not affiliated with or endorsed by NASA. Scores on this site
              are project heuristics, not NASA ratings or fire-safety certification.
            </p>
            <p className="sm:text-right">
              <Link className="link" href="/methodology">
                How it works
              </Link>
              <span className="mx-3 text-faint">/</span>
              <Link className="link" href="/sources">
                Sources
              </Link>
              <span className="mx-3 text-faint">/</span>
              <a className="link" href="/LICENSE.txt">License</a>
              <span className="mx-3 text-faint">/</span>
              <a className="link" href="/REFERENCES.txt">References</a>
              <span className="mx-3 text-faint">/</span>
              <a className="link" href="/ORIGINAL-CONTRIBUTIONS.txt">Built vs reused</a>
              <span className="mx-3 text-faint">/</span>
              <Link className="link" href="/research?view=report">
                Research brief
              </Link>
            </p>
          </div>
        </footer>
        </ResearchProvider>
      </body>
    </html>
  );
}

/** EmberScope's warm flame mark; the blue core retains the combustion motif. */
function Mark() {
  return (
    <svg width="28" height="34" viewBox="0 0 28 34" aria-hidden="true">
      <path d="M16 1c2 9-9 12-6 20C3 17 8 9 8 9-7 25 6 36 14 32 8 23 26 17 16 1Z" fill="currentColor" />
      <path d="M23 10c7 12 6 20-6 23-6-8 9-12 6-23Z" fill="#e9742d" />
    </svg>
  );
}
