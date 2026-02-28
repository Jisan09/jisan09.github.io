(function () {
  function createUbuntuFiles(options) {
    const dockButton = options.dockButton;
    const windowEl = options.windowEl;
    const closeButton = options.closeButton;
    const minButton = options.minButton;
    const maxButton = options.maxButton;
    const dragHandle = options.dragHandle;

    if (!dockButton || !windowEl) {
      return { resetSession: function () {} };
    }

    const pathButton = windowEl.querySelector('[data-files-path]');
    const backButton = windowEl.querySelector('[data-files-back]');
    const forwardButton = windowEl.querySelector('[data-files-forward]');
    const gridEl = windowEl.querySelector('[data-files-grid]');
    const sidebarFolderButtons = Array.from(
      windowEl.querySelectorAll('.ubuntu-files__sidebar button[data-folder]')
    );
    const folderIcons = {
      default: '../assets/files/ubuntu/filemanager/folder.png',
      Home: '../assets/files/ubuntu/filemanager/user-home.png',
      Desktop: '../assets/files/ubuntu/filemanager/user-desktop.png',
      Documents: '../assets/files/ubuntu/filemanager/folder-documents.png',
      Downloads: '../assets/files/ubuntu/filemanager/folder-download.png',
      Music: '../assets/files/ubuntu/filemanager/folder-music.png',
      Pictures: '../assets/files/ubuntu/filemanager/folder-pictures.png',
      Videos: '../assets/files/ubuntu/filemanager/folder-videos.png',
    };

    const fileSystem = {
      Home: [
        { type: 'folder', name: 'Desktop' },
        { type: 'folder', name: 'Documents' },
        { type: 'folder', name: 'Downloads' },
        { type: 'folder', name: 'Music' },
        { type: 'folder', name: 'Pictures' },
        { type: 'folder', name: 'Videos' },
      ],
      Desktop: [],
      Documents: [
        {
          type: 'file',
          name: 'Md Jisan - Resume.pdf',
          href: '../assets/files/Md%20Jisan%20-%20Resume.pdf',
          icon: '../assets/files/ubuntu/filemanager/application-pdf.png',
        },
      ],
      Downloads: [],
      Music: [],
      Pictures: [],
      Videos: [],
    };

    let sessionActive = false;
    let dragState = null;
    let currentFolder = 'Home';
    let history = ['Home'];
    let historyIndex = 0;

    function setRunning(running) {
      dockButton.classList.toggle('is-running', running);
    }

    function resetWindowInlinePosition() {
      windowEl.style.left = '';
      windowEl.style.top = '';
      windowEl.style.width = '';
      windowEl.style.removeProperty('--ubuntu-x');
    }

    function updateNavButtons() {
      if (backButton) {
        backButton.disabled = historyIndex <= 0;
      }
      if (forwardButton) {
        forwardButton.disabled = historyIndex >= history.length - 1;
      }
    }

    function getFolderIcon(folderName) {
      return folderIcons[folderName] || folderIcons.default;
    }

    function applySidebarIcons() {
      sidebarFolderButtons.forEach(function (button) {
        if (button.dataset.iconReady === 'true') return;
        const folderName = button.getAttribute('data-folder') || '';
        const icon = document.createElement('img');
        icon.className = 'ubuntu-files__side-icon';
        icon.src = getFolderIcon(folderName);
        icon.alt = '';
        icon.setAttribute('aria-hidden', 'true');
        button.prepend(icon);
        button.dataset.iconReady = 'true';
      });
    }

    function renderGrid(folderName) {
      if (!gridEl) return;
      const items = fileSystem[folderName] || [];
      gridEl.textContent = '';

      items.forEach(function (item) {
        const itemButton = document.createElement('button');
        itemButton.className = 'ubuntu-files__item';
        itemButton.type = 'button';
        itemButton.setAttribute('data-kind', item.type);

        let icon;
        if (item.type === 'folder') {
          icon = document.createElement('img');
          icon.className = 'ubuntu-files__folder-img';
          icon.src = getFolderIcon(item.name);
          icon.alt = '';
          icon.setAttribute('aria-hidden', 'true');
        } else if (item.type === 'file' && item.icon) {
          icon = document.createElement('img');
          icon.className = 'ubuntu-files__file-img';
          icon.src = item.icon;
          icon.alt = '';
          icon.setAttribute('aria-hidden', 'true');
        } else {
          icon = document.createElement('span');
          icon.className = 'ubuntu-files__file';
        }
        const label = document.createElement('span');
        label.textContent = item.name;

        itemButton.appendChild(icon);
        itemButton.appendChild(label);

        if (item.type === 'folder') {
          itemButton.setAttribute('data-folder', item.name);
          itemButton.addEventListener('click', function () {
            navigateTo(item.name);
          });
        } else if (item.type === 'file' && item.href) {
          itemButton.addEventListener('click', function () {
            if (typeof options.onOpenFile === 'function') {
              options.onOpenFile(item);
              return;
            }
            window.location.href = item.href;
          });
        }

        gridEl.appendChild(itemButton);
      });
    }

    function setCurrentFolder(folderName) {
      if (!folderName || !fileSystem[folderName]) return;
      currentFolder = folderName;

      if (pathButton) {
        pathButton.textContent = folderName;
      }

      sidebarFolderButtons.forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute('data-folder') === folderName);
      });

      renderGrid(folderName);
      updateNavButtons();
    }

    function navigateTo(folderName, fromHistory) {
      if (!fileSystem[folderName]) return;

      if (!fromHistory) {
        history = history.slice(0, historyIndex + 1);
        history.push(folderName);
        historyIndex = history.length - 1;
      }

      setCurrentFolder(folderName);
    }

    function resetContent() {
      history = ['Home'];
      historyIndex = 0;
      setCurrentFolder('Home');
    }

    function openWindow() {
      if (!sessionActive) {
        resetContent();
      }
      windowEl.classList.remove('is-hidden');
      sessionActive = true;
      setRunning(false);
    }

    function minimizeWindow() {
      windowEl.classList.add('is-hidden');
      sessionActive = true;
      setRunning(true);
    }

    function closeWindow() {
      windowEl.classList.add('is-hidden');
      windowEl.classList.remove('is-maximized');
      sessionActive = false;
      setRunning(false);
      resetWindowInlinePosition();
      resetContent();
    }

    dockButton.addEventListener('click', function () {
      const isHidden = windowEl.classList.contains('is-hidden');
      if (isHidden) {
        openWindow();
      } else {
        minimizeWindow();
      }
    });

    if (closeButton) {
      closeButton.addEventListener('click', function () {
        closeWindow();
      });
    }

    if (minButton) {
      minButton.addEventListener('click', function () {
        minimizeWindow();
      });
    }

    if (maxButton) {
      maxButton.addEventListener('click', function () {
        const willMaximize = !windowEl.classList.contains('is-maximized');
        if (willMaximize) {
          resetWindowInlinePosition();
        }
        windowEl.classList.toggle('is-maximized');
        if (!willMaximize) {
          resetWindowInlinePosition();
        }
      });
    }

    if (backButton) {
      backButton.addEventListener('click', function () {
        if (historyIndex <= 0) return;
        historyIndex -= 1;
        navigateTo(history[historyIndex], true);
      });
    }

    if (forwardButton) {
      forwardButton.addEventListener('click', function () {
        if (historyIndex >= history.length - 1) return;
        historyIndex += 1;
        navigateTo(history[historyIndex], true);
      });
    }

    if (pathButton) {
      pathButton.addEventListener('click', function () {
        if (currentFolder === 'Home') return;
        navigateTo('Home');
      });
    }

    sidebarFolderButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const folderName = button.getAttribute('data-folder');
        navigateTo(folderName);
      });
    });

    if (dragHandle) {
      dragHandle.addEventListener('pointerdown', function (event) {
        if (event.button !== 0) return;
        if (windowEl.classList.contains('is-maximized')) return;
        const target = event.target;
        if (target instanceof Element && target.closest('.ubuntu-window__controls')) return;

        const rect = windowEl.getBoundingClientRect();
        const offsetParent = windowEl.offsetParent;
        const parentRect = offsetParent instanceof Element
          ? offsetParent.getBoundingClientRect()
          : { left: 0, top: 0 };

        windowEl.style.left = (rect.left - parentRect.left) + 'px';
        windowEl.style.top = (rect.top - parentRect.top) + 'px';
        windowEl.style.width = rect.width + 'px';
        windowEl.style.setProperty('--ubuntu-x', '0');

        dragState = {
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top,
        };

        windowEl.classList.add('is-dragging');
        dragHandle.setPointerCapture(event.pointerId);
        event.preventDefault();
      });

      dragHandle.addEventListener('pointermove', function (event) {
        if (!dragState) return;

        const offsetParent = windowEl.offsetParent;
        const parentRect = offsetParent instanceof Element
          ? offsetParent.getBoundingClientRect()
          : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const rect = windowEl.getBoundingClientRect();

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

        windowEl.style.left = nextLeft + 'px';
        windowEl.style.top = nextTop + 'px';
      });

      dragHandle.addEventListener('pointerup', function (event) {
        if (!dragState) return;
        dragState = null;
        windowEl.classList.remove('is-dragging');
        dragHandle.releasePointerCapture(event.pointerId);
      });

      dragHandle.addEventListener('pointercancel', function (event) {
        if (!dragState) return;
        dragState = null;
        windowEl.classList.remove('is-dragging');
        dragHandle.releasePointerCapture(event.pointerId);
      });
    }

    resetContent();
    applySidebarIcons();
    setRunning(false);

    return {
      resetSession: function () {
        closeWindow();
      },
    };
  }

  window.createUbuntuFiles = createUbuntuFiles;
})();
