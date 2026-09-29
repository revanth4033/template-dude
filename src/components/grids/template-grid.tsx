import { TemplateCard } from "@/components/cards/template-card";
import type { Template } from "@/lib/types";

/** Responsive grid of stills. Column counts follow PRD §36. */
export function TemplateGrid({ templates }: { templates: Template[] }) {
  return (
    <div className="gutter grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          sizes="(max-width: 768px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 23vw, 18vw"
        />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="gutter py-20 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
