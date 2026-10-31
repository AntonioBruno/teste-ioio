/**
 * utils.js — funções utilitárias puras (sem acesso ao DOM).
 */

/** Formata centavos (inteiro) como moeda brasileira: 12345 -> "R$ 123,45". */
export function formatBRL(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Mantém apenas dígitos. */
export const onlyDigits = (value = '') => String(value).replace(/\D/g, '');

/** Máscara de telefone BR progressiva: (11) 91234-5678 / (11) 1234-5678. */
export function maskPhone(value) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Telefone BR válido = 10 ou 11 dígitos com DDD. */
export const isValidPhone = (value) => /^\d{10,11}$/.test(onlyDigits(value));

/** Data local no formato YYYY-MM-DD (para input[type=date]), somando N dias a hoje. */
export function isoDateFromToday(daysAhead = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "2026-11-05" -> "05/11/2026" (sem fuso horário envolvido). */
export function formatDateBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Código curto de referência do pedido (facilita a conferência manual do Pix).
 * Ex.: IOIO-1105-4K7Q  (mês+dia da data de envio + 4 caracteres aleatórios sem ambiguidade)
 */
export function orderCode(now = new Date()) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rnd = '';
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  bytes.forEach((b) => { rnd += alphabet[b % alphabet.length]; });
  const pad = (n) => String(n).padStart(2, '0');
  return `IOIO-${pad(now.getMonth() + 1)}${pad(now.getDate())}-${rnd}`;
}

/** Escapa texto para inserir com segurança em innerHTML. */
export function escapeHTML(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
