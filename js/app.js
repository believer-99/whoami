/* ================================================================
   app.js — Terminal Engine (Phase 1-5 complete)
   Handles: input loop, history, tab-complete, typing FX, user state,
            Mario loading screen, welcome intro
   ================================================================ */

const Terminal = (() => {

  // ── State ────────────────────────────────────────────────────
  let cmdHistory  = [];     // submitted command history
  let historyIdx  = -1;     // current arrow-key position
  let tempInput   = '';     // saved input before cycling history
  let currentUser = USER_DATA.username;
  let busy        = false;  // lock input during typing animations

  // ── DOM references ───────────────────────────────────────────
  const output     = () => document.getElementById('output');
  const cmdInput   = () => document.getElementById('cmd-input');
  const inputRow   = () => document.getElementById('input-row');
  const promptSpan = () => document.getElementById('prompt-span');
  const termBody   = () => document.getElementById('terminal-body');
  const titleText  = () => document.getElementById('titlebar-text');

  // ── Prompt HTML ──────────────────────────────────────────────
  function buildPrompt(user, path) {
    user = user || currentUser;
    path = path || '~';
    return `<span class="p-user">${user}</span><span class="p-sep">@portfolio</span><span class="p-sep">:</span><span class="p-path">${path}</span><span class="p-sym">$&nbsp;</span>`;
  }

  function refreshPrompt() {
    const p = promptSpan();
    if (p) p.innerHTML = buildPrompt();
    const t = titleText();
    if (t) t.textContent = `VIM`;
  }

  const FILE_NAMES = {
    about: 'about.txt',
    projects: 'projects.md',
    skills: 'skills.json',
    contact: 'contact.py',
    resume: 'resume.pdf',
    spotify: 'spotify.vim',
    term: 'term.sh'
  };

  function setActiveTab(tabName) {
    const activeCmd = (tabName === 'spotify') ? 'spotify' : '';

    document.querySelectorAll('.vim-tab').forEach(tab => {
      const cmd = tab.getAttribute('data-cmd') || '';
      if (cmd === activeCmd) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update statusline file name dynamically even if the tab doesn't exist visually
    const fileEl = document.getElementById('status-file');
    if (fileEl) {
      if (FILE_NAMES[tabName]) {
        fileEl.textContent = FILE_NAMES[tabName];
      } else {
        fileEl.textContent = tabName;
      }
    }
  }

  function updateStatusLine() {
    const input = cmdInput();
    const linecolEl = document.getElementById('status-linecol');
    if (linecolEl && input) {
      const col = input.selectionStart + 1;
      const row = cmdHistory.length + 1;
      linecolEl.textContent = ` ${row}:${col}`;
    }
  }

  function setStatusMode(mode) {
    const modeEl = document.getElementById('status-mode');
    const linecolEl = document.getElementById('status-linecol');
    if (modeEl) {
      modeEl.textContent = mode;
      if (mode === 'INSERT') {
        modeEl.classList.add('insert-mode');
        if (linecolEl) linecolEl.classList.add('insert-mode');
      } else {
        modeEl.classList.remove('insert-mode');
        if (linecolEl) linecolEl.classList.remove('insert-mode');
      }
    }
  }

  // ── Print helpers ─────────────────────────────────────────────
  function print(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    output().appendChild(div);
    scrollBottom();
  }

  function printLines(lines) {
    lines.forEach(l => {
      const div = document.createElement('div');
      div.className = 'line';
      // Allow raw HTML lines (for colored spans)
      div.innerHTML = l;
      output().appendChild(div);
    });
    scrollBottom();
  }

  function printCmdEcho(input) {
    const div = document.createElement('div');
    div.className = 'cmd-echo';
    div.innerHTML = `<span class="prompt">${buildPrompt()}</span><span class="cmd-text">${escHtml(input)}</span>`;
    output().appendChild(div);
    scrollBottom();
  }

  function scrollBottom() {
    const b = termBody();
    if (b) b.scrollTop = b.scrollHeight;
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Typing effect ─────────────────────────────────────────────
  function typeText(lines, delay = 28) {
    return new Promise(resolve => {
      let i = 0;
      function next() {
        if (i >= lines.length) { resolve(); return; }
        print(lines[i]);
        i++;
        setTimeout(next, delay);
      }
      next();
    });
  }

  // ── Clear ────────────────────────────────────────────────────
  function clear() {
    output().innerHTML = '';
  }

  // ── Show command history ─────────────────────────────────────
  function showHistory() {
    if (!cmdHistory.length) {
      print('<span class="out-dim">(no commands yet)</span>');
      return;
    }
    const rows = cmdHistory.map((c, i) =>
      `<span class="out-dim">${String(i + 1).padStart(4)}  </span>${escHtml(c)}`
    );
    printLines(rows);
  }

  // ── Welcome intro (typing effect) ────────────────────────────
  async function showWelcome() {
    busy = true;
    const lines = [
      `<span class="out-success">╔══════════════════════════════════════════════════╗</span>`,
      `<span class="out-success">║</span>  <span class="out-accent3">Welcome to believer_99's Terminal Portfolio</span>  <span class="out-success">║</span>`,
      `<span class="out-success">╚══════════════════════════════════════════════════╝</span>`,
      ``,
      `<span class="out-dim">  Type </span><span class="out-info">help</span><span class="out-dim"> to see available commands.</span>`,
      `<span class="out-dim">  Type </span><span class="out-info">about</span><span class="out-dim"> to learn more about me.</span>`,
      `<span class="out-dim">  Type </span><span class="out-info">projects</span><span class="out-dim"> to explore my work.</span>`,
      `<span class="out-dim">  Type </span><span class="out-info">tech_stack</span><span class="out-dim"> to see my skills with logos.</span>`,
      ``,
      `<span class="out-dim">  Tip: </span><span class="out-accent3">Tab</span><span class="out-dim"> auto-completes · </span><span class="out-accent3">↑ ↓</span><span class="out-dim"> cycles history</span>`,
      ``,
    ];
    await typeText(lines, 35);
    busy = false;
    cmdInput().focus();
  }

  // ── Tab auto-complete ─────────────────────────────────────────
  function autoComplete() {
    const input  = cmdInput();
    const val    = input.value.trim();
    if (!val) return;

    const all    = Commands.list();
    const matches = all.filter(c => c.startsWith(val.toLowerCase()));

    if (matches.length === 1) {
      input.value = matches[0] + ' ';
    } else if (matches.length > 1) {
      printCmdEcho(val);
      print(`<span class="out-dim">${matches.join('  ')}</span>`);
    }
    updateStatusLine();
  }

  // ── History navigation (arrow keys) ──────────────────────────
  function historyUp() {
    if (!cmdHistory.length) return;
    const input = cmdInput();
    if (historyIdx === -1) tempInput = input.value;
    historyIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
    input.value = cmdHistory[cmdHistory.length - 1 - historyIdx];
    // Move cursor to end
    setTimeout(() => { 
      input.selectionStart = input.selectionEnd = input.value.length; 
      updateStatusLine();
    }, 0);
  }

  function historyDown() {
    if (historyIdx <= 0) {
      historyIdx = -1;
      cmdInput().value = tempInput;
      updateStatusLine();
      return;
    }
    historyIdx--;
    cmdInput().value = cmdHistory[cmdHistory.length - 1 - historyIdx];
    updateStatusLine();
  }

  // ── Process a submitted command ───────────────────────────────
  async function processCommand() {
    if (busy) return;
    const input = cmdInput();
    const raw   = input.value;
    const trimmed = raw.trim();

    input.value = '';
    historyIdx  = -1;
    tempInput   = '';
    
    updateStatusLine();

    // Print the echoed command
    printCmdEcho(trimmed || '');

    if (!trimmed) return;

    // Save to history (avoid consecutive duplicates)
    if (!cmdHistory.length || cmdHistory[cmdHistory.length - 1] !== trimmed) {
      cmdHistory.push(trimmed);
    }

    // Sync active tab
    const parts = trimmed.split(/\s+/);
    const cmdName = parts[0].toLowerCase();
    
    let tabTarget = 'term';
    if (cmdName === 'about') tabTarget = 'about';
    else if (cmdName === 'projects') tabTarget = 'projects';
    else if (cmdName === 'skills' || cmdName === 'tech_stack') tabTarget = 'skills';
    else if (cmdName === 'contact' || cmdName === 'social') tabTarget = 'contact';
    else if (cmdName === 'resume') tabTarget = 'resume';
    else if (cmdName === 'spotify') tabTarget = 'spotify';

    setActiveTab(tabTarget);

    // Run command
    const result = await Commands.run(trimmed);
    if (!result) return;

    // Handle special actions
    if (result.action === 'clear') {
      clear(); return;
    }
    if (result.action === 'history') {
      showHistory(); return;
    }
    if (result.action === 'setuser') {
      currentUser = result.value;
      refreshPrompt();
      print(`<span class="out-success">✔ Username set to: ${escHtml(result.value)}</span>`);
      return;
    }

    // Print HTML or line output
    if (result.html) print(result.html);
    if (result.lines) printLines(result.lines);
  }

  // ── Keyboard handler ──────────────────────────────────────────
  function onKeydown(e) {
    switch (e.key) {
      case 'Enter':   e.preventDefault(); processCommand();  break;
      case 'Tab':     e.preventDefault(); autoComplete();    break;
      case 'ArrowUp': e.preventDefault(); historyUp();       break;
      case 'ArrowDown':e.preventDefault();historyDown();     break;
      case 'l':
        if (e.ctrlKey) { e.preventDefault(); clear(); }
        break;
    }
  }

  // ── Keep input focused on click anywhere ─────────────────────
  function keepFocus() {
    document.addEventListener('click', e => {
      // Allow clicking links
      if (e.target.tagName === 'A') return;
      cmdInput().focus();
    });
  }

  // ── Vim Percentage Loading Screen with Asset Preload ──────────
  function runLoadingScreen() {
    return new Promise(resolve => {
      const bar    = document.getElementById('loading-bar');
      const pctEl  = document.getElementById('loading-percentage');
      const statusEl = document.getElementById('loading-status');
      const consoleEl = document.getElementById('loading-console');

      function writeConsoleLine(text, type = '') {
        if (!consoleEl) return;
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
      }

      const assets = [
        { type: 'style', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap', name: 'Google Fonts CSS' },
        { type: 'style', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css', name: 'Devicons CSS' },
        { type: 'font', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/fonts/devicon.woff2', name: 'Devicon WOFF2 Font' },
        { type: 'json', url: 'https://api.ipify.org?format=json', name: 'Public IP Info', isIpify: true },
        { type: 'blob', url: 'resume/Ashutosh_Shukla_Resume.pdf', name: 'Resume PDF', optional: true },
      ];

      let completedRequests = 0;
      let targetProgress = 0;
      let currentProgress = 0;

      // Animate progress smoothly
      function animate() {
        if (currentProgress < targetProgress) {
          currentProgress += 1;
        }
        if (bar) bar.style.width = currentProgress + '%';
        if (pctEl) pctEl.textContent = currentProgress + '%';

        if (currentProgress >= 100) {
          if (statusEl) statusEl.textContent = 'Vim portfolio ready!';
          writeConsoleLine('System boot successful.', 'success');
          setTimeout(() => {
            const screen = document.getElementById('loading-screen');
            if (screen) {
              screen.classList.add('hidden');
              setTimeout(() => {
                screen.style.display = 'none';
                resolve();
              }, 800);
            } else {
              resolve();
            }
          }, 400);
        } else {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
      
      writeConsoleLine('Initializing system bootloader...', 'info');
      writeConsoleLine('Preloading developer environment assets...', 'info');

      if (assets.length === 0) {
        targetProgress = 100;
        return;
      }

      assets.forEach(async (asset) => {
        try {
          writeConsoleLine(`Fetching asset: ${asset.name}...`);
          const res = await fetch(asset.url, { cache: 'force-cache' });
          if (!res.ok) throw new Error(`HTTP status ${res.status}`);
          
          if (asset.isIpify) {
            const data = await res.json();
            window.preloadedIpData = data;
          } else {
            await res.blob();
          }
          writeConsoleLine(`✔ Loaded ${asset.name}`, 'success');
        } catch (err) {
          writeConsoleLine(`⚠ Skipping ${asset.name}: ${err.message}`, 'error');
          if (asset.isIpify) {
            window.preloadedIpData = { ip: '127.0.0.1' };
          }
        } finally {
          completedRequests++;
          if (statusEl) statusEl.textContent = `Loading ${asset.name}...`;
          targetProgress = Math.round((completedRequests / assets.length) * 100);
        }
      });
    });
  }

  // ── Init ──────────────────────────────────────────────────────
  async function init() {
    // Wire up events
    const input = cmdInput();
    input.addEventListener('keydown', onKeydown);
    
    // Statusline and cursor tracking
    input.addEventListener('input', updateStatusLine);
    input.addEventListener('keyup', updateStatusLine);
    input.addEventListener('click', updateStatusLine);
    input.addEventListener('focus', () => setStatusMode('INSERT'));
    input.addEventListener('blur', () => setStatusMode('NORMAL'));
    
    keepFocus();

    // Wire up Vim tabs
    document.querySelectorAll('.vim-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const cmd = tab.getAttribute('data-cmd');
        if (cmd && !busy) {
          input.value = cmd;
          processCommand();
        } else if (!cmd) {
          setActiveTab('term');
        }
        input.focus();
      });
    });

    // Wire up terminal body scrolling
    const body = termBody();
    if (body) {
      body.addEventListener('scroll', () => {
        const pctEl = document.getElementById('status-pct');
        if (pctEl) {
          const scrollHeight = body.scrollHeight - body.clientHeight;
          if (scrollHeight <= 0) {
            pctEl.textContent = 'All';
          } else {
            const pct = Math.round((body.scrollTop / scrollHeight) * 100);
            if (pct === 0) pctEl.textContent = 'Top';
            else if (pct === 100) pctEl.textContent = 'Bot';
            else pctEl.textContent = pct + '%';
          }
        }
      });
    }

    // Run percentage loading screen, then show terminal
    await runLoadingScreen();

    // Restore saved theme
    Themes.restore();

    // Show welcome message
    await showWelcome();

    // Initial statusline update
    updateStatusLine();
    input.focus();
    setStatusMode('INSERT');
  }

  // ── Start ─────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  return { clear, print, printLines };
})();
