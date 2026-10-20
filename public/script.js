// Progressive enhancement: content stays visible when JavaScript is unavailable.
const header = document.querySelector('.nav');
const menu = document.querySelector('.menu');
const navigation = document.querySelector('#main-navigation');
const mobileQuery = window.matchMedia('(max-width: 760px)');

function setMenuOpen(open, restoreFocus = false) {
  if (!mobileQuery.matches) open = false;
  header.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  navigation.inert = mobileQuery.matches && !open;
  if (restoreFocus) menu.focus();
}
setMenuOpen(false);
menu.addEventListener('click', () => {
  const open = !header.classList.contains('open');
  setMenuOpen(open);
  if (open) navigation.querySelector('a')?.focus();
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
mobileQuery.addEventListener('change', () => setMenuOpen(false));
document.addEventListener('keydown', event => {
  if (!header.classList.contains('open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    setMenuOpen(false, true);
  }
  if (event.key === 'Tab') {
    const items = [...navigation.querySelectorAll('a'), menu];
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08 });
  reveals.forEach(element => observer.observe(element));
  document.documentElement.classList.add('motion-ready');
} else {
  reveals.forEach(element => element.classList.add('visible'));
}


// Contact form for Cloudflare Pages: Form.taxi delivers letters to an email inbox.
// Never place the author's private email or password into site files.
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  const submitButton = contactForm.querySelector('[type="submit"]');
  const status = document.getElementById('form-status');
  const endpoint = String(window.KARINA_SITE_CONFIG?.formTaxiEndpoint || '').trim();
  const ready = /^https:\/\/form\.taxi\/s\/[a-zA-Z0-9_-]+$/.test(endpoint);
  // The HTML form already has a valid action for no-JavaScript fallback.
  // With JS enabled, Form.taxi JSON responses allow an on-site thank-you page.
  if (ready) {
    contactForm.action = endpoint;
  }
  contactForm.addEventListener('submit', async event => {
    if (!ready) return; // Native POST fallback.
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    if (contactForm.querySelector('[name="_gotcha"]')?.value) return;
    submitButton.disabled = true;
    status.textContent = 'Надсилаю повідомлення…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) {
        throw new Error('Form.taxi did not confirm delivery');
      }
      window.location.assign('thank-you.html');
    } catch {
      status.textContent = 'Сервіс не підтвердив надсилання листа. Перевірте вхідні повідомлення перед повторною спробою або зачекайте й спробуйте пізніше.';
      submitButton.disabled = false;
    }
  });
}
