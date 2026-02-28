(function () {
  function createUbuntuSettings(options) {
    const dockButton = options.dockButton;
    const windowEl = options.windowEl;
    const closeButton = options.closeButton;
    const minButton = options.minButton;
    const maxButton = options.maxButton;
    const dragHandle = options.dragHandle;
    const previewEl = options.previewEl;
    const gridEl = options.gridEl;
    const appRoot = options.appRoot;
    const videoEl = options.videoEl;

    if (!dockButton || !windowEl || !previewEl || !gridEl || !appRoot || !videoEl) {
      return {
        resetSession: function () {},
      };
    }

    let wallpapers = [
      {
        name: 'Nobel Numbat Transparent',
        path: '../assets/files/ubuntu/wallpapers/nobel_numbat_transparent.mp4',
      },
    ];

    let sessionActive = false;
    let dragState = null;
    let currentPath = wallpapers[0] ? wallpapers[0].path : '';

    function setRunning(running) {
      dockButton.classList.toggle('is-running', running);
    }

    function resetWindowInlinePosition() {
      windowEl.style.left = '';
      windowEl.style.top = '';
      windowEl.style.width = '';
      windowEl.style.removeProperty('--ubuntu-x');
    }

    function isVideo(path) {
      return /\.(mp4|webm|ogg)$/i.test(path);
    }

    function renderTiles() {
      gridEl.textContent = '';
      wallpapers.forEach(function (wp) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ubuntu-settings__item';
        button.dataset.path = wp.path;
        if (isVideo(wp.path)) {
          button.classList.add('is-video');
          const video = document.createElement('video');
          video.className = 'ubuntu-settings__tile-video';
          video.src = wp.path;
          video.muted = true;
          video.loop = true;
          video.autoplay = true;
          video.playsInline = true;
          button.appendChild(video);
        } else {
          button.style.backgroundImage = 'url(' + wp.path + ')';
        }
        const label = document.createElement('span');
        label.className = 'ubuntu-settings__item-label';
        label.textContent = wp.name;
        button.appendChild(label);
        if (wp.path === currentPath) button.classList.add('is-active');
        button.addEventListener('click', function () {
          applyWallpaper(wp.path, wp.name);
          renderTiles();
        });
        gridEl.appendChild(button);
      });
    }

    function applyWallpaper(path, label) {
      if (!path) return;
      currentPath = path;
      previewEl.dataset.label = label;
      previewEl.textContent = '';

      if (isVideo(path)) {
        const previewVideo = document.createElement('video');
        previewVideo.className = 'ubuntu-settings__preview-media';
        previewVideo.src = path;
        previewVideo.muted = true;
        previewVideo.loop = true;
        previewVideo.autoplay = true;
        previewVideo.playsInline = true;
        previewEl.appendChild(previewVideo);

        appRoot.style.backgroundImage = '';
        videoEl.style.display = '';
        if (videoEl.src !== path) {
          videoEl.src = path;
        }
        videoEl.load();
        const playAttempt = videoEl.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(function () {});
        }
      } else {
        previewEl.style.backgroundImage = 'url(' + path + ')';

        videoEl.pause();
        videoEl.style.display = 'none';
        appRoot.style.backgroundImage = 'url(' + path + ')';
        appRoot.style.backgroundSize = 'cover';
        appRoot.style.backgroundPosition = 'center';
      }
    }

    function loadManifest() {
      return fetch('../assets/files/ubuntu/wallpapers/wallpapers.json', { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('manifest missing');
          return res.json();
        })
        .then(function (list) {
          if (!Array.isArray(list) || !list.length) return;
          wallpapers = list.filter(function (item) {
            return item && typeof item.path === 'string' && item.path.trim().length > 0;
          }).map(function (item, index) {
            return {
              name: item.name || ('Wallpaper ' + (index + 1)),
              path: item.path,
            };
          });
          if (wallpapers.length && !wallpapers.some(function (w) { return w.path === currentPath; })) {
            currentPath = wallpapers[0].path;
          }
        })
        .catch(function () {});
    }

    function openWindow() {
      windowEl.classList.remove('is-hidden');
      sessionActive = true;
      setRunning(false);
      renderTiles();
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

    loadManifest().then(function () {
      const selected = wallpapers.find(function (w) { return w.path === currentPath; }) || wallpapers[0];
      if (selected) {
        applyWallpaper(selected.path, selected.name);
      }
      renderTiles();
    });

    return {
      resetSession: function () {
        closeWindow();
      },
    };
  }

  window.createUbuntuSettings = createUbuntuSettings;
})();
