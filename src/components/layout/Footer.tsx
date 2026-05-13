import * as React from "react";
import { Logo } from "@/components/brand/Logo";

const SECTIONS = [
  {
    label: "PLATFORM",
    links: [
      { label: "Net Worth Engine", href: "#command" },
      { label: "What-If Scenarios", href: "#whatif" },
      { label: "AI Insights", href: "#ai" },
      { label: "Mobile", href: "#mobile" },
    ],
  },
  {
    label: "COMPANY",
    links: [
      { label: "About", href: "#" },
      { label: "Method", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    label: "RESOURCES",
    links: [
      { label: "Research", href: "#" },
      { label: "Help center", href: "#" },
      { label: "Status", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    label: "LEGAL",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Disclosures", href: "#" },
      { label: "Security", href: "#trust" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-bg-deeper text-ink-ondark overflow-hidden">
      <div aria-hidden className="absolute inset-0 grid-fine-ondark opacity-20 mask-fade-y pointer-events-none" />
      <div className="container mx-auto py-20 relative">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2 max-w-sm">
            <Logo withWordmark size={24} tone="dark" />
            <p className="mt-5 text-body-sm text-ink-ondarkSecondary leading-relaxed">
              The wealth operating system for Australian households —
              forecasting, scenarios, and decision intelligence in one calm interface.
            </p>
            <p className="mt-6 text-caption text-ink-ondarkTertiary mono uppercase tracking-wider">
              Brisbane · AU · v1.0 preview
            </p>
            <div className="mt-5 inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ember-500 animate-pulse-soft" />
              <span className="text-[0.65rem] mono uppercase tracking-wider text-ink-ondarkSecondary">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>
          {SECTIONS.map((s) => (
            <div key={s.label}>
              <h4 className="text-[0.65rem] mono uppercase tracking-wider text-ink-ondarkTertiary mb-4">
                [{s.label}]
              </h4>
              <ul className="flex flex-col gap-2.5">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-body-sm text-ink-ondarkSecondary hover:text-ember-500 transition-colors duration-200"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 hairline-ondark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-caption text-ink-ondarkTertiary mono">
            © {new Date().getFullYear()} FAMILY WEALTH LAB · ALL RIGHTS RESERVED
          </p>
          <p className="text-caption text-ink-ondarkTertiary mono">
            MODELLING ONLY · NOT PERSONAL FINANCIAL ADVICE
          </p>
        </div>
      </div>
    </footer>
  );
}
