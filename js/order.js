/**
 * order.js — formulário de encomendas: itens, validação, resumo de valores e envio ao WhatsApp.
 */
import { CONFIG } from './config.js';
import { cart } from './store.js';
import { PRODUCTS, CATEGORIES, findProduct, unitPrice, isTestPrice } from './catalog.js';
import { calculate } from './calculator.js';
import { buildOrderMessage, openWhatsApp } from './whatsapp.js';
import { showPaymentStep } from './pix.js';
import { formatBRL, maskPhone, isValidPhone, isoDateFromToday, orderCode, escapeHTML } from './utils.js';

let $;

/* ---------- Itens do pedido ---------- */

function renderCart() {
  const items = cart.list();
  $.cartEmpty.hidden = items.length > 0;
  $.cart.innerHTML = items
    .map(({ id, qty }) => {
      const p = findProduct(id);
      const unit = unitPrice(p);
      const priceText = unit == null ? 'Valor sob consulta' : `${formatBRL(unit)} cada${isTestPrice(p) ? ' (teste)' : ''}`;
      return `
      <li class="cart-item" data-id="${id}">
        <img src="${p.imagem}" alt="" />
        <span class="cart-item__name">${escapeHTML(p.nome)}<span class="cart-item__price">${priceText}</span></span>
        <span class="qty">
          <button type="button" data-step="-1" aria-label="Diminuir quantidade de ${escapeHTML(p.nome)}"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-minus"></use></svg></button>
          <input type="number" min="1" max="999" inputmode="numeric" value="${qty}" aria-label="Quantidade de ${escapeHTML(p.nome)}" />
          <button type="button" data-step="1" aria-label="Aumentar quantidade de ${escapeHTML(p.nome)}"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-plus"></use></svg></button>
        </span>
        <button type="button" class="icon-btn" data-remove aria-label="Remover ${escapeHTML(p.nome)} do pedido"><svg class="icon" aria-hidden="true"><use href="#i-trash"></use></svg></button>
      </li>`;
    })
    .join('');
  if (items.length) $.cartError.hidden = true;
}

function bindCartEvents() {
  $.cart.addEventListener('click', (e) => {
    const li = e.target.closest('.cart-item');
    if (!li) return;
    const id = li.dataset.id;
    const step = e.target.closest('[data-step]');
    if (step) {
      const next = cart.qty(id) + Number(step.dataset.step);
      if (next >= 1) cart.set(id, next); // mínimo 1 pelo stepper; remover é pela lixeira
      $.cart.querySelector(`[data-id="${id}"] [data-step="${step.dataset.step}"]`)?.focus();
    }
    if (e.target.closest('[data-remove]')) {
      cart.remove(id);
      $.quickSelect.focus();
    }
  });
  // digitação direta da quantidade
  $.cart.addEventListener('change', (e) => {
    if (e.target.matches('input[type="number"]')) {
      const id = e.target.closest('.cart-item').dataset.id;
      cart.set(id, Math.max(1, Number(e.target.value) || 1));
    }
  });

  // adicionar rápido pelo select
  $.quickSelect.innerHTML = Object.entries(CATEGORIES)
    .map(([key, cat]) => `<optgroup label="${cat.label}">${PRODUCTS.filter((p) => p.categoria === key)
      .map((p) => `<option value="${p.id}">${escapeHTML(p.nome)}</option>`).join('')}</optgroup>`)
    .join('');
  $.quickBtn.addEventListener('click', () => cart.add($.quickSelect.value, 1));
}

/* ---------- Resumo / cálculo ---------- */

function renderSummary() {
  const calc = calculate(cart.list());
  const money = (v) => (v == null ? 'A confirmar' : formatBRL(v));

  $.sumItems.innerHTML = calc.lines.length
    ? calc.lines.map((l) => `<li><span>${l.qty}× ${escapeHTML(l.product.nome)}</span><span>${money(l.subtotal)}</span></li>`).join('')
    : '<li class="is-empty">Nenhum item selecionado.</li>';

  $.sumTotal.textContent = calc.lines.length ? money(calc.total) : '—';
  $.sumSinalLabel.textContent = calc.percent != null ? `Sinal (${calc.percent}%)` : 'Sinal';
  $.sumSinal.textContent = calc.lines.length ? money(calc.sinal) : '—';
  $.sumSaldo.textContent = calc.lines.length ? money(calc.saldo) : '—';

  const notes = [];
  if (CONFIG.modoValidacao) notes.push('Valores fictícios de teste.');
  if (calc.missingPrice) notes.push('Há itens com valor sob consulta: o total será confirmado pela Ioiô.');
  if (calc.percent == null && calc.lines.length) notes.push('Percentual do sinal a definir pela Ioiô.');
  $.sumNote.textContent = notes.join(' ');
  return calc;
}

/* ---------- Validação ---------- */

function setError(input, errorEl, show) {
  errorEl.hidden = !show;
  if (input) input.setAttribute('aria-invalid', String(show));
  return !show;
}

function validate() {
  const f = $.form;
  const minDate = isoDateFromToday(CONFIG.pedido.antecedenciaMinimaDias ?? 1);
  const entrega = f.recebimento.value === 'entrega';

  const checks = [
    setError(null, $.cartError, cart.count() === 0),
    setError(f.nome, $.err.nome, f.nome.value.trim().length < 3),
    setError(f.telefone, $.err.telefone, !isValidPhone(f.telefone.value)),
    setError(f.data, $.err.data, !f.data.value || f.data.value < minDate),
    setError(f.endereco, $.err.endereco, entrega && f.endereco.value.trim().length < 8),
  ];
  const ok = checks.every(Boolean);
  if (!ok) {
    // foca o primeiro campo com erro (ou a lista de itens)
    const firstInvalid = cart.count() === 0 ? $.quickSelect : f.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
  }
  return ok;
}

/* ---------- Inicialização ---------- */

export function initOrder() {
  const form = document.getElementById('order-form');
  $ = {
    form,
    cart: document.getElementById('cart'),
    cartEmpty: document.getElementById('cart-empty'),
    cartError: document.getElementById('cart-error'),
    quickSelect: document.getElementById('quick-add-select'),
    quickBtn: document.getElementById('quick-add-btn'),
    sumItems: document.getElementById('summary-items'),
    sumTotal: document.getElementById('sum-total'),
    sumSinal: document.getElementById('sum-sinal'),
    sumSinalLabel: document.getElementById('sum-sinal-label'),
    sumSaldo: document.getElementById('sum-saldo'),
    sumNote: document.getElementById('summary-note'),
    enderecoField: document.getElementById('endereco-field'),
    err: {
      nome: document.getElementById('f-nome-err'),
      telefone: document.getElementById('f-telefone-err'),
      data: document.getElementById('f-data-err'),
      endereco: document.getElementById('f-endereco-err'),
    },
  };

  // Data mínima (a partir de amanhã ou da antecedência configurada)
  const minDays = CONFIG.pedido.antecedenciaMinimaDias ?? 1;
  form.data.min = isoDateFromToday(minDays);
  if (CONFIG.pedido.antecedenciaMinimaDias) {
    document.getElementById('f-data-hint').textContent = `Pedidos com no mínimo ${minDays} dias de antecedência. A disponibilidade é confirmada pela Ioiô.`;
    $.err.data.textContent = `Escolha uma data com pelo menos ${minDays} dias de antecedência.`;
  }

  // Máscara de telefone
  form.telefone.addEventListener('input', (e) => { e.target.value = maskPhone(e.target.value); });

  // Retirada x entrega
  form.addEventListener('change', (e) => {
    if (e.target.name === 'recebimento') {
      const entrega = e.target.value === 'entrega';
      $.enderecoField.hidden = !entrega;
      form.endereco.required = entrega;
      if (!entrega) setError(form.endereco, $.err.endereco, false);
    }
  });

  // limpa o erro do campo assim que o usuário corrige
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') {
      e.target.setAttribute('aria-invalid', 'false');
      const err = document.getElementById(`${e.target.id}-err`);
      if (err) err.hidden = true;
    }
  });

  // Envio
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    const calc = calculate(cart.list());
    const data = {
      nome: form.nome.value.trim(),
      telefone: form.telefone.value.trim(),
      data: form.data.value,
      horario: form.horario.value,
      recebimento: form.recebimento.value,
      endereco: form.endereco.value.trim(),
      observacoes: form.observacoes.value.trim(),
    };
    const code = orderCode();
    const message = buildOrderMessage({ code, form: data, calc });
    openWhatsApp(message);
    showPaymentStep({ code, nome: data.nome, sinal: calc.sinal, message });
  });

  bindCartEvents();
  cart.onChange(() => { renderCart(); renderSummary(); });
  renderCart();
  renderSummary();
}
