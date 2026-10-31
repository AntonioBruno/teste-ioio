/**
 * store.js — estado do carrinho (itens selecionados) com notificação de mudanças.
 * Qualquer módulo pode ler o estado e reagir ao evento "change".
 * O estado vive só em memória: nada é salvo no navegador (LGPD / simplicidade).
 */
const MAX_QTY = 999;
const items = new Map(); // id do produto -> quantidade
const events = new EventTarget();

const emit = () => events.dispatchEvent(new Event('change'));

export const cart = {
  /** Retorna [{ id, qty }] na ordem de inserção. */
  list: () => [...items].map(([id, qty]) => ({ id, qty })),
  qty: (id) => items.get(id) ?? 0,
  count: () => items.size,

  add(id, amount = 1) {
    this.set(id, this.qty(id) + amount);
  },
  set(id, qty) {
    const n = Math.max(0, Math.min(MAX_QTY, Math.floor(Number(qty) || 0)));
    if (n === 0) items.delete(id);
    else items.set(id, n);
    emit();
  },
  remove(id) {
    items.delete(id);
    emit();
  },
  onChange(fn) {
    events.addEventListener('change', fn);
  },
};
