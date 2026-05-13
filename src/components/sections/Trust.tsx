"use client";
import * as React from "react";
import { Section, SystemLabel } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import {
  Lock,
  ShieldCheck,
  MapPin,
  EyeOff,
  Cpu,
  FileCheck2,
} from "lucide-react";

const PILLARS = [
  {
    idx: "10.1",
    icon: Lock,
    title: "End-to-end encrypted",
    body: "Your household data is encrypted in transit and at rest. We never have access to your raw figures.",
  },
  {
    idx: "10.2",
    icon: ShieldCheck,
    title: "You own your data",
    body: "Exportable, portable, and deletable on demand. No retention, no resale, no third-party telemetry.",
  },
  {
    idx: "10.3",
    icon: MapPin,
    title: "Built for Australia",
    body: "Negative gearing, Div 293, APRA buffer, super preservation — modelled with FY26 rules from day one.",
  },
  {
    idx: "10.4",
    icon: EyeOff,
    title: "No ads, no upsells",
    body: "A subscription product. No data brokering, no affiliate placements, no incentive misalignment.",
  },
  {
    idx: "10.5",
    icon: Cpu,
    title: "On-device intelligence",
    body: "AI runs locally where possible. Your numbers never leave the perimeter to train someone else's model.",
  },
  {
    idx: "10.6",
    icon: FileCheck2,
    title: "Audited methodology",
    body: "Every forecast, every scenario, every assumption is documented and reproducible. No black boxes.",
  },
];

export function Trust() {
  return (
    <Section spacing="lg" id="trust">
      <Reveal className="max-w-3xl">
        <SystemLabel index="10" label="TRUST BY DESIGN" />
        <h2 className="mt-4 text-display text-ink-primary text-balance tracking-tighter">
          Held to a <span className="text-ember-500">higher standard.</span>
        </h2>
        <p className="mt-5 text-lead text-ink-tertiary text-pretty max-w-2xl">
          A platform that handles the most personal numbers in your life should
          be held to a higher standard. Six commitments we make on day one.
        </p>
      </Reveal>

      <Stagger className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3" delay={0.05}>
        {PILLARS.map((p) => (
          <StaggerItem key={p.title}>
            <article className="card-cinematic p-6 h-full hover:border-ember-500/30 transition-colors duration-300 group">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-bg-inset text-ember-500 group-hover:border-ember-500/30 transition-colors">
                  <p.icon className="h-4 w-4" />
                </span>
                <span className="text-[0.6rem] mono uppercase tracking-wider text-ink-quaternary">[{p.idx}]</span>
              </div>
              <h3 className="mt-5 text-h4 text-ink-primary tracking-tight">{p.title}</h3>
              <p className="mt-2.5 text-body-sm text-ink-tertiary leading-snug">{p.body}</p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
