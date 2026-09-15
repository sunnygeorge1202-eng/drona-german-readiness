(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');

  const closeNav = () => {
    document.body.classList.remove('nav-open');
    toggle?.setAttribute('aria-expanded', 'false');
    if (nav) nav.hidden = true;
  };

  const openNav = () => {
    document.body.classList.add('nav-open');
    toggle?.setAttribute('aria-expanded', 'true');
    if (nav) nav.hidden = false;
  };

  toggle?.addEventListener('click', () => {
    if (document.body.classList.contains('nav-open')) closeNav();
    else openNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  if (document.body.classList.contains('jump-contact')) {
    document.querySelector('#contact')?.scrollIntoView({ block: 'start' });
  }

  const sections = ['developer', 'programme', 'doors', 'journey', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navMap = new Map(
    Array.from(document.querySelectorAll('.site-nav a')).map((a) => [a.getAttribute('href'), a])
  );

  const markCurrent = () => {
    const y = window.scrollY + 80;
    let current = 'developer';
    sections.forEach((section) => {
      if (section.offsetTop <= y) current = section.id;
    });
    navMap.forEach((anchor, href) => {
      if (href === `#${current}`) anchor.setAttribute('aria-current', 'true');
      else anchor.removeAttribute('aria-current');
    });
  };

  markCurrent();
  window.addEventListener('scroll', markCurrent, { passive: true });

  const form = document.querySelector('form.letter[data-ajax]');
  const statusBox = document.querySelector('#form-status');
  const submit = form?.querySelector('button[type="submit"]');
  const idleLabel = submit?.textContent ?? 'Send the question';

  const showStatus = (ok, text) => {
    if (!statusBox) return;
    statusBox.hidden = false;
    statusBox.classList.toggle('form-ok', ok);
    statusBox.classList.toggle('form-bad', !ok);
    statusBox.setAttribute('role', ok ? 'status' : 'alert');
    statusBox.replaceChildren(Object.assign(document.createElement('p'), { textContent: text }));
  };

  const setBusy = (busy) => {
    if (!form || !submit) return;
    form.setAttribute('aria-busy', busy ? 'true' : 'false');
    submit.disabled = busy;
    submit.textContent = busy ? 'Sending…' : idleLabel;
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form || submit?.disabled) return;

    setBusy(true);
    showStatus(true, 'Sending the question…');

    try {
      const response = await fetch(form.getAttribute('action') || '/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: new FormData(form),
        credentials: 'same-origin',
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (response.ok && payload.ok) {
        form.reset();
        showStatus(true, 'Received. We will read it as a first question, not as a lead.');
        return;
      }

      showStatus(false, 'Something in the form was missing or invalid. Please try again.');
    } catch {
      showStatus(false, 'The message could not be sent just now. Please try again, or write to the address beside the form.');
    } finally {
      setBusy(false);
    }
  });
})();
