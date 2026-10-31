/**
 * navigation.js — navegação entre seções.
 *  - Links com data-filter (Nossos bolos / Docinhos / Salgados) filtram o catálogo e rolam até ele.
 *  - Destaque do link ativo no menu conforme a seção visível (IntersectionObserver).
 *  - Sombra no cabeçalho ao rolar.
 * A rolagem suave em si é feita via CSS (scroll-behavior) + scroll-margin-top.
 */
import { setFilter } from './catalog.js';

export function initNavigation() {
  // Links que levam ao catálogo já filtrado
  document.querySelectorAll('a[data-filter]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setFilter(link.dataset.filter, { scroll: true });
      history.replaceState(null, '', '#catalogo');
    });
  });

  // Link ativo conforme a seção na tela
  const navLinks = [...document.querySelectorAll('.main-nav__list a')];
  const byId = (id) => navLinks.filter((a) => a.getAttribute('href') === `#${id}` && !a.dataset.filter);
  const sections = ['inicio', 'catalogo', 'encomendas', 'contato']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove('is-active'));
        const target = entry.target.id === 'catalogo'
          ? navLinks.find((a) => a.dataset.filter === 'bolos')
          : byId(entry.target.id)[0];
        target?.classList.add('is-active');
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => observer.observe(s));

  // Sombra do cabeçalho
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
