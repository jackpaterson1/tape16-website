(() => {
  // A hosted server resolves folder links to index.html automatically. Local
  // file previews do not, so keep folder-style navigation usable there too.
  document.addEventListener('click', event => {
    if (window.location.protocol !== 'file:' || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.download || (link.target && link.target !== '_self')) return;
    const destination = new URL(link.href);
    if (destination.protocol !== 'file:' || !destination.pathname.endsWith('/')) return;
    event.preventDefault();
    destination.pathname += 'index.html';
    window.location.assign(destination.href);
  });

  const header = document.querySelector('.emr-header');
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  const isTape16Page = /\/tape16\//.test(window.location.pathname);
  const promoExcludedPages = new Set(['account.html', 'success.html', 'cancel.html']);
  if (header && isTape16Page && !promoExcludedPages.has(pageName) && !document.querySelector('.emr-promo')) {
    const promo = document.createElement('aside');
    promo.className = 'emr-promo';
    promo.setAttribute('role', 'note');
    promo.setAttribute('aria-label', 'TAPE 16 launch price');

    const promoLink = document.createElement('a');
    promoLink.className = 'emr-promo-inner';
    promoLink.href = new URL('buy.html', window.location.href).href;
    promoLink.innerHTML = '<span class="emr-promo-kicker">50% off</span><span class="emr-promo-copy"><strong>TAPE 16 launch price:</strong> lifetime licence <b>$29 USD</b> <s>$59</s></span><span class="emr-promo-action">Get TAPE 16</span>';
    promo.appendChild(promoLink);
    header.insertAdjacentElement('afterend', promo);
  }
  const toggle = header?.querySelector('.emr-menu');
  const navigation = header?.querySelector('.emr-nav');
  function closeMenu() {
    header?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
  toggle?.addEventListener('click', () => {
    const opened = header.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(opened));
  });
  navigation?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header?.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controlledVideos = [];
  for (const button of document.querySelectorAll('[data-video-toggle]')) {
    const video = document.getElementById(button.dataset.videoToggle);
    if (!video) continue;
    controlledVideos.push(video);
    const sync = () => {
      button.textContent = video.paused ? 'Play preview' : 'Pause preview';
      button.setAttribute('aria-label', `${video.paused ? 'Play' : 'Pause'} TAPE 16 video preview`);
    };
    if (reducedMotion.matches) video.pause();
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    button.addEventListener('click', () => {
      if (video.paused) video.play().catch(sync);
      else video.pause();
    });
    sync();
  }
  reducedMotion.addEventListener('change', event => {
    if (event.matches) controlledVideos.forEach(video => video.pause());
  });
  for (const button of document.querySelectorAll('[data-preview-action]')) {
    button.addEventListener('click', () => {
      const message = document.getElementById(button.getAttribute('aria-controls'));
      if (message) {
        message.hidden = false;
        button.setAttribute('aria-expanded', 'true');
      }
    });
  }
})();
