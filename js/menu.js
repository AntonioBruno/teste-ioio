/**
 * menu.js — menu responsivo (hambúrguer) para tablet e celular.
 * Acessível: aria-expanded, fecha com Esc, clique fora, clique em link ou ao voltar para desktop.
 */
const DESKTOP = window.matchMedia('(min-width: 1024px)');

export function initMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('menu-principal');
  if (!toggle || !nav) return;
  const iconUse = toggle.querySelector('use');

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    iconUse.setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  const isOpen = () => nav.classList.contains('is-open');

  toggle.addEventListener('click', () => {
    setOpen(!isOpen());
    if (isOpen()) nav.querySelector('a')?.focus();
  });

  // Fecha ao escolher um link
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  // Esc fecha e devolve o foco ao botão
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Clique fora do menu
  document.addEventListener('click', (e) => {
    if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  // Voltou para desktop -> garante menu fechado
  DESKTOP.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}
