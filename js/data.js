/**
 * data.js — Portfolio Content
 * ────────────────────────────
 * Edit this file to update all portfolio content.
 * No other files need to be touched for content changes.
 */

const USER_DATA = {

  username: 'believer_99',
  hostname: 'portfolio',

  // ── Bio ──────────────────────────────────────────────────────
  bio: [
    'Jack of all trades, master of none, but better than master of one.',
    '',
    'From operating systems and networks to distributed systems, search, AI,',
    'and cloud infrastructure, I enjoy exploring different layers of',
    'technology and figuring out how they fit together. I’m especially drawn',
    'to problems where multiple areas of computer science intersect.',
    '',
    'I’ve built things ranging from AI-powered applications and search systems',
    'to cryptographic libraries, decentralized communication systems, and',
    'cloud infrastructure. I like learning by building, breaking things,',
    'understanding why they broke, and then trying to build them better.',
    '',
    'I don’t really want to specialize too early. I’d rather understand the',
    'bigger picture, go deep when the problem demands it, and use whatever',
    'technology is actually right for the job.',
    '',
    'Still figuring things out. Still building. Still curious.',
  ],

  // ── Education ────────────────────────────────────────────────
  education: [
    {
      institution: 'Indian Institute of Information Technology Gwalior',
      degree: 'B.Tech + M.Tech (Information Technology)',
      period: 'Nov 2022 – June 2027 (Expected)',
      cgpa: '8.92 / 10',
    },
  ],

  // ── Projects ─────────────────────────────────────────────────
  projects: [
    {
      name: 'Ting – Custom-built Search Engine',
      description: 'Semantic search engine over 8.8M documents with lexical, dense, and hybrid retrieval. 4-stage LTR pipeline using BM25, Sentence Transformers, XGBoost, MMR reranking, and TopRM3 query expansion.',
      link: 'https://github.com/believer-99/Ting',
      tags: ['Python', 'Elasticsearch', 'FAISS', 'ML', 'IR'],
    },
    {
      name: 'Komms – True P2P Chat & File Sharing',
      description: 'Decentralized communication platform with secure file transfer, RSA encryption, peer discovery, resumable transfers, and integrity verification.',
      link: 'https://github.com/believer-99/Komms_P2P',
      tags: ['Python', 'P2P', 'Networking', 'Security'],
    },
    {
      name: 'Pigeon – Simple SMTP Server',
      description: 'Custom SMTP server on AWS integrated with Cloudflare DNS for secure email reception and infrastructure isolation.',
      link: 'https://github.com/believer-99/pigeon',
      tags: ['Python', 'AWS', 'Networking', 'Infrastructure'],
    },
  ],

  // ── Skills ───────────────────────────────────────────────────
  // icon: devicon icon name (null → show a bullet symbol instead)
  skills: {
    languages: [
      { name: 'C', icon: 'c' },
      { name: 'C++', icon: 'cplusplus' },
      { name: 'Python', icon: 'python' },
      { name: 'Java', icon: 'java' },
      { name: 'Dart', icon: 'dart' },
      { name: 'Golang', icon: 'go-plain' },
      { name: 'SQL', icon: 'postgresql' },
    ],
    frameworks: [
      { name: 'FastAPI', icon: 'fastapi' },
      { name: 'Flutter', icon: 'flutter' },
      { name: 'Firebase', icon: 'firebase' },
      { name: 'PyTorch', icon: 'pytorch' },
      { name: 'Scikit-Learn', icon: 'scikitlearn' },
      { name: 'XGBoost', icon: null },
      { name: 'CatBoost', icon: null },
      { name: 'Pandas', icon: null },
      { name: 'NumPy', icon: null },
      { name: 'Matplotlib', icon: null },
    ],
    databases: [
      { name: 'PostgreSQL', icon: 'postgresql' },
      { name: 'MySQL', icon: 'mysql' },
      { name: 'MongoDB', icon: 'mongodb' },
      { name: 'pgvector', icon: null },
    ],
    search_and_ai: [
      { name: 'Elasticsearch', icon: 'elasticsearch' },
      { name: 'FAISS', icon: null },
      { name: 'RAG', icon: null },
      { name: 'Learning-to-Rank', icon: null },
      { name: 'Info. Retrieval', icon: null },
      { name: 'NLP', icon: null },
      { name: 'Machine Learning', icon: null },
    ],
    tools: [
      { name: 'Docker', icon: 'docker' },
      { name: 'Git', icon: 'git' },
      { name: 'GitHub', icon: 'github' },
      { name: 'Linux', icon: 'linux' },
      { name: 'AWS', icon: 'amazonwebservices' },
      { name: 'Cloudflare', icon: null },
      { name: 'REST APIs', icon: null },
    ],
  },

  // ── Contact & Socials ─────────────────────────────────────────
  contact: {
    email: 'ashutoshcshukla05@gmail.com',
    github: 'https://github.com/believer-99',
    linkedin: 'https://linkedin.com/in/ashutosh-shukla-7529ab245/',
    leetcode: 'https://leetcode.com/believer_99',
  },

  // ── Resume ────────────────────────────────────────────────────
  resume: '/resume/Ashutosh_Shukla_Resume.pdf',

  // ── Spotify Playlist (embed URL) ─────────────────────────────
  spotify: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
};
