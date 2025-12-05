document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const inputLine = document.getElementById('input-line');
    const commandInput = document.getElementById('command-input');
    const terminal = document.getElementById('terminal');
    const cursor = document.querySelector('.cursor');

    // Portfolio Data
    const bio = `
NAME: Ho Huu Duc
ROLE: Software Engineer
EXP:  2 Years
LOC:  Vietnam

SUMMARY:
Software Engineer specializing in .NET and NodeJS.
Skilled in analyzing requirements, implementing user functionalities, and optimizing systems.
    `;

    const projects = `
[DIR] PROJECTS
--------------
1. PROCES.S (Fujinet System)
   - ERP system for construction industry (.NET, Winform, SQL Server)
   
2. Lucky Draw (ALTA Software)
   - API for lucky draw system (ASP.NET MVC, Entity Framework, JWT)

3. ParcelWebApp (Personal)
   - CLI for quick Parcel deployment

4. Singleton DLL (Personal)
   - Object management library
    `;

    const skills = `
[SYS] SKILLS LOADED
-------------------
LANGUAGES:  C#, JavaScript, TypeScript, SQL
FRAMEWORKS: .NET, NodeJS, ASP.NET MVC
DATABASES:  SQL Server, Oracle
CONCEPTS:   OOP, SOLID, Design Patterns
    `;

    const help = `
AVAILABLE COMMANDS:
-------------------
about     - Display user information
skills    - List technical skills
projects  - List projects
clear     - Clear terminal screen
help      - Show this help message
    `;

    const asciiArt = String.raw`
  _   _       _   _             ____             
 | | | |     | | | |           |  _ \            
 | |_| | ___ | |_| |_   _ _   _| | | \_   _  ___ 
 |  _  |/ _ \|  _  | | | | | | | | | | | | |/ __|
 | | | | (_) | | | | |_| | |_| | |_| | |_| | (__ 
 |_| |_|\___/|_| |_|\__,_|\__,_|____/ \__,_|\___|
`;

    // Typing Effect
    async function typeText(text, element, speed = 30) {
        return new Promise(resolve => {
            let i = 0;
            function type() {
                if (i < text.length) {
                    if (text.charAt(i) === '\n') {
                        element.innerHTML += '<br>';
                        terminal.scrollTo(0, document.body.scrollHeight);
                    } else if (text.charAt(i) === ' ') {
                        element.innerHTML += '&nbsp;';
                    } else {
                        element.innerText += text.charAt(i);
                    }
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    async function printLine(text, speed = 30, className = 'command-output') {
        const line = document.createElement('div');
        line.className = className;
        output.appendChild(line);
        await typeText(text, line, speed);
    }

    function printHtml(html) {
        const line = document.createElement('div');
        line.innerHTML = html;
        output.appendChild(line);
    }

    function getPromptHtml(cmd = "") {
        return `<div class="input-line">
            <span class="prompt-user">visitor</span><span class="prompt-at">@</span><span class="prompt-host">hohuuduc</span><span class="prompt-path">:~$</span><span>${cmd}</span>
        </div>`;
    }

    async function runBootSequence() {
        // 1. ASCII Art
        await printLine(asciiArt, 5, 'ascii-art');

        // 2. Show prompt first
        const promptDiv = document.createElement('div');
        promptDiv.className = 'input-line';
        promptDiv.innerHTML = `<span class="prompt-user">visitor</span><span class="prompt-at">@</span><span class="prompt-host">hohuuduc</span><span class="prompt-path">:~$</span><span id="auto-type-cursor"></span>`;
        output.appendChild(promptDiv);

        const autoTypeCursor = document.getElementById('auto-type-cursor');
        const commandToType = "about";

        for (let i = 0; i < commandToType.length; i++) {
            autoTypeCursor.innerText += commandToType[i];
            await new Promise(r => setTimeout(r, 100));
        }

        await new Promise(r => setTimeout(r, 500));

        // Remove the temporary prompt and replace with fixed history line
        output.removeChild(promptDiv);
        await handleCommand(commandToType)

        // 3. Show Final Prompt
        inputLine.style.display = 'flex';
        commandInput.focus();

        // Initialize cursor position
        setTimeout(updateCursorPosition, 100);
    }

    // Command Parser
    async function handleCommand(cmd) {
        const command = cmd.trim().toLowerCase();

        // Create history line
        printHtml(getPromptHtml(cmd));

        if (command === '') return;

        switch (command) {
            case 'help':
                await printLine(help, 5);
                break;
            case 'about':
                await printLine(bio, 5);
                break;
            case 'skills':
                await printLine(skills, 5);
                break;
            case 'projects':
                await printLine(projects, 5);
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            default:
                await printLine(`Command not found: ${command}. Type 'help' for list.`, 10);
        }
    }

    // Function to update cursor position
    function updateCursorPosition() {
        if (!cursor || !commandInput) return;

        // Get the text before cursor position
        const textBeforeCursor = commandInput.value.substring(0, commandInput.selectionStart);

        // Create a temporary span to measure text width
        const span = document.createElement('span');
        span.style.font = window.getComputedStyle(commandInput).font;
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre';
        span.textContent = textBeforeCursor;
        document.body.appendChild(span);

        // Calculate position
        const textWidth = span.offsetWidth;
        document.body.removeChild(span);

        // Get the prompt width
        const promptWidth = commandInput.offsetLeft;

        // Position the cursor
        cursor.style.left = (promptWidth + textWidth) + 'px';
    }

    // Event Listeners
    commandInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const cmd = commandInput.value;
            commandInput.value = '';
            inputLine.style.display = 'none'; // Hide input while processing
            await handleCommand(cmd);
            inputLine.style.display = 'flex';
            commandInput.focus();
            terminal.scrollTo(0, document.body.scrollHeight);
            updateCursorPosition();
        }
    });

    // Update cursor position on input
    commandInput.addEventListener('input', updateCursorPosition);

    // Update cursor position on click (when user changes cursor position)
    commandInput.addEventListener('click', updateCursorPosition);

    // Update cursor position on keyup (for arrow keys)
    commandInput.addEventListener('keyup', updateCursorPosition);

    // Keep focus on input
    document.addEventListener('click', () => {
        commandInput.focus();
    });

    // Start
    runBootSequence();
});
