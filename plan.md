# Antigravity Execution Plan: Terminal Web Portfolio

## Project Overview
A highly interactive, terminal-themed personal portfolio website built primarily with HTML, CSS, and Vanilla JavaScript. The portfolio simulates a Unix-like command-line interface, featuring command history, tab auto-completion, simulated file systems, and dynamic theming.

---

## Tech Stack Analysis & Library Recommendations

While the core will be built strictly using **HTML, CSS, and Vanilla JavaScript**, here is an architectural assessment of whether external libraries or frameworks (like React or TypeScript) are necessary:

### 1. Vanilla JS vs. React / TypeScript
* **Vanilla JS (Recommended for this scope):** A terminal emulator fundamentally relies on appending discrete blocks of text (DOM nodes) to a history container and keeping a single input field in focus. Vanilla JS excels at this direct DOM manipulation. It also keeps the payload incredibly lightweight.
* **React:** While React is powerful, managing a continuously growing list of terminal inputs/outputs can sometimes conflict with React's declarative rendering cycle if not optimized properly (e.g., managing focus, scrolling to bottom). It is not strictly necessary here.
* **TypeScript:** Highly recommended if the project scales. It would provide strong typing for the `Command` interfaces, the simulated `FileSystem` tree, and the `User` objects. However, sticking to Vanilla JS is perfectly fine for a rapid prototype.

### 2. External Library Suggestions (Optional but Helpful)
* **Syntax Highlighting:** Instead of writing custom Regex for the "command recognition color change," you might consider a lightweight parser, but for a limited command set, Vanilla JS string matching is sufficient.
* **Typing Effects:** `Typed.js` could be used for the "token-by-token display" on the intro/loading screen, though `setTimeout` in Vanilla JS achieves this easily without dependencies.
* **Canvas/Game Engine:** For the "Mario loading screen" or the `Games?` command, using the HTML5 `<canvas>` API natively is best. If the games get complex, a micro-library like `Kaboom.js` could be integrated later.

---

## Implementation Roadmap

### Phase 1: The Shell & Core Engine
**Goal:** Create the basic UI and enable input/output looping.
* Set up `index.html`, `style.css`, and `app.js`.
* Create the main terminal container: an uneditable output `<div>` and an active input row containing the prompt (`ashutosh@portfolio:~$`) and an `<input type="text">`.
* Implement basic CSS (Vim-like default: dark background, monospace font, green/white text).
* Write the JavaScript event listener for the `Enter` key.
* Capture input, append it to the output `<div>`, and clear the input field.
* Implement auto-scroll to the bottom on new output.
* Create the command dispatcher function.
* Implement the `help`, `clear`, and `echo` commands.

### Phase 2: Portfolio Content & Navigation
**Goal:** Populate the portfolio with your actual data.
* Implement informational commands: `about`, `education`, `contact`.
* Implement professional commands: `projects`, `resume`, `tech_stack`, `skills`. Structure the output using template literals in JS to make it look like formatted terminal tables.
* Implement the `social` command. Ensure the output contains clickable HTML `<a>` tags targeting `_blank` for LinkedIn, GitHub, etc.

### Phase 3: Advanced Terminal Mechanics
**Goal:** Make it feel like a real developer environment.
* **History:** Implement an array to store command history. Add `keyup` and `keydown` event listeners to cycle through previous commands using the Up/Down arrow keys.
* **Auto-complete:** Implement `tab` key functionality. Prevent default tab behavior (focus shifting) and write logic to auto-complete commands based on the current input string against a predefined list of valid commands.
* **Visuals:** Implement the token-by-token typing effect mechanism for specific outputs (like the `intro` or `help` menu) using `setInterval` or `async/await` with `setTimeout`.

### Phase 4: Simulated File & User System
**Goal:** Implement stateful logic using browser `localStorage`.
* **Users:** Implement `useradd` and `sudo`. Create a state object managing the current user (e.g., `guest` vs `named`). Alter the terminal prompt string based on the active user.
* **Filesystem:** Implement `touch`, `ls`, and `pwd`. Use a JSON object stored in `localStorage` to represent a virtual directory structure. 
* **Constraints:** Implement the 5MB logic for `touch` (simulate file sizes in the JSON metadata) and implement standard utilities like `history`, `date` (mapped to `cal`), and `navigator.userAgent` (mapped to `uname`).

### Phase 5: Theming, Polish, & Easter Eggs
**Goal:** Add the "wow" factor and final touches.
* **Theming:** Create CSS classes for `theme-mario`, `theme-interstellar`, `theme-light`, etc. Implement the `theme <name>` command to toggle these classes on the `<body>` element.
* **Easter Eggs & Network:** Implement `spotify` (could embed an iframe of a playlist). Implement the Mario loading screen on initial page load (a 3-second `<div>` overlay that fades out). Mock `ipconfig` (fetch real IP via a free API like `ipify` or mock it) and `traceroute`.

---

## System Architecture Extension (Future Scope)
Once the frontend is polished, this architecture is perfectly suited for a backend migration. Instead of mocking the file system in `localStorage`, the terminal input could send REST or gRPC requests to a **Golang** backend. The Go server could interact with a lightweight containerized environment (e.g., Docker) to execute safe, sandboxed commands or retrieve actual server metrics, creating a powerful demonstration of Systems Engineering and API integration.

---

## Antigravity Prompting Strategy

When feeding this into Antigravity, **do not prompt the entire project at once.** Use modular prompts based on the phases above:

**Prompt 1 (Phase 1):** > "I want to build a terminal-based web portfolio using vanilla HTML, CSS, and JS. Please generate the initial `index.html`, `style.css` (with a Vim-like dark theme), and `app.js`. The UI should have a static history div and an input area at the bottom. When I press Enter, it should grab the input, display it in the history div, clear the input, and scroll to the bottom. No frameworks."

**Prompt 2 (Phase 2):**
> "Here is my current `app.js`. Let's build a command dispatcher. I need a modular way to handle commands. Please implement logic for `help`, `about`, and `projects`. The output should support HTML so I can return structured tables or clickable links."

**Prompt 3 (Phase 3 - History):**
> "I want to add command history using the Up and Down arrow keys. Please update the input event listener to track submitted commands in an array and allow cycling through them."
