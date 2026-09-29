import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { UploadForm } from "./upload-form";

export const metadata: Metadata = {
  title: "Upload Template",
  robots: { index: false, follow: false },
};

/** Admin upload (PRD §28). */
export default function UploadPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin"
        title="Upload Template"
        subtitle="Add a template with its dialogue, movie, actor and emotion."
      />
      <UploadForm />
    </PageShell>
  );
}
