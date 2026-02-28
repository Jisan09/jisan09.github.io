(function () {
  function createUbuntuTrash(options) {
    const dockButton = options.dockButton;
    const windowEl = options.windowEl;
    const closeButton = options.closeButton;
    const minButton = options.minButton;
    const maxButton = options.maxButton;
    const dragHandle = options.dragHandle;
    const resumeItem = windowEl.querySelector('[data-trash-open-resume]');
    const trashItems = Array.from(windowEl.querySelectorAll('.ubuntu-trash__item'));
    const audioMap = {
      want_to_hire: '../assets/files/ubuntu/audio/wow.mp3',
      dont_want_to_hire: '../assets/files/ubuntu/audio/meow.mp3',
    };
    let currentAudio = null;

    if (!dockButton || !windowEl) {
      return { resetSession: function () {} };
    }

    let sessionActive = false;
    let dragState = null;

    function setRunning(running) {
      dockButton.classList.toggle('is-running', running);
    }

    function resetWindowInlinePosition() {
      windowEl.style.left = '';
      windowEl.style.top = '';
      windowEl.style.width = '';
      windowEl.style.removeProperty('--ubuntu-x');
    }

    function openWindow() {
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
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
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
      });
    }

    if (resumeItem) {
      resumeItem.addEventListener('click', function () {
        if (typeof options.onOpenFile === 'function') {
          options.onOpenFile({
            name: 'resume_v1_final',
            href: '../assets/files/Md%20Jisan%20-%20Resume.pdf',
          });
        }
      });
    }

    trashItems.forEach(function (item) {
      item.addEventListener('click', function () {
        trashItems.forEach(function (node) {
          node.classList.remove('is-selected');
        });
        item.classList.add('is-selected');

        if (item === resumeItem) return;
        const audioKey = item.getAttribute('data-trash-audio');
        if (audioKey && audioMap[audioKey]) {
          if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
          }
          currentAudio = new Audio(audioMap[audioKey]);
          const playPromise = currentAudio.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        }
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

    setRunning(false);

    return {
      resetSession: function () {
        closeWindow();
      },
    };
  }

  window.createUbuntuTrash = createUbuntuTrash;
})();
