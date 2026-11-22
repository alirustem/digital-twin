import { Footer, Header, Out, Section } from "@/components/Chrome";
import {
  ambition,
  books,
  certificateRoute,
  education,
  fiveG,
  hops,
  ipCatalog,
  languages,
  nokiaLogo,
  paper,
  profile,
  profiles,
  researchNotes,
  skills,
  sra,
  sraGates,
  type ExamLink,
} from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <a href="#about" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:bg-phosphor focus:px-3 focus:py-2 focus:text-chassis">
        Skip to content
      </a>
      <Header />
      <main id="top">
        <Hero />
        <About />
        <Journey />
        <Expertise />
        <Ambition />
        <Work />
        <Credentials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="font-mono text-sm text-phosphor">
            ali@kanata-lab:~$ whoami
            <span className="cursor" />
          </p>
          <p className="mt-6 font-mono text-xs tracking-[0.18em] text-amber">
            {profile.role} · NOKIA OTTAWA
          </p>
          <h1 className="font-display mt-2 text-6xl leading-[0.9] text-paper md:text-8xl">
            Ali Rustem
          </h1>
          <div className="mt-3 h-1.5 w-40 bg-shirt" />
          <p className="mt-6 max-w-xl text-2xl leading-snug text-paper">
            I make packets behave, then teach software to notice when they don&apos;t.
          </p>
          <p className="mt-4 max-w-xl text-lg text-dim">
            {profile.headline}. Service-provider routing, the ugly troubleshooting,
            Python automation, and applied LLMs for infrastructure.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#journey" className="bg-phosphor px-4 py-2 font-mono text-sm text-chassis">
              Trace the career
            </a>
            <a href="#ambition" className="border border-amber px-4 py-2 font-mono text-sm text-amber">
              Where this is going
            </a>
          </div>
          <div className="ping mt-8 max-w-lg border border-paper/15 bg-black/50 p-4 font-mono text-sm leading-6">
            <p className="text-phosphor">$ ping ambition</p>
            <p className="text-paper">64 bytes from ottawa: ttl=64 time=8.8 ms</p>
            <p className="text-amber">HOP DOWN is a hobby, not a lifestyle.</p>
            <p className="text-dim">0% packet loss. 100% opinions.</p>
          </div>
        </div>
        <figure className="bezel mx-auto w-full max-w-md">
          <span className="screw tl" aria-hidden />
          <span className="screw tr" aria-hidden />
          <span className="screw bl" aria-hidden />
          <span className="screw br" aria-hidden />
          <img
            src={profile.portrait}
            alt="Cartoon of Ali Rustem in a network lab, cap backwards, Ethernet cable in hand, I love MPLS mug on the bench."
          />
          <span className="scanlines" aria-hidden />
          <figcaption className="asset-tag">ASSET ALI-01 · DO NOT POWER CYCLE</figcaption>
          <span className="sticker mug" aria-hidden>
            I <span className="text-shirt">♥</span> MPLS
          </span>
          <span className="sticker err" aria-hidden>
            404
          </span>
        </figure>
      </div>
    </section>
  );
}

function About() {
  return (
    <Section id="about" index="01  /  ABOUT" title="The engineer in the lab." aside="Yes, the mug says I love MPLS. No follow-up questions.">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4 text-lg leading-relaxed text-paper/95">
          <p>
            I am a senior IP/MPLS engineer. The day job is high-level routing
            architecture and the troubleshooting that shows up when a service-provider
            network is large enough to have opinions.
          </p>
          <p>
            In parallel I design network automation in Python, because doing the same
            CLI dance by hand is how outages get a head start. I am also building
            applied LLM tools for infrastructure: troubleshooting workflows, analysis,
            and network intelligence.
          </p>
          <p>
            Engineer, problem-solver, builder. Nokia is where that craft got deep.
            The work now is routing, automation, and AI that has to survive contact
            with a real network.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <aside className="border border-paper/15 bg-panel p-5">
            <p className="font-mono text-xs text-amber">IDENTITY FILE</p>
            <ul className="mt-4 space-y-3 font-mono text-sm text-paper">
              <li><span className="text-dim">loc</span> &nbsp; Ottawa, Canada</li>
              <li><span className="text-dim">org</span> &nbsp; <Out href="https://nokia.com/">Nokia</Out></li>
              <li><span className="text-dim">base</span> &nbsp; IP/MPLS, SR, VPN, EVPN</li>
              <li><span className="text-dim">side</span> &nbsp; Python, RAG, agents</li>
            </ul>
          </aside>
          <ul className="flex flex-wrap gap-2" aria-hidden>
            <li className="-rotate-2 border-2 border-chassis bg-paper px-2 py-1 font-mono text-xs font-bold text-chassis shadow-[3px_3px_0_#000]">
              I <span className="text-shirt">♥</span> MPLS
            </li>
            <li className="rotate-2 bg-shirt px-2 py-1 font-mono text-xs font-bold text-paper shadow-[3px_3px_0_#000]">
              404
            </li>
            <li className="-rotate-1 bg-amber px-2 py-1 font-mono text-xs font-bold text-chassis shadow-[3px_3px_0_#000]">
              HOP DOWN
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

function Journey() {
  return (
    <Section id="journey" index="02  /  JOURNEY" title="Traceroute, with better snacks." aside="Aleppo to Amman to Istanbul to Ottawa. Packets have taken worse paths.">
      <ol className="relative ml-3 border-l-2 border-cable/80">
        {hops.map((hop) => (
          <li key={hop.n} className="relative mb-8 ml-10 last:mb-0">
            <span className="absolute -left-12 top-6 flex h-7 w-9 items-center justify-center bg-chassis font-mono text-[10px] text-phosphor ring-2 ring-cable">
              {hop.n}
            </span>
            <article className="border border-paper/12 bg-panel/90 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-xs text-amber">{hop.when}</p>
                <p className="font-mono text-xs text-dim">{hop.place}</p>
              </div>
              <h3 className="font-display mt-2 text-2xl">{hop.role}</h3>
              <p className="mt-1 text-lg">
                {hop.href ? <Out href={hop.href}>{hop.org}</Out> : hop.org}
              </p>
              <ul className="mt-3 space-y-2 text-paper/90">
                {hop.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {hop.note ? <p className="mt-3 font-mono text-sm text-cable">{hop.note}</p> : null}
            </article>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Expertise() {
  return (
    <Section id="expertise" index="03  /  CRAFT" title="What the bench is covered in." aside="The book stack is not a metaphor. It is a pile.">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <ul className="space-y-3">
          {books.map((book) => (
            <li key={book.title} className={`spine ${book.tone}`}>
              <span className="font-display text-2xl">{book.title}</span>
              <span className="font-mono text-[10px] tracking-widest text-dim">{book.tag}</span>
            </li>
          ))}
        </ul>
        <div>
          <ul className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <li
                key={skill}
                className={`border border-paper/20 border-l-4 bg-panel px-3 py-1.5 font-mono text-sm text-paper ${
                  ["border-l-phosphor", "border-l-amber", "border-l-cable", "border-l-shirt"][index % 4]
                }`}
              >
                {skill}
              </li>
            ))}
          </ul>
          <div className="mt-6 border border-paper/15 bg-black/40 p-4 font-mono text-sm">
            <p className="text-dim">$ locale</p>
            {languages.map((language) => (
              <p key={language.code} className="mt-1">
                <span className="text-phosphor">{language.code}</span>
                <span className="text-paper"> {language.name}</span>
                <span className="text-dim"> — {language.level}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Ambition() {
  return (
    <Section id="ambition" index="04  /  AMBITION" title="Networking in. AI on top. Leadership ahead." aside="Networking got me here. AI is how the repetitive parts get automated.">
      <p className="max-w-3xl text-xl leading-snug">
        Networking is the foundation. AI is the force multiplier. The point is to
        engineer with the tools, not to rent a personality from a chatbot.
      </p>
      <p className="mt-4 max-w-3xl text-paper/85">
        The direction is a technical leader at the intersection of networking,
        AI and automation, product delivery, and business judgment.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {ambition.map((item) => (
          <article key={item.k} className="border border-paper/15 bg-panel p-5">
            <p className="font-mono text-xs text-phosphor">{item.k}</p>
            <h3 className="font-display mt-2 text-2xl">{item.title}</h3>
            <p className="mt-3 text-paper/90">{item.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Work() {
  return (
    <Section id="work" index="05  /  WORK" title="Proof, not a mood board." aside="If it has a URL on the resume, it has a URL here.">
      <article className="border border-amber/50 bg-panel p-6">
        <p className="font-mono text-xs text-amber">RESEARCH · {paper.when}</p>
        <h3 className="font-display mt-2 text-3xl leading-tight">
          <Out href={paper.href}>{paper.title}</Out>
        </h3>
        <p className="mt-3">
          <Out href={paper.href}>{paper.venue}</Out>
        </p>
        <p className="mt-2 font-mono text-sm text-dim">
          ISBN <Out href={paper.href}>{paper.isbn}</Out>
        </p>
      </article>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {education.map((item) => (
          <article key={item.title} className="border border-paper/15 bg-panel p-5">
            <p className="font-mono text-xs text-dim">{item.when}</p>
            <h3 className="font-display mt-2 text-xl">{item.title}</h3>
            <p className="mt-2">{item.org}</p>
            <p className="font-mono text-sm text-dim">{item.detail}</p>
          </article>
        ))}
      </div>

      <details className="mt-4 border border-paper/15 bg-black/30 p-5">
        <summary className="cursor-pointer font-mono text-sm text-phosphor">
          The rest of the degrees, if you are into that
        </summary>
        <ul className="mt-4 space-y-2 text-paper/90">
          {researchNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-xs text-dim">No public URL on the resume for these. The paper above is the one that shipped.</p>
      </details>

      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {profiles.map((item) => (
          <li key={item.label} className="border border-paper/15 bg-panel p-5">
            <Out href={item.href} className="font-display text-2xl text-phosphor no-underline hover:text-amber">
              {item.label}
            </Out>
            <p className="mt-2 text-dim">{item.note}</p>
          </li>
        ))}
        <li className="border border-paper/15 bg-panel p-5">
          <a href={profile.resume} className="font-display text-2xl text-phosphor no-underline hover:text-amber">
            Resume PDF
          </a>
          <p className="mt-2 text-dim">The full document, phone number included, sarcasm sold separately.</p>
        </li>
      </ul>
    </Section>
  );
}

function ExamChips({ exams }: { exams: ExamLink[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {exams.map((exam) => (
        <li key={exam.name}>
          <Out
            href={exam.href}
            className={`inline-block border bg-chassis px-3 py-1.5 font-mono text-xs text-phosphor no-underline hover:border-amber hover:text-amber ${
              exam.highlight ? "border-phosphor" : "border-paper/20"
            }`}
          >
            {exam.name}
            {exam.note ? <span className="text-dim"> · {exam.note}</span> : null}
          </Out>
        </li>
      ))}
    </ul>
  );
}

function Credentials() {
  return (
    <Section
      id="credentials"
      index="06  /  CERTIFICATES"
      title="Collected the hard way."
      aside="The lab exam does not care about your feelings."
      mark={<img src={nokiaLogo} alt="Nokia" className="h-14 w-14" />}
    >
      <article className="border border-phosphor bg-panel p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-wide text-amber">
              ID {sra.id} · VALID THROUGH {sra.validThrough}
            </p>
            <h3 className="font-display mt-2 text-4xl leading-none md:text-5xl">
              <Out href={sra.href} className="text-paper no-underline hover:text-phosphor">
                {sra.short}
              </Out>
            </h3>
            <p className="mt-2 text-lg text-paper">{sra.name}</p>
            <div className="mt-3 h-1.5 w-24 bg-shirt" />
            <p className="mt-4 max-w-2xl text-paper/90">{sra.line}</p>
            <p className="mt-4 font-mono text-sm">
              <Out href={sra.labHref}>SRA lab</Out>
              <span className="text-amber"> · {sra.labNote}</span>
            </p>
          </div>
          <img src={nokiaLogo} alt="" className="hidden h-16 w-16 shrink-0 sm:block" />
        </div>
      </article>

      <ol className="relative mt-8 ml-3 border-l-2 border-cable/80">
        {certificateRoute.map((rank) => (
          <li key={rank.n} className="relative mb-8 ml-10">
            <span className="absolute -left-12 top-6 flex h-7 w-9 items-center justify-center bg-chassis font-mono text-[10px] text-phosphor ring-2 ring-cable">
              {rank.n}
            </span>
            <article className="border border-paper/12 bg-panel/90 p-5">
              <p className="font-mono text-xs text-amber">
                ID {rank.id}
                {rank.validThrough ? ` · VALID THROUGH ${rank.validThrough}` : ""}
              </p>
              <h3 className="font-display mt-2 text-2xl">
                <Out href={rank.href}>{rank.short}</Out>
              </h3>
              <p className="text-paper/90">{rank.name}</p>
              <ExamChips exams={rank.gates} />
              {rank.lab ? (
                <p className="mt-3 font-mono text-sm text-dim">
                  <Out href={rank.lab.href}>Lab</Out>
                  <span> · {rank.lab.note}</span>
                </p>
              ) : null}
            </article>
          </li>
        ))}
        <li className="relative ml-10">
          <span className="absolute -left-12 top-6 flex h-7 w-9 items-center justify-center bg-chassis font-mono text-[10px] text-phosphor ring-2 ring-cable">
            03
          </span>
          <article className="border border-paper/12 bg-panel/90 p-5">
            <p className="font-mono text-xs text-amber">OPENS THE PLATE ABOVE</p>
            <h3 className="font-display mt-2 text-2xl">Written gates</h3>
            <ExamChips exams={sraGates} />
          </article>
        </li>
      </ol>

      <div className="mt-8 border border-amber/40 bg-black/30 p-5">
        <p className="max-w-2xl text-paper">
          Segment Routing, EVPN, and multicast. The advanced end of the shelf. EVPN is what a modern data center is built on.
        </p>
        <ExamChips exams={ipCatalog} />
      </div>

      <article className="relative mt-6 w-full max-w-md border border-dashed border-paper/25 bg-panel p-5 pr-28 opacity-80">
        <p className="stamp" aria-hidden>
          EXPIRED
        </p>
        <p className="font-mono text-xs text-dim">ID {fiveG.id}</p>
        <h3 className="mt-2 max-w-[14rem] text-lg">
          <Out href={fiveG.href}>{fiveG.name}</Out>
        </h3>
      </article>
    </Section>
  );
}

function Contact() {
  return (
    <Section id="contact" index="07  /  PING" title="The lab picks up." aside="Ottawa. The one with the routers.">
      <div className="grid gap-4 md:grid-cols-3">
        <Out href={`mailto:${profile.email}`} className="border border-phosphor/50 bg-panel p-5 no-underline hover:border-amber">
          <span className="font-mono text-xs text-phosphor">EMAIL</span>
          <span className="mt-2 block break-all text-lg text-paper">{profile.email}</span>
        </Out>
        <Out href={profile.linkedin} className="border border-paper/15 bg-panel p-5 no-underline hover:border-amber">
          <span className="font-mono text-xs text-cable">LINKEDIN</span>
          <span className="mt-2 block text-lg text-paper">alirustem</span>
        </Out>
        <a href={profile.resume} className="border border-paper/15 bg-panel p-5 no-underline hover:border-amber">
          <span className="font-mono text-xs text-amber">RESUME</span>
          <span className="mt-2 block text-lg text-paper">Download the PDF</span>
        </a>
      </div>
      <p className="mt-6 font-mono text-sm text-phosphor">$ ping -c 1 kanata-lab</p>
      <p className="mt-1 font-mono text-sm text-dim">
        64 bytes from {profile.location}. 0% packet loss. The phone number stays in the PDF.
      </p>
    </Section>
  );
}
