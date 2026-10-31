/**
 * catalog.js — dados dos produtos + renderização da lista selecionável.
 *
 * ⚠️ CARDÁPIO PROVISÓRIO: nomes montados a partir das fotos do pacote de assets.
 *    Preços = null (não inventamos valores). Confirmar itens, sabores, tamanhos e preços com a cliente.
 *    Para definir um preço real: precoCentavos: 8990  (= R$ 89,90).
 */
import { CONFIG } from './config.js';
import { cart } from './store.js';
import { formatBRL, escapeHTML } from './utils.js';

// new URL(..., import.meta.url) faz o Vite incluir as imagens no build e também funciona sem Vite.
const img = (path) => new URL(`../assets/${path}`, import.meta.url).href;

export const CATEGORIES = {
  'bolos-caseiros': { label: 'Bolos caseiros', group: 'bolos' },
  'bolos-decorados': { label: 'Bolos decorados', group: 'bolos' },
  docinhos: { label: 'Docinhos e sobremesas', group: 'docinhos' },
  salgados: { label: 'Salgados', group: 'salgados' },
};

/** tipo: 'bolo' (vendido por unidade, tamanho a combinar) | 'unidade' (docinhos/salgados por unidade). */
export const PRODUCTS = [
  { id: 'bolo-caseiro', categoria: 'bolos-caseiros', tipo: 'bolo', nome: 'Bolo caseiro', descricao: 'Massa fofinha e caseira. Sabor a combinar.', imagem: img('bolos/categoria-bolos-caseiros.jpg'), alt: 'Bolo caseiro com fatia cortada', precoCentavos: null },
  { id: 'bolo-marmore', categoria: 'bolos-caseiros', tipo: 'bolo', nome: 'Bolo mármore', descricao: 'Massa mesclada, tradicional e caseira.', imagem: img('bolos/bolo-marmore.jpg'), alt: 'Bolo mármore com calda de chocolate', precoCentavos: null },
  { id: 'bolo-morango', categoria: 'bolos-decorados', tipo: 'bolo', nome: 'Bolo decorado com morangos', descricao: 'Chantilly e morangos. Tamanho a combinar.', imagem: img('bolos/bolo-morango.jpg'), alt: 'Bolo decorado com chantilly e morangos', precoCentavos: null },
  { id: 'bolo-personalizado', categoria: 'bolos-decorados', tipo: 'bolo', nome: 'Bolo decorado personalizado', descricao: 'Decoração conforme o tema da sua festa.', imagem: img('bolos/categoria-bolos-decorados.jpg'), alt: 'Bolo decorado com confeitos rosa', precoCentavos: null },
  { id: 'brigadeiro', categoria: 'docinhos', tipo: 'unidade', nome: 'Brigadeiro', descricao: 'O clássico que não pode faltar.', imagem: img('docinhos/brigadeiro.jpg'), alt: 'Brigadeiros em forminhas', precoCentavos: null },
  { id: 'docinhos-sortidos', categoria: 'docinhos', tipo: 'unidade', nome: 'Docinhos sortidos', descricao: 'Seleção para festas. Sabores a combinar.', imagem: img('docinhos/categoria-docinhos.jpg'), alt: 'Docinhos sortidos em forminhas', precoCentavos: null },
  { id: 'salgados-sortidos', categoria: 'salgados', tipo: 'unidade', nome: 'Salgadinhos sortidos', descricao: 'Para festas e eventos. Sabores a combinar.', imagem: img('salgados/categoria-salgados.jpg'), alt: 'Salgadinhos assados sortidos', precoCentavos: null },
  { id: 'mini-salgado', categoria: 'salgados', tipo: 'unidade', nome: 'Mini salgado assado', descricao: 'Assado e decorado. Recheio a combinar.', imagem: img('salgados/salgadinho.jpg'), alt: 'Mini salgado assado decorado com tomate', precoCentavos: null },
];

export const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

/**
 * Preço unitário efetivo em centavos.
 * Real (definido acima) > fictício de teste (só em modoValidacao) > null ("sob consulta").
 */
export function unitPrice(product) {
  if (Number.isInteger(product.precoCentavos)) return product.precoCentavos;
  if (CONFIG.modoValidacao) {
    return product.tipo === 'bolo' ? CONFIG.teste.precoBoloCentavos : CONFIG.teste.precoUnidadeCentavos;
  }
  return null;
}

/** true quando o preço exibido é o fictício de teste. */
export const isTestPrice = (product) => !Number.isInteger(product.precoCentavos) && CONFIG.modoValidacao;

/* ---------------- Renderização ---------------- */

let currentFilter = 'todos';
let grid;
let liveRegion;

function priceHTML(product) {
  const price = unitPrice(product);
  if (price == null) return 'Valor sob consulta';
  const unit = product.tipo === 'bolo' ? 'un.' : 'unid.';
  const testNote = isTestPrice(product) ? '<small>valor fictício de teste</small>' : '';
  return `${formatBRL(price)} <span>/ ${unit}</span>${testNote}`;
}

function cardHTML(p) {
  const qty = cart.qty(p.id);
  const label = qty ? `Adicionar mais (${qty} no pedido)` : 'Adicionar ao pedido';
  return `
    <li>
      <article class="product-card${qty ? ' is-selected' : ''}" data-id="${p.id}">
        <img src="${p.imagem}" alt="${escapeHTML(p.alt)}" width="400" height="400" loading="lazy" />
        <div class="product-card__body">
          <span class="product-card__cat">${escapeHTML(CATEGORIES[p.categoria].label)}</span>
          <h4 class="product-card__name">${escapeHTML(p.nome)}</h4>
          <p class="product-card__desc">${escapeHTML(p.descricao)}</p>
          <p class="product-card__price">${priceHTML(p)}</p>
          <button type="button" class="btn btn--primary btn--sm" data-add="${p.id}" aria-label="${escapeHTML(label)}: ${escapeHTML(p.nome)}">
            <svg class="icon icon--sm" aria-hidden="true"><use href="#i-${qty ? 'check' : 'plus'}"></use></svg>
            ${label}
          </button>
        </div>
      </article>
    </li>`;
}

function matches(product, filter) {
  if (filter === 'todos') return true;
  return product.categoria === filter || CATEGORIES[product.categoria].group === filter;
}

function render() {
  grid.innerHTML = PRODUCTS.filter((p) => matches(p, currentFilter)).map(cardHTML).join('');
}

/** Atualiza os chips de filtro (destaca o grupo quando o filtro é uma categoria específica). */
function syncChips() {
  const group = CATEGORIES[currentFilter]?.group ?? currentFilter;
  document.querySelectorAll('.filters .chip').forEach((chip) => {
    const active = chip.dataset.filter === group;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
}

/** Aplica um filtro ('todos' | grupo | categoria) e, opcionalmente, leva o usuário até a lista. */
export function setFilter(filter, { scroll = false } = {}) {
  currentFilter = filter in CATEGORIES || ['todos', 'bolos', 'docinhos', 'salgados'].includes(filter) ? filter : 'todos';
  syncChips();
  render();
  const title = document.getElementById('produtos-title');
  title.textContent = CATEGORIES[currentFilter]?.label ?? 'Escolha seus produtos';
  if (scroll) {
    const panel = document.getElementById('produtos');
    panel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    panel.focus({ preventScroll: true });
  }
}

export function initCatalog() {
  grid = document.getElementById('product-grid');
  liveRegion = document.createElement('p');
  liveRegion.className = 'sr-only';
  liveRegion.setAttribute('aria-live', 'polite');
  grid.after(liveRegion);

  // "Conhecer opções" nos cards de categoria
  document.querySelectorAll('[data-category]').forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.category, { scroll: true }));
  });

  // Chips de filtro
  document.querySelector('.filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) setFilter(chip.dataset.filter);
  });

  // Adicionar ao pedido (delegação de eventos)
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const id = btn.dataset.add;
    cart.add(id, 1);
    liveRegion.textContent = `${findProduct(id).nome} adicionado ao pedido. Quantidade: ${cart.qty(id)}.`;
    // devolve o foco ao botão recriado
    grid.querySelector(`[data-add="${id}"]`)?.focus();
  });

  cart.onChange(render);
  render();
}
