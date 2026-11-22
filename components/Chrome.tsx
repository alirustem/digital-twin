import { profile } from "@/lib/content";

const nav = [
  ["About", "#about"],
  ["Journey", "#journey"],
  ["Craft", "#expertise"],
  ["Ambition", "#ambition"],
  ["Work", "#work"],
  ["Certificates", "#credentials"],
  ["Ping", "#contact"],
];

function Links({ className }: { className: string }) {
  return (
    <ul className={className}>
      {nav.map(([label, href]) => (
        <li key={href}>
          <a href={href} className="hover:text-phosphor">
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-paper/15 bg-chassis/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <a href="#top" className="font-mono text-sm text-phosphor">
          ali@kanata-lab
          <span className="text-dim">:~$</span>
        </a>
        <div className="hidden items-center gap-4 md:flex" aria-hidden>
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-dim">
            <span className="led" />PWR
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-dim">
            <span className="led amber" />LINK
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-dim">
            <span className="led shirt" />LLM
          </span>
        </div>
        <nav className="hidden md:block" aria-label="Sections">
          <Links className="flex gap-4 font-mono text-xs tracking-wide text-paper/80" />
        </nav>
        <details className="md:hidden">
          <summary className="cursor-pointer list-none font-mono text-xs text-phosphor">
            MENU
          </summary>
          <nav aria-label="Sections" className="absolute right-4 mt-3 border border-paper/20 bg-panel p-4">
            <Links className="space-y-2 font-mono text-sm text-paper" />
          </nav>
        </details>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-paper/15 px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs text-amber">ASN 65000 · PRIVATE LAB</p>
          <pre className="mt-3 font-mono text-sm leading-6 text-dim">{`traceroute ambition
 1  aleppo
 2  amman
 3  istanbul
 4  ottawa     * * *
 5  still forwarding`}</pre>
          <p className="mt-4 max-w-sm font-mono text-xs leading-relaxed text-dim">
            Built with curiosity, caffeine, and an unreasonable attachment to MPLS.
          </p>
        </div>
        <p className="max-w-xs font-mono text-sm text-paper">
          This page is up. Your next hop might not be.
          <span className="mt-2 block text-dim">{profile.name} · Ottawa</span>
        </p>
      </div>
    </footer>
  );
}

export function Section({
  id,
  index,
  title,
  aside,
  mark,
  children,
}: {
  id: string;
  index: string;
  title: string;
  aside: string;
  mark?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-paper/10 px-5 py-12 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            {mark}
            <div>
              <p className="font-mono text-xs tracking-[0.22em] text-amber">{index}</p>
              <h2 className="font-display text-balance text-4xl leading-[1.05] text-paper md:text-5xl">{title}</h2>
            </div>
          </div>
          <p className="max-w-sm font-mono text-sm text-dim">{aside}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function Out({
  href,
  children,
  className = "lab-link",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const file = href.startsWith("/");
  const mail = href.startsWith("mailto:");
  return (
    <a
      href={href}
      className={className}
      {...(file || mail ? {} : { target: "_blank", rel: "noreferrer" })}
    >
      {children}
    </a>
  );
}
