export const profile = {
  name: "Ali Rustem",
  role: "Senior TEC Engineer, IP IXR-SAR",
  headline: "Senior IP/MPLS Engineer",
  location: "Ottawa, Ontario, Canada",
  email: "alooshe.rstm@gmail.com",
  linkedin: "https://www.linkedin.com/in/alirustem/",
  github: "https://github.com/alirustem",
  resume: "/Ali-Rustem-resume.pdf",
  portrait: "/ali-eng-cartoon.png",
};

export const paper = {
  title:
    "Delay-Aware Network Optimization in LTE-Based High-Speed Railway Wireless Networks",
  venue:
    "The Thirteenth International Conference on Wireless and Mobile Communications, pp. 57–61, Nice, France",
  isbn: "978-1-61208-572-2",
  when: "July 2017",
  href: "https://www.researchgate.net/publication/319159202_Delay-Aware_Network_Optimization_in_LTE_Based_High-Speed_Railway_Wireless_Networks",
};

export type Hop = {
  n: string;
  when: string;
  role: string;
  org: string;
  href?: string;
  place: string;
  lines: string[];
  note?: string;
};

export const hops: Hop[] = [
  {
    n: "01",
    when: "Jul 2012 — Sep 2012",
    role: "RF Planning and Optimization Intern",
    org: "Syriatel Mobile Telecom",
    place: "Aleppo, Syria",
    lines: [
      "GSM and WCDMA planning, coverage, frequency work, and interference analysis.",
      "Drive tests with TEMS. Two months. The traceroute starts here.",
    ],
  },
  {
    n: "02",
    when: "Mar 2013 — Jul 2014",
    role: "Telecom Implementation Engineer",
    org: "SMART Co.",
    href: "http://www.ses-jo.com/",
    place: "Amman, Jordan",
    lines: [
      "More than 70 MDS projects for banks, ATMs, enterprises, and government clients on the Umniah network.",
      "Microwave commissioning across NEC, Huawei, Redline, and Eion, plus supervision of 40+ GSM sites.",
    ],
  },
  {
    n: "03",
    when: "Jan 2015 — Jan 2018",
    role: "MSc, Telecommunication Engineering",
    org: "Istanbul Technical University",
    place: "Istanbul, Turkey",
    lines: [
      "Graduate work in telecom, including the delay-aware LTE high-speed railway research that became a conference paper.",
      "GPA 3.0/4.0. Tools of the era: OMNeT++, HFSS, AWR, and MATLAB.",
    ],
    note: "Hops 03 and 04 overlapped. Istanbul ran both. Rude, but efficient.",
  },
  {
    n: "04",
    when: "May 2017 — Apr 2019",
    role: "Senior Pre-Sales Engineer",
    org: "V-Count",
    href: "https://v-count.com/",
    place: "Istanbul, Turkey",
    lines: [
      "Pre-sales and post-sales: technical demos, then staying with the customer once the product was in use.",
      "White papers and product overviews, translating what the product could do into the problem the customer needed solved.",
    ],
  },
  {
    n: "05",
    when: "Apr 2019 — Aug 2023",
    role: "IP/MPLS Technical Consultant",
    org: "Nokia",
    href: "https://nokia.com/",
    place: "Istanbul, Turkey",
    lines: [
      "7950 XRS, 7750 SR, 7210 SAS, 7250 IXR, and 7705 SAR. Mentored Nokia IP TAC on cases that needed deeper routing and protocol analysis.",
      "Technical ambassador for service providers including Orange Morocco and Orange Jordan. Diagnosed outages, performance problems, and faulty configurations with the teams who owned them.",
    ],
  },
  {
    n: "06",
    when: "Aug 2023 — Present",
    role: "Senior TEC Engineer (IP IXR-SAR)",
    org: "Nokia",
    href: "https://nokia.com/",
    place: "Ottawa, Canada",
    lines: [
      "Remote investigation for customers and internal teams: reproduce complex IP/MPLS problems in the lab, then analyze protocol behaviour, configurations, logs, and traces.",
      "Identify software defects and other underlying causes, and collaborate with support and development toward a resolution.",
    ],
  },
];

export const books = [
  { title: "Python", tag: "AUTOMATION", tone: "cable" },
  { title: "Generative AI", tag: "APPLIED", tone: "phosphor" },
  { title: "Automation", tag: "APIs & TOOLING", tone: "amber" },
  { title: "IP/MPLS", tag: "THE MUG WAS RIGHT", tone: "shirt" },
] as const;

export const skills = [
  "OSPF",
  "IS-IS",
  "BGP",
  "RSVP-TE",
  "LDP",
  "Segment Routing",
  "L2/L3 VPN",
  "EVPN",
  "VXLAN",
  "IPsec",
  "QoS",
  "Traffic engineering",
  "BNG",
  "DHCP",
  "RADIUS",
  "IGMP/PIM",
  "Python",
  "Network automation",
  "RAG",
  "Applied LLMs",
];

export const languages = [
  { code: "ar", name: "Arabic", level: "Native / bilingual" },
  { code: "en", name: "English", level: "Full professional" },
  { code: "tr", name: "Turkish", level: "Professional working" },
];

export const ambition = [
  {
    k: "NOW",
    title: "Build on the routing",
    body: "Applied AI on top of IP/MPLS depth. Python, LLMs, and tools that have to run against a real network. This site is one of them.",
  },
  {
    k: "NEXT",
    title: "Same problems, newer fabric",
    body: "Modern data-center networking, SR Linux, and automation that puts routing knowledge and software on the same problem.",
  },
  {
    k: "FURTHER",
    title: "Product line leadership",
    body: "Product line management from the engineering side: customer problems, technical depth, and a say in what gets built. Further management education if it makes those decisions better.",
  },
];

export const education = [
  {
    title: "MSc, Telecommunication Engineering",
    org: "Istanbul Technical University",
    when: "Jan 2015 — Jan 2018",
    detail: "Istanbul, Turkey · 3.0/4.0",
  },
  {
    title: "BSc, Telecommunication Engineering",
    org: "University of Aleppo",
    when: "Sep 2008 — Feb 2013",
    detail: "Aleppo, Syria",
  },
  {
    title: "Scientific Baccalaureate, 95%",
    org: "Aleppo American College",
    when: "July 2007",
    detail: "Aleppo, Syria",
  },
];

export const researchNotes = [
  "VeinsLTE: a heterogeneous vehicular-network simulator study, May 2015.",
  "Miniaturized square-spiral microstrip antenna for WLAN dongle devices, May 2015.",
  "Active noise control in car cabins, Dec 2015.",
  "Utility proportional fairness for resource allocation in 4G-LTE, May 2016.",
  "MSc dissertation: dynamic radio resource management in LTE-based high-speed railway networks, Dec 2016 — Jul 2017. MATLAB.",
  "BSc dissertation: vehicle tracking and positioning with a smart ticketing service, Oct 2011 — Jul 2012. BASCOM-AVR and MATLAB.",
];

export const profiles = [
  { label: "LinkedIn", href: profile.linkedin, note: "The grown-up copy of this page." },
  { label: "GitHub", href: profile.github, note: "Public repos are still booting. The interesting failures live in the lab." },
  { label: "Nokia", href: "https://nokia.com/", note: "Where the craft got deep." },
  { label: "V-Count", href: "https://v-count.com/", note: "Pre-sales era. Demos had to work." },
  { label: "SMART Co.", href: "http://www.ses-jo.com/", note: "The resume link on that chapter." },
];

export type ExamLink = { name: string; href: string; note?: string; highlight?: boolean };

export const nokiaLogo = "/nokia-logo.png";

export const sra = {
  name: "Nokia Service Routing Architect",
  short: "SRA",
  id: "1159",
  validThrough: "Nov 2029",
  line: "Nokia's highest IP/MPLS certification, comparable in technical depth to Cisco CCIE Service Provider. Covers advanced network architecture, design, routing, VPN services, QoS, and troubleshooting when reality disagrees with the design.",
  href: "https://www.credly.com/badges/cf827f7e-3df0-4139-8e8d-d47842e04f5c/public_url",
  labHref: "https://www.credly.com/badges/94a96c3a-9694-4f41-a750-53a75b0c9439/public_url",
  labNote: "9–11 hours. Lunch is a rumor.",
};

export const certificateRoute: {
  n: string;
  name: string;
  short: string;
  id: string;
  validThrough?: string;
  href: string;
  gates: ExamLink[];
  lab?: { name: string; href: string; note: string };
}[] = [
  {
    n: "01",
    name: "Network Routing Specialist I",
    short: "NRS I",
    id: "9980",
    href: "https://www.youracclaim.com/badges/fb5dd3cb-8415-4078-8cc6-af2c4c6f267e/public_url",
    gates: [
      {
        name: "IP Networks and Services Fundamentals",
        href: "https://www.youracclaim.com/badges/88982db2-2ad3-47ca-9be3-97db753d15ab/public_url",
      },
    ],
  },
  {
    n: "02",
    name: "Network Routing Specialist II",
    short: "NRS II",
    id: "1946",
    href: "https://www.youracclaim.com/badges/a3c7f230-bb56-4108-9ecd-507536fe904c/public_url",
    gates: [
      {
        name: "Interior Routing Protocols",
        href: "https://www.youracclaim.com/badges/a4f3f42d-dca0-4756-bc1a-311e78b58629/public_url",
      },
      {
        name: "Multiprotocol Label Switching",
        href: "https://www.youracclaim.com/badges/59e0a899-a01b-4bbb-874a-0cea84ccbf3d/public_url",
      },
      {
        name: "Services Architecture",
        href: "https://www.youracclaim.com/badges/e5fad156-3d2e-4f9e-bccb-3cfed4ec5c20/public_url",
      },
    ],
    lab: {
      name: "NRS II Lab Exam",
      href: "https://www.youracclaim.com/badges/72fed1e6-6245-4635-a95c-8964f7852d01/public_url",
      note: "3–4 hours. Then the title.",
    },
  },
];

export const sraGates: ExamLink[] = [
  {
    name: "Border Gateway Protocol",
    href: "https://www.youracclaim.com/badges/52a6510a-1ffa-429f-8a29-f6c1074de299/public_url",
  },
  {
    name: "Virtual Private LAN Services",
    href: "https://www.youracclaim.com/badges/4a7c8007-438d-4b0b-8302-34db13f5c5df/public_url",
  },
  {
    name: "Virtual Private Routed Networks",
    href: "https://www.credly.com/badges/36c21e3f-2ded-4055-857d-49878aa7d20e/public_url",
  },
  {
    name: "Quality of Service",
    href: "https://www.youracclaim.com/badges/f031fedd-835f-4f59-80c7-d061593ce31c/public_url",
  },
  {
    name: "Network and Service Router Security",
    href: "https://www.credly.com/badges/c3db3cfc-489c-4563-929b-49b79609df4b/public_url",
  },
];

export const ipCatalog: ExamLink[] = [
  {
    name: "Segment Routing",
    href: "https://www.credly.com/badges/83f36bb0-3d1b-438d-b228-eb8f31e7cb64/public_url",
  },
  {
    name: "Ethernet Virtual Private Network Services",
    href: "https://www.credly.com/badges/6a312d78-8d5b-47dc-91a4-9d5fcb36d372/public_url",
    highlight: true,
  },
  {
    name: "Multicast Protocols",
    href: "https://www.credly.com/badges/896aedc5-876d-40b4-9013-636ef53a4830/linked_in_profile",
  },
];

export const fiveG = {
  name: "Bell Labs 5G Certified Associate",
  id: "1924",
  href: "https://learningstore.nokia.com/srv1/openbadge/award/6ac56172009dff707b9821abdff363f4/html",
};
