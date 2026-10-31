/**
 * calculator.js — cálculo do total, sinal e saldo restante.
 * Todos os valores em CENTAVOS (inteiros) para evitar erros de ponto flutuante.
 * Os valores são ESTIMATIVAS: o valor final é sempre confirmado manualmente pela Ioiô.
 */
import { CONFIG } from './config.js';
import { findProduct, unitPrice } from './catalog.js';

/** Percentual do sinal: real (config) > teste (modo validação) > null (a definir). */
export function depositPercent() {
  if (Number.isFinite(CONFIG.pedido.percentualSinal)) return CONFIG.pedido.percentualSinal;
  return CONFIG.modoValidacao ? CONFIG.teste.percentualSinal : null;
}

/**
 * @param {{id:string, qty:number}[]} items
 * @returns {{
 *   lines: {product:object, qty:number, unit:number|null, subtotal:number|null}[],
 *   total: number|null, sinal: number|null, saldo: number|null,
 *   percent: number|null, missingPrice: boolean
 * }}
 */
export function calculate(items) {
  const lines = items
    .map(({ id, qty }) => {
      const product = findProduct(id);
      if (!product) return null;
      const unit = unitPrice(product);
      return { product, qty, unit, subtotal: unit == null ? null : unit * qty };
    })
    .filter(Boolean);

  const priced = lines.filter((l) => l.subtotal != null);
  const missingPrice = priced.length < lines.length;
  const total = priced.length ? priced.reduce((sum, l) => sum + l.subtotal, 0) : null;

  const percent = depositPercent();
  // Sinal só é calculado se TODOS os itens tiverem preço e houver percentual definido.
  const sinal = total != null && !missingPrice && percent != null ? Math.round((total * percent) / 100) : null;
  const saldo = sinal != null ? total - sinal : null;

  return { lines, total, sinal, saldo, percent, missingPrice };
}
