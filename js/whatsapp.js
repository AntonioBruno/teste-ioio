/**
 * whatsapp.js — geração de links e mensagens para o WhatsApp (wa.me).
 * Nenhum dado é enviado a servidores: o texto vai na URL e o próprio cliente decide enviar.
 */
import { CONFIG } from './config.js';
import { formatBRL, formatDateBR } from './utils.js';

const QUICK_MESSAGES = {
  geral: 'Olá, Ioiô! Gostaria de fazer uma encomenda.',
  novidades: 'Olá, Ioiô! Quero receber novidades e datas disponíveis.',
};

/** Monta o link wa.me com o texto já codificado. */
export function waLink(text = '') {
  const base = `https://wa.me/${CONFIG.negocio.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Preenche todos os links com [data-whatsapp="geral|novidades"]. */
export function initWhatsAppLinks() {
  document.querySelectorAll('[data-whatsapp]').forEach((a) => {
    a.href = waLink(QUICK_MESSAGES[a.dataset.whatsapp] ?? QUICK_MESSAGES.geral);
  });
}

/** Abre o WhatsApp em nova aba; se o navegador bloquear, navega na mesma aba. */
export function openWhatsApp(text) {
  const url = waLink(text);
  const win = window.open(url, '_blank', 'noopener');
  if (!win) window.location.href = url;
  return url;
}

const money = (cents) => (cents == null ? 'a confirmar' : formatBRL(cents));

/**
 * Mensagem do pedido.
 * @param {object} p
 * @param {string} p.code   código de referência do pedido
 * @param {object} p.form   { nome, telefone, data, horario, recebimento, endereco, observacoes }
 * @param {object} p.calc   resultado de calculate()
 */
export function buildOrderMessage({ code, form, calc }) {
  const L = [];
  if (CONFIG.modoValidacao) L.push('*[TESTE — valores fictícios, desconsiderar]*', '');
  L.push('Olá, Ioiô! Gostaria de fazer uma encomenda.', '');
  L.push(`*Pedido:* ${code}`, '');
  L.push('*Itens:*');
  calc.lines.forEach((l) => {
    L.push(`• ${l.qty}x ${l.product.nome} — ${money(l.subtotal)}`);
  });
  L.push('');
  L.push(`*Total estimado:* ${money(calc.total)}${calc.missingPrice ? ' (há itens com valor a confirmar)' : ''}`);
  L.push(`*Sinal${calc.percent != null ? ` (${calc.percent}%)` : ''}:* ${money(calc.sinal)}`);
  L.push(`*Saldo restante:* ${money(calc.saldo)}`);
  L.push('');
  L.push(`*Nome:* ${form.nome}`);
  L.push(`*WhatsApp:* ${form.telefone}`);
  L.push(`*Data desejada:* ${formatDateBR(form.data)}${form.horario ? ` (${form.horario.toLowerCase()})` : ''}`);
  L.push(`*Recebimento:* ${form.recebimento === 'entrega' ? `Entrega — ${form.endereco}` : 'Retirada'}`);
  if (form.observacoes) L.push(`*Detalhes:* ${form.observacoes}`);
  L.push('');
  L.push('Aguardo a confirmação do orçamento e da data. Obrigado(a)!');
  return L.join('\n');
}

/** Mensagem para envio do comprovante (a conferência é sempre manual). */
export function buildReceiptMessage({ code, nome }) {
  const test = CONFIG.modoValidacao ? '*[TESTE]* ' : '';
  return `${test}Olá, Ioiô! Segue o comprovante do Pix do sinal referente ao pedido *${code}*${nome ? ` (${nome})` : ''}. Fico no aguardo da sua conferência.`;
}
