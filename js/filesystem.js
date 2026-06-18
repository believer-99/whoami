/* ================================================================
   filesystem.js — Virtual Filesystem backed by localStorage
   ================================================================ */

const VFS = (() => {
  const STORAGE_KEY = 'portfolio_vfs';
  const MAX_BYTES   = 5 * 1024 * 1024; // 5 MB simulated cap
  const BYTE_PER_CHAR = 2;

  // ── Default structure ──────────────────────────────────────
  const DEFAULT_FS = {
    '~': {
      type: 'dir',
      children: {
        'readme.txt': { type: 'file', content: 'Welcome to believer_99\'s portfolio terminal.\nType `help` to get started.', size: 80 },
        'projects':   { type: 'dir', children: {} },
        'notes':      { type: 'dir', children: {} },
      },
    },
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_FS));
    } catch { return JSON.parse(JSON.stringify(DEFAULT_FS)); }
  }

  function save(fs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fs)); } catch {}
  }

  function totalUsed(fs, node) {
    node = node || fs['~'];
    if (node.type === 'file') return node.size || 0;
    return Object.values(node.children || {}).reduce((a, c) => a + totalUsed(fs, c), 0);
  }

  function resolve(path, fs) {
    // Only ~ supported for now
    return fs['~'];
  }

  function listDir(dir) {
    const children = dir.children || {};
    return Object.entries(children).map(([name, node]) => ({
      name,
      type: node.type,
      size: node.size || 0,
    }));
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    ls() {
      const fs = load();
      return listDir(resolve('~', fs));
    },

    touch(filename) {
      if (!filename) return { ok: false, msg: 'touch: missing filename' };
      const fs  = load();
      const dir = resolve('~', fs);
      const used = totalUsed(fs);
      const fileSize = filename.length * BYTE_PER_CHAR + 24;
      if (used + fileSize > MAX_BYTES) {
        return { ok: false, msg: `touch: quota exceeded (${_fmt(used)} / ${_fmt(MAX_BYTES)} used)` };
      }
      if (dir.children[filename]) {
        dir.children[filename].size += 0; // touch existing → no-op
        save(fs);
        return { ok: true, msg: `touched: ${filename}` };
      }
      dir.children[filename] = { type: 'file', content: '', size: fileSize };
      save(fs);
      return { ok: true, msg: `created: ${filename}` };
    },

    rm(filename) {
      if (!filename) return { ok: false, msg: 'rm: missing filename' };
      const fs  = load();
      const dir = resolve('~', fs);
      if (!dir.children[filename]) return { ok: false, msg: `rm: ${filename}: no such file` };
      if (dir.children[filename].type === 'dir') return { ok: false, msg: `rm: ${filename}: is a directory` };
      delete dir.children[filename];
      save(fs);
      return { ok: true, msg: `removed: ${filename}` };
    },

    quota() {
      const fs = load();
      const used = totalUsed(fs);
      return { used, max: MAX_BYTES, pct: Math.round((used / MAX_BYTES) * 100) };
    },

    reset() {
      localStorage.removeItem(STORAGE_KEY);
    },
  };

  function _fmt(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
})();
