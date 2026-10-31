/**
 * config.js — dados do negócio e chaves de comportamento do site.
 *
 * ⚠️ REGRA DO PROJETO: nada aqui deve ser inventado.
 *    Tudo marcado como PENDENTE precisa ser confirmado com a cliente antes da publicação.
 */
export const CONFIG = {
  /**
   * Modo de validação (ambiente de teste).
   * true  -> mostra a faixa "Ambiente de validação", usa preços/sinal FICTÍCIOS de teste
   *          e marca a mensagem do WhatsApp como [TESTE].
   * false -> usa apenas preços reais definidos em js/catalog.js (null = "sob consulta").
   * Antes de publicar: false.
   */
  modoValidacao: true,

  negocio: {
    nome: 'Bolos + Delícias da Ioiô',
    // PENDENTE: número retirado do layout v2.0 / manual. Confirmar se é o WhatsApp comercial.
    whatsapp: '5511996980769',            // formato internacional, só dígitos (55 + DDD + número)
    whatsappExibicao: '(11) 99698-0769',
    // PENDENTE: perfil retirado do layout v2.0. Confirmar grafia.
    instagram: 'bolosdeliciasdaioio',
    // PENDENTE: cidade/região de atendimento.
    cidade: 'São Paulo - SP',
  },

  pedido: {
    // PENDENTE: percentual do sinal definido pela cliente (ex.: 50). null = "a definir".
    percentualSinal: null,
    // PENDENTE: antecedência mínima em dias. Enquanto null, o site exige apenas data futura (a partir de amanhã).
    antecedenciaMinimaDias: null,
  },

  /** Valores usados SOMENTE quando modoValidacao = true. São propositalmente "redondos" e fictícios. */
  teste: {
    percentualSinal: 50,
    precoBoloCentavos: 10000,     // R$ 100,00 (fictício)
    precoUnidadeCentavos: 100,    // R$ 1,00 por unidade de docinho/salgado (fictício)
  },

  pix: {
    /**
     * Só mude para true depois que a cliente validar o QR Code fixo do banco dela.
     * Enquanto false, o site exibe um quadro "QR Code em validação" (nenhum dado bancário é publicado).
     */
    validado: false,
    // Caminho da imagem do QR Code oficial (ex.: 'assets/pix/qrcode-pix.png'). Manter null até validar.
    qrCodeImagem: null,
    // Nome do recebedor exibido para conferência (opcional, confirmar com a cliente).
    recebedor: null,
  },

  /**
   * Depoimentos REAIS e autorizados pelos clientes. Vazio = seção oculta.
   * Formato: { texto: '...', autor: 'Nome S.' }
   */
  depoimentos: [],
};
