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
      <div className="mx-auto grid min-w-0 max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0">
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
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-dim">
            Father first. Engineer by profession. Builder by instinct. Senior IP/MPLS
            specialist turning years of network troubleshooting into automation and
            applied AI. Working toward the intersection of technology, products, and
            leadership — preferably without another unnecessary meeting.
          </p>
          <p className="mt-4 font-mono text-xs tracking-wide text-dim">
            Father first. Engineer always. Curious indefinitely.
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
        <figure className="bezel mx-auto w-full min-w-0 max-w-md">
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
    <Section id="about" index="01  /  ABOUT" title="The human behind the terminal." aside="Yes, the mug says I love MPLS. No follow-up questions.">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,40rem)_minmax(17rem,1fr)] lg:gap-x-12">
        <div className="min-w-0 max-w-2xl space-y-5 text-base leading-relaxed text-paper/95 md:text-lg">
          <div className="space-y-3">
            <p>
              Father first. Engineer, problem-solver, and builder by every other
              measure. I believe in doing difficult things well, learning relentlessly,
              and making sure the people who matter most never have to compete with a
              routing table for my attention. Usually.
            </p>
            <p>
              Professionally, I&apos;ve spent years in the wonderfully unforgiving world
              of service-provider networks. IP/MPLS, routing architecture, complex
              troubleshooting, and the occasional network that has apparently decided
              to develop a personality. I&apos;m a Senior TEC Engineer at Nokia, where
              the problems tend to arrive after the easy answers have already been
              exhausted.
            </p>
          </div>
          <div className="space-y-3">
            <p>
              I also build things. Python automation, network tooling, and increasingly,
              AI-powered systems that can analyze, troubleshoot, and make infrastructure
              engineering a little less dependent on heroic amounts of manual effort.
              I&apos;m not particularly interested in AI as a buzzword. I want it to do
              actual work. Preferably without hallucinating a new BGP attribute.
            </p>
            <p>
              I don&apos;t intend to spend my entire career looking at routing tables.
              I also don&apos;t intend to forget what happens when someone types{" "}
              <code className="font-mono text-[0.92em] text-phosphor">commit</code>.
            </p>
          </div>
          <p className="border-l border-paper/20 pl-4">
            I&apos;m a husband and father. That&apos;s the part of my life where the
            stakes are highest, the SLA is non-negotiable, and the smallest stakeholder
            somehow has the most authority.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <aside className="border border-paper/15 bg-panel p-5">
            <p className="font-mono text-xs text-amber">IDENTITY FILE</p>
            <dl className="mt-4 grid grid-cols-[6ch_1fr] gap-x-3 gap-y-1.5 font-mono text-sm leading-snug text-paper [&_dd]:m-0 [&_dt]:m-0 [&_dt]:font-normal">
              <dt className="text-dim">role</dt>
              <dd className="min-w-0">Father. Engineer. Builder.</dd>
              <dt className="text-dim">loc</dt>
              <dd className="min-w-0">Ottawa, Canada</dd>
              <dt className="text-dim">org</dt>
              <dd className="min-w-0"><Out href="https://nokia.com/">Nokia</Out></dd>
              <dt className="text-dim">core</dt>
              <dd className="min-w-0">IP/MPLS, SR, VPN, EVPN</dd>
              <dt className="text-dim">tools</dt>
              <dd className="min-w-0">Python, RAG, AI agents</dd>
              <dt className="text-dim">next</dt>
              <dd className="min-w-0">Product & technology leadership</dd>
              <dt className="text-dim">boss</dt>
              <dd className="min-w-0 text-phosphor">A very opinionated toddler</dd>
            </dl>
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
      <div className="mt-8 max-w-xl border border-paper/15 bg-black/50 p-4 font-mono text-sm leading-6">
        <p className="text-phosphor">$ uptime</p>
        <p className="text-paper">38 years. Multiple countries. Bedtime has a stricter SLA.</p>
        <p>
          <span className="text-dim">Primary process: </span>
          <span className="text-phosphor">dad</span>
        </p>
        <p className="text-dim">Background processes: engineering, AI, ambition</p>
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
    <Section id="ambition" index="04  /  AMBITION" title="Networking in. AI on top. Leadership ahead." aside="Same craft. A wider seat.">
      <div className="max-w-3xl space-y-4 text-lg leading-relaxed">
        <p className="text-xl leading-snug text-paper">
          Networking is my foundation. AI is my force multiplier. Product thinking is the next frontier.
        </p>
        <p className="text-paper/85">
          I&apos;ve spent years learning how complex networks behave, how they fail, and how to make them work again. Now I&apos;m building tools that make that knowledge scalable.
        </p>
        <p className="text-paper/85">
          The longer-term goal is to move beyond solving individual problems and help shape the products, architectures, and strategies that prevent them in the first place.
        </p>
        <p className="border-l-2 border-phosphor py-0.5 pl-4 text-paper">
          I&apos;m not leaving engineering behind. I&apos;m taking it with me into product and technology leadership.
        </p>
        <p className="text-paper/85">
          Because someone in the room should understand both the business case and why the routing adjacency is down.
        </p>
      </div>
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
