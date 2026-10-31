/**
 * pix.js — exibição do QR Code Pix FIXO após a confirmação do orçamento.
 *
 * Regras de negócio (manual, seção 8):
 *  - O QR só aparece depois que o cliente indica que a Ioiô confirmou o orçamento.
 *  - Enquanto CONFIG.pix.validado = false, NENHUM QR/dado bancário é exibido (placeholder).
 *  - O site NUNCA marca o pagamento como recebido: o status é sempre
 *    "aguardando conferência manual". A confirmação é feita pela Ioiô, no extrato, e respondida no WhatsApp.
 */
import { CONFIG } from './config.js';
import { formatBRL } from './utils.js';
import { waLink, buildReceiptMessage } from './whatsapp.js';

let els;
let current = { code: null, nome: '', sinal: null };

function renderQR() {
  const { validado, qrCodeImagem, recebedor } = CONFIG.pix;
  if (validado && qrCodeImagem) {
    // Resolvido a partir da página (a pasta assets/pix é copiada para o build pelo vite.config.js)
    const src = new URL(qrCodeImagem, document.baseURI).href;
    els.qr.innerHTML = `<img src="${src}" alt="QR Code Pix para pagamento do sinal${recebedor ? ` — recebedor: ${recebedor}` : ''}" width="200" height="200" />`;
  } else {
    // Placeholder: não publicar QR Code ou dados bancários sem validação da cliente.
    els.qr.innerHTML = `<div class="pix-placeholder" role="img" aria-label="QR Code Pix em validação">QR Code Pix<br/>em validação<br/><small>Solicite os dados de pagamento pelo WhatsApp</small></div>`;
  }
}

function sync() {
  const confirmed = els.check.checked;
  els.area.hidden = !confirmed;
  if (!confirmed) return;
  renderQR();
  els.valorRef.textContent = current.sinal != null ? ` (estimativa do site: ${formatBRL(current.sinal)})` : '';
  els.receipt.href = waLink(buildReceiptMessage(current));
}

export function initPix() {
  els = {
    panel: document.getElementById('payment'),
    check: document.getElementById('budget-confirmed'),
    area: document.getElementById('pix-area'),
    qr: document.getElementById('pix-qr'),
    valorRef: document.getElementById('pix-valor-ref'),
    receipt: document.getElementById('send-receipt'),
    code: document.getElementById('order-code'),
    preview: document.getElementById('message-preview'),
  };
  els.check.addEventListener('change', sync);

  document.getElementById('copy-message').addEventListener('click', async (e) => {
    try {
      await navigator.clipboard.writeText(els.preview.textContent);
      e.currentTarget.textContent = 'Mensagem copiada!';
    } catch {
      e.currentTarget.textContent = 'Não foi possível copiar';
    }
  });
}

/** Chamado pelo formulário após gerar a mensagem do pedido. */
export function showPaymentStep({ code, nome, sinal, message }) {
  current = { code, nome, sinal };
  els.code.textContent = code;
  els.preview.textContent = message;
  els.check.checked = false; // novo pedido -> exige nova confirmação do orçamento
  els.panel.hidden = false;
  sync();
  els.panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  els.panel.focus({ preventScroll: true });
}
