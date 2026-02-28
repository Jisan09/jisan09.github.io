(function () {
  function createUbuntuPdfViewer(options) {
    const dockButton = options.dockButton;
    const windowEl = options.windowEl;
    const titleEl = options.titleEl;
    const frameEl = options.frameEl;
    const closeButton = options.closeButton;
    const minButton = options.minButton;
    const maxButton = options.maxButton;
    const dragHandle = options.dragHandle;
    const defaultDocument = options.defaultDocument || null;

    if (!windowEl || !titleEl || !frameEl) {
      return {
        openDocument: function () {},
        resetSession: function () {},
      };
    }

    let dragState = null;
    let sessionActive = false;

    function resetWindowInlinePosition() {
      windowEl.style.left = '';
      windowEl.style.top = '';
      windowEl.style.width = '';
      windowEl.style.removeProperty('--ubuntu-x');
    }

    function setRunning(running) {
      if (!dockButton) return;
      dockButton.classList.toggle('is-running', running);
    }

    function setVisible(visible) {
      if (!dockButton) return;
      dockButton.style.display = visible ? '' : 'none';
    }

    function openWindow() {
      setVisible(true);
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
      titleEl.textContent = 'Document Viewer';
      frameEl.removeAttribute('src');
      sessionActive = false;
      setRunning(false);
      setVisible(false);
      resetWindowInlinePosition();
    }

    if (dockButton) {
      dockButton.addEventListener('click', function () {
        const isHidden = windowEl.classList.contains('is-hidden');
        if (!sessionActive && defaultDocument && defaultDocument.href) {
          titleEl.textContent = defaultDocument.name
            ? ('Document Viewer - ' + defaultDocument.name)
            : 'Document Viewer';
          frameEl.src = defaultDocument.href;
          openWindow();
          return;
        }
        if (isHidden) {
          openWindow();
        } else {
          minimizeWindow();
        }
      });
    }

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

    setVisible(false);
    setRunning(false);

    return {
      openDocument: function (file) {
        if (!file || !file.href) return;
        titleEl.textContent = file.name ? ('Document Viewer - ' + file.name) : 'Document Viewer';
        frameEl.src = file.href;
        openWindow();
      },
      resetSession: function () {
        closeWindow();
      },
    };
  }

  window.createUbuntuPdfViewer = createUbuntuPdfViewer;
})();
