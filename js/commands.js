/* ================================================================
   commands.js — All terminal command implementations
   All commands return an object: { html?, lines?, action? }
   ================================================================ */

const Commands = (() => {

  // ── Devicon icon helper ──────────────────────────────────────
  const DEVICON_MAP = {
    amazonwebservices: 'devicon-amazonwebservices-plain-wordmark',
    c:           'devicon-c-plain',
    cplusplus:   'devicon-cplusplus-plain',
    python:      'devicon-python-plain',
    java:        'devicon-java-plain',
    dart:        'devicon-dart-plain',
    postgresql:  'devicon-postgresql-plain',
    fastapi:     'devicon-fastapi-plain',
    flutter:     'devicon-flutter-plain',
    firebase:    'devicon-firebase-plain',
    pytorch:     'devicon-pytorch-plain',
    scikitlearn: 'devicon-scikitlearn-plain',
    mysql:       'devicon-mysql-plain',
    mongodb:     'devicon-mongodb-plain',
    docker:      'devicon-docker-plain',
    git:         'devicon-git-plain',
    github:      'devicon-github-plain',
    linux:       'devicon-linux-plain',
    elasticsearch:'devicon-elasticsearch-plain',
  };

  function iconHtml(iconKey) {
    if (!iconKey || !DEVICON_MAP[iconKey]) {
      return `<span class="tech-bullet">◆</span>`;
    }
    return `<i class="devicon ${DEVICON_MAP[iconKey]} colored" style="font-size:16px"></i>`;
  }

  // ── Utility: build the coloured prompt HTML ──────────────────
  function promptHtml(user, path) {
    user = user || USER_DATA.username;
    path = path || '~';
    return `<span class="p-user">${user}</span><span class="p-sep">@portfolio</span><span class="p-sep">:</span><span class="p-path">${path}</span><span class="p-sym">$&nbsp;</span>`;
  }

  // ── help ─────────────────────────────────────────────────────
  function help() {
    const cmds = [
      ['about',       'Who is believer_99?'],
      ['education',   'Academic background'],
      ['projects',    'Portfolio projects'],
      ['skills',      'Technical skills list'],
      ['tech_stack',  'Skills with logos'],
      ['resume',      'Download/view my resume'],
      ['social',      'Social & contact links'],
      ['contact',     'Contact information'],
      ['─────────',   '───────────────────────────'],
      ['ls',          'List files in virtual home'],
      ['touch <file>','Create a file (5MB quota)'],
      ['rm <file>',   'Remove a file'],
      ['pwd',         'Print working directory'],
      ['history',     'Show command history'],
      ['date',        'Current date & time'],
      ['uname',       'System/browser info'],
      ['ipconfig',    'Network information'],
      ['─────────',   '───────────────────────────'],
      ['theme <name>','Switch theme (default | light | mario | interstellar)'],
      ['spotify',     'Embedded Spotify player'],
      ['traceroute',  'Simulated network trace'],
      ['useradd <n>', 'Change your display name'],
      ['sudo <cmd>',  'Try to escalate privileges 👀'],
      ['echo <text>', 'Print text to terminal'],
      ['clear',       'Clear the terminal'],
      ['help',        'Show this menu'],
    ];

    const rows = cmds.map(([cmd, desc]) =>
      `<div class="help-row"><span class="help-cmd">${cmd}</span><span class="help-desc">${desc}</span></div>`
    ).join('');

    return { html: `
      <div class="out-success sec-title">AVAILABLE COMMANDS</div>
      <div style="margin-top:6px">${rows}</div>
      <div class="out-dim" style="margin-top:8px">Tip: Use <span class="out-accent3">Tab</span> to auto-complete, <span class="out-accent3">↑↓</span> for history.</div>
    `};
  }

  // ── about ────────────────────────────────────────────────────
  function about() {
    const lines = USER_DATA.bio.map(l =>
      l === '' ? `<span class="empty-line"></span>` : `<span class="line">${l}</span>`
    ).join('');
    return { html: `
      <div class="out-success sec-title">ABOUT ME</div>
      <div style="margin-top:6px;color:var(--text)">${lines}</div>
    `};
  }

  // ── education ────────────────────────────────────────────────
  function education() {
    const cards = USER_DATA.education.map(e => `
      <div class="edu-card">
        <div class="edu-inst">🎓 ${e.institution}</div>
        <div class="edu-degree">${e.degree}</div>
        <div class="edu-detail">📅 ${e.period}</div>
        <div class="edu-detail">📊 CGPA: <span class="out-success">${e.cgpa}</span></div>
      </div>
    `).join('');
    return { html: `<div class="out-success sec-title">EDUCATION</div>${cards}` };
  }

  // ── projects ─────────────────────────────────────────────────
  function projects() {
    const cards = USER_DATA.projects.map((p, i) => {
      const tags = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
      return `
        <div class="project-card fade-in" style="animation-delay:${i * 60}ms">
          <div>
            <a class="project-name" href="${p.link}" target="_blank" rel="noopener noreferrer">▶ ${p.name}</a>
          </div>
          <div class="project-desc">${p.description}</div>
          <div class="tags">${tags}</div>
        </div>
      `;
    }).join('<div class="divider"></div>');

    return { html: `
      <div class="out-success sec-title">PROJECTS</div>
      <div class="out-dim" style="margin:2px 0 8px">Click a project name to open its repository.</div>
      ${cards}
    `};
  }

  // ── skills ───────────────────────────────────────────────────
  function skills() {
    const sections = Object.entries(USER_DATA.skills);
    const html = sections.map(([cat, items]) => {
      const names = items.map(i => {
        const icon = iconHtml(i.icon);
        return `<span class="tech-item-inline">${icon} ${i.name}</span>`;
      }).join('  ');
      return `
        <div class="tech-category">
          <div class="tech-cat-name">[${cat.replace('_', ' ').toUpperCase()}]</div>
          <div style="margin-left:4px;line-height:2.2">${names}</div>
        </div>
      `;
    }).join('');
    return { html: `<div class="out-success sec-title">SKILLS</div>${html}` };
  }

  // ── tech_stack (with logos) ───────────────────────────────────
  function tech_stack() {
    const sections = Object.entries(USER_DATA.skills);
    const html = sections.map(([cat, items]) => {
      const grid = items.map(item => `
        <div class="tech-item">
          ${iconHtml(item.icon)}
          <span>${item.name}</span>
        </div>
      `).join('');
      return `
        <div class="tech-category">
          <div class="tech-cat-name">[${cat.replace('_', ' ').toUpperCase()}]</div>
          <div class="tech-grid">${grid}</div>
        </div>
      `;
    }).join('');
    return { html: `<div class="out-success sec-title">TECH STACK</div>${html}` };
  }

  // ── contact ──────────────────────────────────────────────────
  function contact() {
    const c = USER_DATA.contact;
    return { html: `
      <div class="out-success sec-title">CONTACT</div>
      <div class="contact-row"><span class="contact-icon">📧</span> <a class="contact-link" href="mailto:${c.email}">${c.email}</a></div>
      <div class="contact-row"><span class="contact-icon">🐙</span> <a class="contact-link" href="${c.github}" target="_blank">${c.github}</a></div>
      <div class="contact-row"><span class="contact-icon">💼</span> <a class="contact-link" href="${c.linkedin}" target="_blank">${c.linkedin}</a></div>
      <div class="contact-row"><span class="contact-icon">🧩</span> <a class="contact-link" href="${c.leetcode}" target="_blank">${c.leetcode}</a></div>
    `};
  }

  // ── social (alias for contact) ───────────────────────────────
  function social() { return contact(); }

  // ── resume ───────────────────────────────────────────────────
  function resume() {
    return { html: `
      <div class="out-success sec-title">RESUME</div>
      <div class="line">📄 <a class="contact-link" href="${USER_DATA.resume}" target="_blank" download>Download Resume (PDF)</a></div>
      <div class="out-dim" style="margin-top:4px">If the file is not yet uploaded, the link will 404.</div>
    `};
  }

  // ── ls ───────────────────────────────────────────────────────
  function ls() {
    const entries = VFS.ls();
    if (!entries.length) return { lines: ['(empty directory)'] };

    const dirs  = entries.filter(e => e.type === 'dir');
    const files = entries.filter(e => e.type === 'file');

    const fmt = e =>
      e.type === 'dir'
        ? `<span class="out-info">${e.name}/</span>`
        : `<span class="out-success">${e.name}</span>`;

    return { html: `<div style="display:flex;flex-wrap:wrap;gap:12px">${[...dirs, ...files].map(fmt).join('')}</div>` };
  }

  // ── pwd ──────────────────────────────────────────────────────
  function pwd() {
    return { lines: ['/home/believer_99'] };
  }

  // ── touch ────────────────────────────────────────────────────
  function touch(args) {
    const name = args[0];
    const res  = VFS.touch(name);
    if (!res.ok) return { lines: [`<span class="out-error">${res.msg}</span>`], html: true };
    const q = VFS.quota();
    return { lines: [`${res.msg}  (quota: ${q.pct}% used)`] };
  }

  // ── rm ───────────────────────────────────────────────────────
  function rm(args) {
    const name = args[0];
    const res  = VFS.rm(name);
    if (!res.ok) return { html: `<span class="out-error">${res.msg}</span>` };
    return { lines: [res.msg] };
  }

  // ── history — exposed via Terminal ───────────────────────────
  function historyCmd() {
    return { action: 'history' };
  }

  // ── date ─────────────────────────────────────────────────────
  function date() {
    return { lines: [new Date().toString()] };
  }

  // ── uname ────────────────────────────────────────────────────
  function uname() {
    return { lines: [
      `OS       : ${navigator.platform || 'Unknown'}`,
      `Browser  : ${navigator.userAgent}`,
      `Language : ${navigator.language}`,
      `Online   : ${navigator.onLine ? 'Yes' : 'No'}`,
    ]};
  }

  // ── ipconfig ─────────────────────────────────────────────────
  async function ipconfig() {
    try {
      const data = window.preloadedIpData || await (await fetch('https://api.ipify.org?format=json')).json();
      return { html: `
        <div class="out-success sec-title">NETWORK INFO</div>
        <div>Public IP : <span class="out-info">${data.ip}</span></div>
        <div>Hostname  : <span class="out-dim">portfolio.believer_99.dev</span></div>
        <div>Subnet    : <span class="out-dim">255.255.255.0</span></div>
      `};
    } catch {
      return { html: `
        <div class="out-success sec-title">NETWORK INFO</div>
        <div>Public IP : <span class="out-info">Unavailable (CORS / offline)</span></div>
        <div>Hostname  : <span class="out-dim">portfolio.believer_99.dev</span></div>
      `};
    }
  }

  // ── traceroute ───────────────────────────────────────────────
  function traceroute(args) {
    const dest = args[0] || 'believer_99.dev';
    const hops = [
      { n: 1,  ip: '192.168.1.1',       ms: [1, 1, 2],      label: 'gateway.local' },
      { n: 2,  ip: '10.0.0.1',          ms: [5, 6, 5],      label: 'isp-node-1' },
      { n: 3,  ip: '203.0.113.45',      ms: [12, 11, 13],   label: 'core-router-mum' },
      { n: 4,  ip: '208.67.220.220',    ms: [28, 27, 29],   label: 'cf-edge-sin' },
      { n: 5,  ip: '104.21.0.1',        ms: [35, 34, 36],   label: dest },
    ];

    const rows = hops.map(h =>
      `<div><span class="out-dim">${String(h.n).padStart(2)}</span>  <span class="out-info">${h.ip.padEnd(18)}</span>  ` +
      `<span class="out-success">${h.ms.map(m => m + ' ms').join('  ')}</span>  ` +
      `<span class="out-dim">${h.label}</span></div>`
    ).join('');

    return { html: `
      <div class="out-success sec-title">TRACEROUTE — ${dest}</div>
      ${rows}
      <div class="out-dim" style="margin-top:4px">Trace complete.</div>
    `};
  }

  // ── spotify ──────────────────────────────────────────────────
  function spotify() {
    return { html: `
      <div class="out-success sec-title">NOW PLAYING</div>
      <div class="spotify-wrap">
        <iframe
          src="${USER_DATA.spotify}"
          width="100%"
          height="152"
          frameborder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy">
        </iframe>
      </div>
    `};
  }

  // ── theme ────────────────────────────────────────────────────
  function theme(args) {
    const res = Themes.apply(args[0]);
    if (res.ok) return { html: `<span class="out-success">✔ ${res.msg}</span>` };
    return { html: `<span class="out-error">✘ ${res.msg}</span>` };
  }

  // ── echo ─────────────────────────────────────────────────────
  function echo(args) {
    return { lines: [args.join(' ')] };
  }

  // ── useradd ──────────────────────────────────────────────────
  function useradd(args) {
    const name = args[0];
    if (!name) return { html: `<span class="out-error">Usage: useradd &lt;username&gt;</span>` };
    return { action: 'setuser', value: name };
  }

  // ── sudo ─────────────────────────────────────────────────────
  function sudo(args) {
    const messages = [
      'Sorry, user believer_99 is not in the sudoers file. This incident will be reported. 😈',
      'Password: ••••••••  —  Incorrect password. Try again? (Hint: there is no password.)',
      'sudo: permission denied. Nice try, hackerman.',
      '[sudo] password for believer_99: nope.',
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    return { html: `<span class="out-error">${msg}</span>` };
  }

  // ── clear — handled by app.js ─────────────────────────────────
  function clear() { return { action: 'clear' }; }

  // ── Dispatch table ────────────────────────────────────────────
  const CMDS = {
    help, about, education, projects, skills, tech_stack,
    contact, social, resume,
    ls, pwd, touch, rm,
    history: historyCmd,
    date, uname, ipconfig, traceroute, spotify,
    theme, echo, useradd, sudo, clear,
  };

  // ── Public run() ──────────────────────────────────────────────
  return {
    list: () => Object.keys(CMDS),

    async run(input) {
      const parts   = input.trim().split(/\s+/);
      const cmdName = parts[0].toLowerCase();
      const args    = parts.slice(1);

      if (!cmdName) return null;

      const fn = CMDS[cmdName];
      if (!fn) {
        return { html: `<span class="out-error">command not found: ${cmdName}</span><span class="out-dim"> — type <strong>help</strong> for available commands</span>` };
      }

      // Handle async commands (e.g. ipconfig)
      const result = await Promise.resolve(fn(args));
      return result;
    },
  };
})();
