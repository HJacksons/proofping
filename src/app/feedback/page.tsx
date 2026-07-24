import { ProductFeedbackForm } from "@/components/product-feedback-form";
import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "Feedback — ProofPing",
  description: "Tell us what’s broken, confusing, or worth improving.",
};

export default function FeedbackPage() {
  return (
    <SiteShell width="narrow">
      <div className="grid gap-3">
        <p className="text-sm font-medium text-accent-strong">Feedback</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tell us what’s rough
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Bugs, confusing steps, or ideas for Help nearby / asks / alerts.
          This goes to the team — no public thread, no IP stored with your note.
        </p>
      </div>

      <div className="rounded-2xl bg-surface px-4 py-5 ring-1 ring-line sm:px-6">
        <ProductFeedbackForm path="/feedback" variant="page" />
      </div>
    </SiteShell>
  );
}
