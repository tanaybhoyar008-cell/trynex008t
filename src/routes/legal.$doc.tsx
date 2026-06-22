import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";

type Doc = { title: string; updated: string; body: string[] };

const docs: Record<string, Doc> = {
  terms: {
    title: "Terms & Conditions",
    updated: "June 2026",
    body: [
      "Welcome to Trynex. By using the app you agree to these terms.",
      "1. Users must not upload illegal, harmful, or copyrighted content.",
      "2. Trynex may remove content or ban users if rules are broken.",
      "3. Users are fully responsible for the content they post.",
      "4. App features and these terms may change at any time.",
      "5. Spam, abuse, harassment, and fake engagement are not allowed.",
      "6. You must be at least 13 years old to use Trynex.",
      "7. We may suspend accounts that violate these rules without prior notice.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "June 2026",
    body: [
      "Your privacy matters. Here is what we collect and why.",
      "• We collect basic account info such as your name, email, and profile data.",
      "• We collect usage data (views, likes, follows) to improve recommendations.",
      "• We do not sell your personal data to anyone.",
      "• Data is stored on secure servers with industry-standard protection.",
      "• You can request deletion of your account and data at any time from Settings.",
      "• Cookies and local storage are used to keep you signed in and remember preferences.",
    ],
  },
  community: {
    title: "Community Guidelines",
    updated: "June 2026",
    body: [
      "Trynex is for everyone. Help us keep it safe and friendly.",
      "• Be respectful to other users.",
      "• No harassment, bullying, or hate speech.",
      "• No adult, violent, or graphic content.",
      "• No fake accounts or impersonation of other people.",
      "• Keep content appropriate for a general audience.",
      "• Report any content that breaks these rules.",
    ],
  },
  content: {
    title: "Content Policy",
    updated: "June 2026",
    body: [
      "You own the content you upload, but you grant Trynex a license to display it in the app.",
      "• Only upload content you have the rights to share.",
      "• Do not upload content that infringes copyright or trademarks.",
      "• Trynex may remove content that violates this policy.",
      "• Repeat infringement may lead to permanent account removal.",
    ],
  },
  cookies: {
    title: "Cookie Policy",
    updated: "June 2026",
    body: [
      "We use cookies and local storage to make Trynex work.",
      "• Essential: keep you signed in and remember your settings.",
      "• Preferences: dark mode, language, data saver.",
      "• Analytics (basic): help us understand what people enjoy.",
      "You can clear stored data from Settings → Data & Storage → Clear Cache.",
    ],
  },
  about: {
    title: "About Trynex",
    updated: "June 2026",
    body: [
      "Trynex is a short-video app for creators and viewers who love quick, engaging stories.",
      "Built mobile-first, lightweight, and made to feel fast on any connection.",
      "Version 1.0.0",
      "© Trynex. All rights reserved.",
    ],
  },
};

export const Route = createFileRoute("/legal/$doc")({
  loader: ({ params }) => {
    const doc = docs[params.doc];
    if (!doc) throw notFound();
    return doc;
  },
  head: ({ loaderData }) =>
    loaderData
      ? { meta: [{ title: `${loaderData.title} — TRYNEX` }, { name: "description", content: loaderData.body[0] }] }
      : {},
  errorComponent: () => <Fallback title="Something went wrong" />,
  notFoundComponent: () => <Fallback title="Document not found" />,
  component: LegalPage,
});

function LegalPage() {
  const doc = Route.useLoaderData();
  return (
    <MobileFrame>
      <div className="pb-12">
        <header className="flex items-center gap-3 px-5 pt-6">
          <Link to="/settings" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold">{doc.title}</h1>
            <p className="text-[10px] text-muted-foreground">Last updated {doc.updated}</p>
          </div>
        </header>
        <article className="mx-5 mt-5 space-y-3 rounded-2xl bg-surface p-5 text-sm leading-relaxed ring-1 ring-border">
          {doc.body.map((p, i) => (
            <p key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{p}</p>
          ))}
        </article>
      </div>
    </MobileFrame>
  );
}

function Fallback({ title }: { title: string }) {
  return (
    <MobileFrame>
      <div className="p-6">
        <Link to="/settings" className="text-sm text-brand-2">← Back to Settings</Link>
        <p className="mt-6 text-center text-sm text-muted-foreground">{title}</p>
      </div>
    </MobileFrame>
  );
}
