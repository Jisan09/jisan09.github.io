(function () {
  const platformButtons = document.querySelectorAll('[data-platform]');
  const ubuntuSection = document.getElementById('ubuntu-sim');
  const ubuntuClose = document.querySelector('[data-ubuntu-close]');

  const ubuntuTerminalButton = document.querySelector('[data-ubuntu-terminal]');
  const ubuntuWindow = document.querySelector('[data-ubuntu-window]');
  const ubuntuBoot = document.querySelector('[data-ubuntu-boot]');
  const ubuntuDesktop = document.querySelector('[data-ubuntu-desktop]');
  const ubuntuClock = document.querySelector('[data-ubuntu-clock-toggle]');
  const ubuntuCalendar = document.querySelector('[data-ubuntu-calendar]');
  const ubuntuCalendarTitle = document.querySelector('[data-ubuntu-calendar-title]');
  const ubuntuCalendarWeek = document.querySelector('[data-ubuntu-calendar-week]');
  const ubuntuCalendarDays = document.querySelector('[data-ubuntu-calendar-days]');
  const ubuntuCalendarPrev = document.querySelector('[data-ubuntu-calendar-prev]');
  const ubuntuCalendarNext = document.querySelector('[data-ubuntu-calendar-next]');
  const ubuntuMenuToggle = document.querySelector('[data-ubuntu-menu-toggle]');
  const ubuntuMenu = document.getElementById('ubuntu-power-menu');
  const ubuntuRestart = document.querySelector('[data-ubuntu-restart]');

  const terminalCloseButton = document.querySelector('[data-terminal-close]');
  const terminalMinButton = document.querySelector('[data-terminal-minimize]');
  const terminalMaxButton = document.querySelector('[data-terminal-maximize]');
  const terminalDragHandle = document.querySelector('[data-terminal-drag-handle]');

  const terminalHistory = document.querySelector('[data-terminal-history]');
  const terminalInput = document.querySelector('[data-terminal-input]');
  const terminalDir = document.querySelector('[data-terminal-dir]');

  const pdfViewerApp = typeof window.createUbuntuPdfViewer === 'function'
    ? window.createUbuntuPdfViewer({
        dockButton: document.querySelector('[data-ubuntu-viewer]'),
        windowEl: document.querySelector('[data-pdf-window]'),
        titleEl: document.querySelector('[data-pdf-title]'),
        frameEl: document.querySelector('[data-pdf-frame]'),
        closeButton: document.querySelector('[data-pdf-close]'),
        minButton: document.querySelector('[data-pdf-minimize]'),
        maxButton: document.querySelector('[data-pdf-maximize]'),
        dragHandle: document.querySelector('[data-pdf-drag-handle]'),
        defaultDocument: {
          name: 'Md Jisan - Resume.pdf',
          href: '../assets/files/Md%20Jisan%20-%20Resume.pdf',
        },
      })
    : {
        openDocument: function () {},
        resetSession: function () {},
      };

  const filesApp = typeof window.createUbuntuFiles === 'function'
    ? window.createUbuntuFiles({
        dockButton: document.querySelector('[data-ubuntu-files]'),
        windowEl: document.querySelector('[data-files-window]'),
        closeButton: document.querySelector('[data-files-close]'),
        minButton: document.querySelector('[data-files-minimize]'),
        maxButton: document.querySelector('[data-files-maximize]'),
        dragHandle: document.querySelector('[data-files-drag-handle]'),
        onOpenFile: function (file) {
          pdfViewerApp.openDocument(file);
        },
      })
    : { resetSession: function () {} };

  const chromeApp = typeof window.createUbuntuChrome === 'function'
    ? window.createUbuntuChrome({
        dockButton: document.querySelector('[data-ubuntu-chrome]'),
        windowEl: document.querySelector('[data-chrome-window]'),
        closeButton: document.querySelector('[data-chrome-close]'),
        minButton: document.querySelector('[data-chrome-minimize]'),
        maxButton: document.querySelector('[data-chrome-maximize]'),
        dragHandle: document.querySelector('[data-chrome-drag-handle]'),
        homeButton: document.querySelector('[data-chrome-home]'),
        refreshButton: document.querySelector('[data-chrome-refresh]'),
        urlInput: document.querySelector('[data-chrome-url]'),
        frame: document.querySelector('[data-chrome-frame]'),
      })
    : { resetSession: function () {} };

  const settingsApp = typeof window.createUbuntuSettings === 'function'
    ? window.createUbuntuSettings({
        dockButton: document.querySelector('[data-ubuntu-settings]'),
        windowEl: document.querySelector('[data-settings-window]'),
        closeButton: document.querySelector('[data-settings-close]'),
        minButton: document.querySelector('[data-settings-minimize]'),
        maxButton: document.querySelector('[data-settings-maximize]'),
        dragHandle: document.querySelector('[data-settings-drag-handle]'),
        previewEl: document.querySelector('[data-settings-preview]'),
        gridEl: document.querySelector('[data-settings-grid]'),
        appRoot: document.querySelector('.ubuntu-app'),
        videoEl: document.querySelector('.ubuntu-app__video'),
      })
    : { resetSession: function () {} };

  let ubuntuTimer = null;
  let dragState = null;
  let terminalSessionActive = false;
  const calendarView = { year: 0, month: 0 };

  if (!platformButtons.length) return;

  function setTerminalRunning(running) {
    if (!ubuntuTerminalButton) return;
    ubuntuTerminalButton.classList.toggle('is-running', running);
  }

  function resetWindowInlinePosition(windowEl) {
    if (!windowEl) return;
    windowEl.style.left = '';
    windowEl.style.top = '';
    windowEl.style.width = '';
    windowEl.style.removeProperty('--ubuntu-x');
  }

  const terminal = typeof window.createUbuntuTerminal === 'function'
    ? window.createUbuntuTerminal({
        historyEl: terminalHistory,
        inputEl: terminalInput,
        dirEl: terminalDir,
        onExit: function () {
          if (ubuntuWindow) {
            ubuntuWindow.classList.add('is-hidden');
            ubuntuWindow.classList.remove('is-maximized');
          }
          terminal.reset();
          terminalSessionActive = false;
          setTerminalRunning(false);
        },
      })
    : { reset: function () {}, focus: function () {} };

  function openPowerMenu() {
    if (!ubuntuMenu || !ubuntuMenuToggle) return;
    ubuntuMenu.classList.add('is-open');
    ubuntuMenu.setAttribute('aria-hidden', 'false');
    ubuntuMenuToggle.setAttribute('aria-expanded', 'true');
  }

  function closePowerMenu() {
    if (!ubuntuMenu || !ubuntuMenuToggle) return;
    ubuntuMenu.classList.remove('is-open');
    ubuntuMenu.setAttribute('aria-hidden', 'true');
    ubuntuMenuToggle.setAttribute('aria-expanded', 'false');
  }

  function openCalendar() {
    if (!ubuntuCalendar || !ubuntuClock) return;
    ubuntuCalendar.classList.add('is-open');
    ubuntuCalendar.setAttribute('aria-hidden', 'false');
    ubuntuClock.setAttribute('aria-expanded', 'true');
  }

  function closeCalendar() {
    if (!ubuntuCalendar || !ubuntuClock) return;
    ubuntuCalendar.classList.remove('is-open');
    ubuntuCalendar.setAttribute('aria-hidden', 'true');
    ubuntuClock.setAttribute('aria-expanded', 'false');
  }

  function isCalendarOpen() {
    return !!(ubuntuCalendar && ubuntuCalendar.classList.contains('is-open'));
  }

  function getISTDateParts(date) {
    const parts = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).formatToParts(date);
    const mapped = {};
    parts.forEach(function (part) {
      if (part.type === 'day' || part.type === 'month' || part.type === 'year') {
        mapped[part.type] = Number(part.value);
      }
    });
    return { day: mapped.day, month: mapped.month, year: mapped.year };
  }

  function renderCalendar() {
    if (!ubuntuCalendarTitle || !ubuntuCalendarWeek || !ubuntuCalendarDays) return;
    const monthIndex = calendarView.month - 1;
    const first = new Date(calendarView.year, monthIndex, 1);
    const firstWeekday = first.getDay();
    const daysInMonth = new Date(calendarView.year, monthIndex + 1, 0).getDate();
    const prevMonthDays = new Date(calendarView.year, monthIndex, 0).getDate();
    const today = getISTDateParts(new Date());

    ubuntuCalendarTitle.textContent = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(first);

    if (!ubuntuCalendarWeek.children.length) {
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(function (d) {
        const el = document.createElement('div');
        el.className = 'ubuntu-calendar__weekday';
        el.textContent = d;
        ubuntuCalendarWeek.appendChild(el);
      });
    }

    ubuntuCalendarDays.textContent = '';
    for (let i = 0; i < 42; i++) {
      const cell = document.createElement('div');
      cell.className = 'ubuntu-calendar__day';
      let dayNum = 0;
      let cellMonth = calendarView.month;
      let cellYear = calendarView.year;

      if (i < firstWeekday) {
        dayNum = prevMonthDays - firstWeekday + i + 1;
        cell.classList.add('is-outside');
        cellMonth = calendarView.month - 1;
        if (cellMonth < 1) {
          cellMonth = 12;
          cellYear -= 1;
        }
      } else if (i >= firstWeekday + daysInMonth) {
        dayNum = i - (firstWeekday + daysInMonth) + 1;
        cell.classList.add('is-outside');
        cellMonth = calendarView.month + 1;
        if (cellMonth > 12) {
          cellMonth = 1;
          cellYear += 1;
        }
      } else {
        dayNum = i - firstWeekday + 1;
      }

      cell.textContent = String(dayNum);
      if (
        cellYear === today.year &&
        cellMonth === today.month &&
        dayNum === today.day
      ) {
        cell.classList.add('is-today');
      }
      ubuntuCalendarDays.appendChild(cell);
    }
  }

  function updateClockIST() {
    if (!ubuntuClock) return;
    const now = new Date();
    const datePart = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      timeZone: 'Asia/Kolkata',
    }).format(now);
    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(now);
    ubuntuClock.textContent = datePart + ' | ' + timePart;
  }

  function showUbuntu() {
    if (!ubuntuSection) return;
    ubuntuSection.classList.add('is-visible');
    ubuntuSection.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ubuntu-open');

    if (ubuntuWindow) {
      ubuntuWindow.classList.add('is-hidden');
      ubuntuWindow.classList.remove('is-maximized');
    }
    terminal.reset();
    terminalSessionActive = false;
    setTerminalRunning(false);
    filesApp.resetSession();
    pdfViewerApp.resetSession();
    chromeApp.resetSession();
    settingsApp.resetSession();
    closePowerMenu();

    if (ubuntuBoot && ubuntuDesktop) {
      ubuntuBoot.classList.add('is-active');
      ubuntuDesktop.classList.remove('is-active');
      if (ubuntuTimer) window.clearTimeout(ubuntuTimer);
      ubuntuTimer = window.setTimeout(function () {
        ubuntuBoot.classList.remove('is-active');
        ubuntuDesktop.classList.add('is-active');
      }, 2200);
    }
  }

  function hideUbuntu() {
    if (!ubuntuSection) return;
    ubuntuSection.classList.remove('is-visible');
    ubuntuSection.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ubuntu-open');

    if (ubuntuWindow) {
      ubuntuWindow.classList.add('is-hidden');
      ubuntuWindow.classList.remove('is-maximized');
    }
    terminal.reset();
    terminalSessionActive = false;
    setTerminalRunning(false);
    filesApp.resetSession();
    pdfViewerApp.resetSession();
    chromeApp.resetSession();
    settingsApp.resetSession();
    closePowerMenu();
    if (ubuntuTimer) window.clearTimeout(ubuntuTimer);
  }

  platformButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      platformButtons.forEach(function (btn) {
        btn.classList.remove('is-active');
      });
      button.classList.add('is-active');

      const key = button.dataset.platform;

      if (key === 'linux') {
        showUbuntu();
      }
    });
  });

  if (ubuntuClose) {
    ubuntuClose.addEventListener('click', function (event) {
      event.preventDefault();
      hideUbuntu();
    });
  }

  if (ubuntuTerminalButton && ubuntuWindow) {
    ubuntuTerminalButton.addEventListener('click', function () {
      const isHidden = ubuntuWindow.classList.contains('is-hidden');
      if (isHidden) {
        if (!terminalSessionActive) {
          terminal.reset();
        }
        ubuntuWindow.classList.remove('is-hidden');
        terminalSessionActive = true;
        setTerminalRunning(false);
        terminal.focus();
      } else {
        ubuntuWindow.classList.add('is-hidden');
        terminalSessionActive = true;
        setTerminalRunning(true);
      }
    });
  }

  if (terminalCloseButton && ubuntuWindow) {
    terminalCloseButton.addEventListener('click', function () {
      ubuntuWindow.classList.add('is-hidden');
      ubuntuWindow.classList.remove('is-maximized');
      terminal.reset();
      terminalSessionActive = false;
      setTerminalRunning(false);
    });
  }

  if (terminalMinButton && ubuntuWindow) {
    terminalMinButton.addEventListener('click', function () {
      ubuntuWindow.classList.add('is-hidden');
      terminalSessionActive = true;
      setTerminalRunning(true);
    });
  }

  if (terminalMaxButton && ubuntuWindow) {
    terminalMaxButton.addEventListener('click', function () {
      const willMaximize = !ubuntuWindow.classList.contains('is-maximized');
      if (willMaximize) {
        resetWindowInlinePosition(ubuntuWindow);
      }
      ubuntuWindow.classList.toggle('is-maximized');
      if (!willMaximize) {
        resetWindowInlinePosition(ubuntuWindow);
      }
      if (!ubuntuWindow.classList.contains('is-hidden')) {
        terminal.focus();
      }
    });
  }

  if (terminalDragHandle && ubuntuWindow) {
    terminalDragHandle.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      if (ubuntuWindow.classList.contains('is-maximized')) return;
      const target = event.target;
      if (target instanceof Element && target.closest('.ubuntu-window__controls')) return;

      const rect = ubuntuWindow.getBoundingClientRect();
      const offsetParent = ubuntuWindow.offsetParent;
      const parentRect = offsetParent instanceof Element
        ? offsetParent.getBoundingClientRect()
        : { left: 0, top: 0 };

      ubuntuWindow.style.left = (rect.left - parentRect.left) + 'px';
      ubuntuWindow.style.top = (rect.top - parentRect.top) + 'px';
      ubuntuWindow.style.width = rect.width + 'px';
      ubuntuWindow.style.setProperty('--ubuntu-x', '0');

      dragState = {
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };

      ubuntuWindow.classList.add('is-dragging');
      terminalDragHandle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    terminalDragHandle.addEventListener('pointermove', function (event) {
      if (!dragState || !ubuntuWindow) return;
      const offsetParent = ubuntuWindow.offsetParent;
      const parentRect = offsetParent instanceof Element
        ? offsetParent.getBoundingClientRect()
        : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      const rect = ubuntuWindow.getBoundingClientRect();
      const maxLeft = Math.max(0, parentRect.width - rect.width);
      const maxTop = Math.max(0, parentRect.height - rect.height);

      const nextLeft = Math.min(
        Math.max(0, event.clientX - parentRect.left - dragState.offsetX),
        maxLeft
      );
      const nextTop = Math.min(
        Math.max(0, event.clientY - parentRect.top - dragState.offsetY),
        maxTop
      );

      ubuntuWindow.style.left = nextLeft + 'px';
      ubuntuWindow.style.top = nextTop + 'px';
    });

    terminalDragHandle.addEventListener('pointerup', function (event) {
      if (!dragState) return;
      dragState = null;
      ubuntuWindow.classList.remove('is-dragging');
      terminalDragHandle.releasePointerCapture(event.pointerId);
    });

    terminalDragHandle.addEventListener('pointercancel', function (event) {
      if (!dragState) return;
      dragState = null;
      ubuntuWindow.classList.remove('is-dragging');
      terminalDragHandle.releasePointerCapture(event.pointerId);
    });
  }

  if (ubuntuSection) {
    ubuntuSection.addEventListener('contextmenu', function (event) {
      event.preventDefault();
    });
  }

  if (ubuntuMenuToggle) {
    ubuntuMenuToggle.addEventListener('click', function (event) {
      event.preventDefault();
      if (ubuntuMenu && ubuntuMenu.classList.contains('is-open')) {
        closePowerMenu();
      } else {
        openPowerMenu();
      }
    });
  }

  if (ubuntuClock) {
    ubuntuClock.addEventListener('click', function () {
      if (isCalendarOpen()) {
        closeCalendar();
      } else {
        closePowerMenu();
        openCalendar();
      }
    });
  }

  if (ubuntuCalendarPrev) {
    ubuntuCalendarPrev.addEventListener('click', function () {
      calendarView.month -= 1;
      if (calendarView.month < 1) {
        calendarView.month = 12;
        calendarView.year -= 1;
      }
      renderCalendar();
    });
  }

  if (ubuntuCalendarNext) {
    ubuntuCalendarNext.addEventListener('click', function () {
      calendarView.month += 1;
      if (calendarView.month > 12) {
        calendarView.month = 1;
        calendarView.year += 1;
      }
      renderCalendar();
    });
  }

  if (ubuntuRestart) {
    ubuntuRestart.addEventListener('click', function (event) {
      event.preventDefault();
      closePowerMenu();
      showUbuntu();
    });
  }

  document.addEventListener('click', function (event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (ubuntuMenu && ubuntuMenuToggle && !ubuntuMenu.contains(target) && !ubuntuMenuToggle.contains(target)) {
      closePowerMenu();
    }
    if (ubuntuCalendar && ubuntuClock && !ubuntuCalendar.contains(target) && !ubuntuClock.contains(target)) {
      closeCalendar();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closePowerMenu();
      closeCalendar();
    }
  });

  if (ubuntuClock) {
    const nowIST = getISTDateParts(new Date());
    calendarView.year = nowIST.year;
    calendarView.month = nowIST.month;
    renderCalendar();
    ubuntuClock.setAttribute('aria-expanded', 'false');
  }
  updateClockIST();
  window.setInterval(updateClockIST, 1000);
})();
