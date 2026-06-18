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
    if (t) t.textContent = `${currentUser}@portfolio: ~`;
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
  }

  // ── History navigation (arrow keys) ──────────────────────────
  function historyUp() {
    if (!cmdHistory.length) return;
    const input = cmdInput();
    if (historyIdx === -1) tempInput = input.value;
    historyIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
    input.value = cmdHistory[cmdHistory.length - 1 - historyIdx];
    // Move cursor to end
    setTimeout(() => { input.selectionStart = input.selectionEnd = input.value.length; }, 0);
  }

  function historyDown() {
    if (historyIdx <= 0) {
      historyIdx = -1;
      cmdInput().value = tempInput;
      return;
    }
    historyIdx--;
    cmdInput().value = cmdHistory[cmdHistory.length - 1 - historyIdx];
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

    // Print the echoed command
    printCmdEcho(trimmed || '');

    if (!trimmed) return;

    // Save to history (avoid consecutive duplicates)
    if (!cmdHistory.length || cmdHistory[cmdHistory.length - 1] !== trimmed) {
      cmdHistory.push(trimmed);
    }

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

  // ── Mario Loading Screen ──────────────────────────────────────
  function runLoadingScreen() {
    return new Promise(resolve => {
      const canvas = document.getElementById('mario-canvas');
      const ctx    = canvas.getContext('2d');
      const bar    = document.getElementById('loading-bar');
      const dotsEl = document.getElementById('loading-dots');

      // ── Mario pixel sprite (16×16 grid, each cell = 4px) ──
      const SCALE = 3;
      const CELL  = 4 * SCALE;

      // Simplified Mario sprite rows (top to bottom)
      // Colors: R=red, S=skin, B=brown, W=white, _=transparent
      const MARIO = [
        ' _RRRR_ ',
        '_RRRRRRR',
        '_SSSBB_ ',
        'SBSBSBS ',
        'SSSSSSS ',
        '__RRR__ ',
        '_RBRB__ ',
        '_RBRB__ ',
        '_RRRR__ ',
        '___SS__ ',
        '__SSSS_ ',
        '__SS_SS ',
      ];
      const COL = { R:'#e63030', S:'#f5c5a3', B:'#7a3b0a', W:'#ffffff', _:'transparent' };

      function drawMario(x, y) {
        MARIO.forEach((row, ri) => {
          [...row].forEach((ch, ci) => {
            const color = COL[ch] || 'transparent';
            if (color === 'transparent') return;
            ctx.fillStyle = color;
            ctx.fillRect(x + ci * CELL, y + ri * CELL, CELL - 1, CELL - 1);
          });
        });
      }

      // Ground
      function drawGround(y) {
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(0, y, canvas.width, 6);
        ctx.fillStyle = '#5c4010';
        ctx.fillRect(0, y + 6, canvas.width, 2);
      }

      // Coin block
      function drawBlock(x, y) {
        ctx.fillStyle = '#d4a017';
        ctx.fillRect(x, y, 24, 24);
        ctx.fillStyle = '#f0c040';
        ctx.fillRect(x + 2, y + 2, 20, 20);
        ctx.fillStyle = '#8a6200';
        ctx.font = `bold ${12}px monospace`;
        ctx.fillText('?', x + 7, y + 17);
      }

      let marioX = -40;
      let frame  = 0;
      let progress = 0;
      const DURATION = 3000; // ms
      const start    = performance.now();
      let dots = 0;

      const groundY = canvas.height - 30;

      function tick(now) {
        const elapsed = now - start;
        progress = Math.min(elapsed / DURATION, 1);

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw elements
        drawGround(groundY);
        drawBlock(canvas.width * 0.5 - 12, groundY - 60);
        drawBlock(canvas.width * 0.5 + 40, groundY - 60);

        // Animate Mario running
        marioX = -40 + (canvas.width + 80) * progress;
        drawMario(marioX, groundY - MARIO.length * CELL);

        // Loading bar
        bar.style.width = (progress * 100) + '%';

        // Dots
        if (Math.floor(elapsed / 400) !== dots) {
          dots = Math.floor(elapsed / 400) % 4;
          dotsEl.textContent = '.'.repeat(dots);
        }

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          // Fade out
          const screen = document.getElementById('loading-screen');
          screen.classList.add('hidden');
          setTimeout(() => {
            screen.style.display = 'none';
            resolve();
          }, 900);
        }
      }

      requestAnimationFrame(tick);
    });
  }

  // ── Init ──────────────────────────────────────────────────────
  async function init() {
    // Wire up events
    cmdInput().addEventListener('keydown', onKeydown);
    keepFocus();

    // Run Mario loading screen, then show terminal
    await runLoadingScreen();

    // Restore saved theme
    Themes.restore();

    // Show welcome message
    await showWelcome();

    cmdInput().focus();
  }

  // ── Start ─────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  return { clear, print, printLines };
})();
