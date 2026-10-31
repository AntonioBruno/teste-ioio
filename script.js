/**
 * script.js — ponto de entrada do site Bolos + Delícias da Ioiô.
 * Cada funcionalidade vive em um módulo em ./js/ (ES modules, sem dependências externas).
 *
 *  config.js      dados do negócio e chaves (modo de validação, Pix, sinal)
 *  store.js       estado do carrinho
 *  catalog.js     produtos + seleção (filtros, "adicionar ao pedido")
 *  calculator.js  total, sinal e saldo restante (em centavos)
 *  whatsapp.js    links wa.me e mensagens do pedido/comprovante
 *  order.js       formulário de encomendas, validação e resumo
 *  pix.js         QR Code Pix fixo após confirmação do orçamento (conferência manual)
 *  menu.js        menu responsivo
 *  navigation.js  navegação entre seções e link ativo
 */
import { CONFIG } from './js/config.js';
import { initWhatsAppLinks } from './js/whatsapp.js';
import { initMenu } from './js/menu.js';
import { initNavigation } from './js/navigation.js';
import { initCatalog } from './js/catalog.js';
import { initOrder } from './js/order.js';
import { initPix } from './js/pix.js';
import { escapeHTML } from './js/utils.js';

/** Preenche contatos do rodapé a partir do config (fonte única dos dados). */
function fillBusinessData() {
  const { whatsappExibicao, instagram, cidade } = CONFIG.negocio;
  document.querySelectorAll('[data-fill="telefone"]').forEach((el) => { el.textContent = whatsappExibicao; });
  document.querySelectorAll('[data-fill="cidade"]').forEach((el) => { el.textContent = cidade; });
  document.querySelectorAll('[data-fill="instagram"]').forEach((el) => {
    el.textContent = `@${instagram}`;
    el.href = `https://www.instagram.com/${instagram}/`;
  });
  document.getElementById('year').textContent = new Date().getFullYear();
}

/** Depoimentos: só aparecem se houver depoimentos reais cadastrados no config. */
function renderTestimonials() {
  const list = CONFIG.depoimentos ?? [];
  if (!list.length) return;
  document.getElementById('testimonials-list').innerHTML = list
    .map((d) => `<li class="card testimonial"><blockquote>“${escapeHTML(d.texto)}”</blockquote><cite>${escapeHTML(d.autor)}</cite></li>`)
    .join('');
  document.getElementById('depoimentos').hidden = false;
}

function init() {
  document.getElementById('test-ribbon').hidden = !CONFIG.modoValidacao;
  fillBusinessData();
  initWhatsAppLinks();
  initMenu();
  initCatalog();
  initNavigation();
  initPix();
  initOrder();
  renderTestimonials();
}

init();
