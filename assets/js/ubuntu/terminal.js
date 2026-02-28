(function () {
  function createUbuntuTerminal(options) {
    const historyEl = options.historyEl;
    const inputEl = options.inputEl;
    const dirEl = options.dirEl;
    const onExit = options.onExit;

    if (!historyEl || !inputEl || !dirEl) {
      return {
        reset: function () {},
        focus: function () {},
      };
    }

    const state = {
      currentDir: '',
      directories: ['Desktop', 'Documents', 'Downloads', 'Music', 'Pictures', 'Videos'],
    };

    function updatePrompt() {
      dirEl.textContent = state.currentDir;
    }

    function appendCommandLine(commandText) {
      const row = document.createElement('div');
      row.className = 'ubuntu-terminal__line';

      const user = document.createElement('span');
      user.className = 'ubuntu-terminal__user';
      user.textContent = 'jisan@ubuntu';

      const colon = document.createElement('span');
      colon.textContent = ':';

      const path = document.createElement('span');
      path.className = 'ubuntu-terminal__path';
      path.textContent = '~' + state.currentDir;

      const dollar = document.createElement('span');
      dollar.textContent = '$';

      const command = document.createElement('span');
      command.textContent = commandText;

      row.append(user, colon, path, dollar, command);
      historyEl.appendChild(row);
    }

    function appendOutput(text) {
      if (!text) return;
      const out = document.createElement('div');
      out.className = 'ubuntu-terminal__output';
      out.textContent = text;
      historyEl.appendChild(out);
    }

    function reset() {
      historyEl.textContent = '';
      state.currentDir = '';
      updatePrompt();
      inputEl.value = '';
    }

    function handleCommand(rawText) {
      const text = rawText.trim();
      if (!text) return;

      appendCommandLine(text);

      if (text === 'exit') {
        if (typeof onExit === 'function') onExit();
        return;
      }

      if (text === 'clear') {
        historyEl.textContent = '';
        return;
      }

      if (text === 'help') {
        appendOutput([
          'Available commands:',
          'help, ls, ls -l, cd <dir>, pwd, whoami, echo <text>, clear, exit',
        ].join('\n'));
        return;
      }

      if (text === 'ls') {
        appendOutput(state.directories.join('  '));
        return;
      }

      if (text === 'ls -l') {
        const lines = ['total 0'];
        state.directories.forEach(function (dir) {
          lines.push('drwxr-xr-x 2 jisan jisan 4096 Feb 27 10:00 ' + dir);
        });
        appendOutput(lines.join('\n'));
        return;
      }

      if (text === 'pwd') {
        appendOutput('/home/jisan' + state.currentDir);
        return;
      }

      if (text === 'whoami') {
        appendOutput('jisan');
        return;
      }

      if (text.startsWith('echo ')) {
        appendOutput(text.slice(5));
        return;
      }

      if (text === 'echo') {
        return;
      }

      if (text.startsWith('cd')) {
        const target = text.slice(2).trim();
        if (!target) {
          appendOutput('cd: missing operand');
          return;
        }

        if (target === '..') {
          state.currentDir = '';
          updatePrompt();
          return;
        }

        if (state.directories.includes(target)) {
          state.currentDir = '/' + target;
          updatePrompt();
          return;
        }

        appendOutput('cd: ' + target + ': No such file or directory');
        return;
      }

      appendOutput(
        [
          "Command '" + text + "' not found.",
          'Available commands: help, ls, ls -l, cd <dir>, pwd, whoami, echo <text>, clear, exit',
        ].join('\n')
      );
    }

    inputEl.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      handleCommand(inputEl.value);
      inputEl.value = '';
      inputEl.focus();
    });

    updatePrompt();

    return {
      reset: reset,
      focus: function () {
        inputEl.focus();
      },
    };
  }

  window.createUbuntuTerminal = createUbuntuTerminal;
})();
