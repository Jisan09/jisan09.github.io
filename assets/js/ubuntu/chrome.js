(function () {
  function createUbuntuChrome(options) {
    const dockButton = options.dockButton;
    const windowEl = options.windowEl;
    const closeButton = options.closeButton;
    const minButton = options.minButton;
    const maxButton = options.maxButton;
    const dragHandle = options.dragHandle;
    const homeButton = options.homeButton;
    const refreshButton = options.refreshButton;
    const urlInput = options.urlInput;
    const frame = options.frame;

    const homeUrl = 'https://www.google.com/webhp?igu=1';
    let sessionActive = false;
    let dragState = null;

    if (!dockButton || !windowEl || !urlInput || !frame) {
      return {
        resetSession: function () {},
      };
    }

    function setRunning(running) {
      dockButton.classList.toggle('is-running', running);
    }

    function resetWindowInlinePosition() {
      windowEl.style.left = '';
      windowEl.style.top = '';
      windowEl.style.width = '';
      windowEl.style.removeProperty('--ubuntu-x');
    }

    function normalizeUrl(value) {
      const raw = value.trim();
      if (!raw) return homeUrl;
      if (/^https?:\/\//i.test(raw)) return raw;
      return 'https://' + raw;
    }

    function load(url) {
      const next = normalizeUrl(url);
      urlInput.value = next;
      frame.src = next;
    }

    function resetView() {
      load(homeUrl);
    }

    function openWindow() {
      if (!sessionActive) {
        resetView();
      }
      windowEl.classList.remove('is-hidden');
      sessionActive = true;
      setRunning(false);
      urlInput.focus();
    }

    function minimizeWindow() {
      windowEl.classList.add('is-hidden');
      sessionActive = true;
      setRunning(true);
    }

    function closeWindow() {
      windowEl.classList.add('is-hidden');
      windowEl.classList.remove('is-maximized');
      resetView();
      sessionActive = false;
      setRunning(false);
      resetWindowInlinePosition();
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
        if (!windowEl.classList.contains('is-hidden')) {
          urlInput.focus();
        }
      });
    }

    if (homeButton) {
      homeButton.addEventListener('click', function () {
        resetView();
      });
    }

    if (refreshButton) {
      refreshButton.addEventListener('click', function () {
        if (frame.src) {
          frame.src = frame.src;
        } else {
          resetView();
        }
      });
    }

    urlInput.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      load(urlInput.value);
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

    resetView();
    setRunning(false);

    return {
      resetSession: function () {
        closeWindow();
      },
    };
  }

  window.createUbuntuChrome = createUbuntuChrome;
})();
