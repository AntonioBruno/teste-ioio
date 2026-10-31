# Checklist de testes e pendências — MVP v0.1

Legenda: ☐ a fazer · ✅ verificado no desenvolvimento (refazer na máquina de validação)

---

## A. Testes funcionais (fazer em desktop, tablet e celular)

### Cabeçalho e navegação
- ✅ ☐ Logo leva ao topo; links Início / Encomendas / Contato rolam até a seção certa (sem ficar escondida sob o cabeçalho).
- ✅ ☐ "Nossos bolos", "Docinhos" e "Salgados" levam ao catálogo **já filtrado**.
- ✅ ☐ Botão "Fazer encomenda" abre o WhatsApp com mensagem inicial.
- ✅ ☐ ≤1023 px: menu hambúrguer abre/fecha; fecha ao clicar em link, ao clicar fora e com `Esc`.
- ☐ O link do menu fica destacado conforme a seção visível ao rolar.

### Catálogo e seleção
- ✅ ☐ "Conhecer opções" de cada categoria filtra a lista e rola até ela.
- ✅ ☐ Filtros Todos / Bolos / Docinhos / Salgados funcionam.
- ✅ ☐ "Adicionar ao pedido" inclui o item; clicar de novo soma +1 e o card fica destacado.

### Encomenda e cálculos (modo de validação: bolo R$ 100, unidade R$ 1, sinal 50%)
- ✅ ☐ 1 bolo + 50 brigadeiros → Total **R$ 150,00**, Sinal **R$ 75,00**, Saldo **R$ 75,00**.
- ✅ ☐ Botões − / + e digitação direta da quantidade atualizam o resumo; lixeira remove.
- ✅ ☐ Enviar sem itens/nome/WhatsApp/data mostra os erros e não abre o WhatsApp.
- ✅ ☐ Data no passado ou hoje é recusada.
- ✅ ☐ Máscara de telefone: `11987654321` → `(11) 98765-4321`.
- ✅ ☐ "Entrega" exibe e exige o endereço; "Retirada" esconde.
- ✅ ☐ Mensagem do WhatsApp contém código do pedido, itens, total, sinal, saldo, dados, data e observações, marcada **[TESTE]**.
- ☐ Testar o envio real no WhatsApp Web (desktop) e no app (celular).

### Pix (regras críticas)
- ✅ ☐ Painel de pagamento só aparece após enviar o pedido.
- ✅ ☐ QR Code só aparece após marcar "A Ioiô já me confirmou o orçamento…".
- ✅ ☐ Com `pix.validado = false`, aparece o quadro "QR Code Pix em validação" (sem dados bancários).
- ✅ ☐ Status é sempre "Pagamento aguardando conferência manual da Ioiô"; nenhum texto diz "pago/recebido".
- ✅ ☐ "Enviar comprovante" abre o WhatsApp com o código do pedido.

### Responsividade e navegadores
- ✅ ☐ Sem rolagem horizontal em 390 px, 820 px e 1440 px.
- ☐ Testar em Chrome, Edge, Firefox e Safari (iPhone).
- ☐ Testar em celular Android e iPhone reais (seletor de data nativo, teclado numérico no telefone).

### Acessibilidade e qualidade
- ☐ Navegar o site inteiro só com `Tab` / `Shift+Tab` / `Enter` (foco sempre visível).
- ☐ Rodar **Lighthouse** (F12 › Lighthouse) — meta: Acessibilidade ≥ 95, Boas práticas ≥ 95.
- ☐ Conferir contraste com o [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) nos textos rosa.
- ☐ Testar com leitor de tela (NVDA no Windows ou VoiceOver no iPhone) o fluxo "adicionar item → enviar pedido".
- ☐ `npm run build` + `npm run preview` sem erros no console.

---

## B. Pendências de validação com a cliente (bloqueiam a publicação)

### Dados do negócio — `js/config.js`
- ☐ WhatsApp comercial **(11) 99698-0769** (veio do layout v2.0) — confirmar.
- ☐ Instagram **@bolosdeliciasdaioio** — confirmar grafia/existência.
- ☐ Cidade/região de atendimento ("São Paulo - SP") e se há endereço de retirada a publicar.
- ☐ Percentual do sinal (`pedido.percentualSinal`).
- ☐ Antecedência mínima para encomendas (`pedido.antecedenciaMinimaDias`).
- ☐ Política de entrega: regiões atendidas e taxa (hoje: "a combinar").
- ☐ Política de cancelamento/reembolso do sinal (recomendado publicar antes de receber Pix).

### Cardápio e preços — `js/catalog.js`
- ☐ Lista real de produtos (os 8 itens atuais foram montados a partir das fotos do pacote).
- ☐ Preços reais (hoje todos `null`) — **não publicar com o modo de validação ligado**.
- ☐ Unidade de venda dos docinhos/salgados (unidade, cento, caixa?) e pedido mínimo.
- ☐ Sabores, tamanhos/pesos dos bolos e textos descritivos.

### Pix — `assets/pix/` + `js/config.js › pix`
- ☐ QR Code **fixo oficial** do banco da cliente (PNG ≥ 600×600).
- ☐ Nome do recebedor para conferência.
- ☐ Teste de leitura do QR no app do banco (sem pagar) antes de `pix.validado = true`.
- ☐ Combinar o procedimento de conferência manual (quem confere, prazo de resposta).

### Conteúdo
- ☐ Texto "Sobre a Ioiô" (veio do layout) — validar a história.
- ☐ Depoimentos: só com clientes reais e autorização (`config.depoimentos`). Seção oculta até lá.
- ☐ Páginas de Política de Privacidade e Termos (o layout mostrava os links; não foram criados para não publicar texto jurídico sem revisão).
- ☐ Grafia "Ioiô" e palavra "Gratidão" no logo (checklist do manual).

### Antes do deploy
- ☐ `modoValidacao: false`.
- ☐ Domínio, hospedagem (ex.: Netlify, Vercel, GitHub Pages — todos aceitam a pasta `dist/`) e HTTPS.
- ☐ Google Fonts: avaliar hospedar as fontes localmente (LGPD/performance).

---

## C. Assets que precisam de substituição por versões definitivas

O pacote recebido é recorte ampliado de uma prancha 1536×1024 (ver `assets/LEIA-ME.md`). Todos são **provisórios**.

| Asset usado no site | Problema | Substituir por |
|---|---|---|
| `branding/logo-ioio-web.png` | Recorte com legenda removida e fundo removido por script; baixa resolução (635 px) | **SVG** ou PNG transparente ≥ 1200 px do logo aprovado |
| `branding/favicon-32/180.png` | Gerado a partir do girassol | Favicon oficial (SVG + PNG 32/180/512) |
| `bolos/banner-hero.jpg` | 916×364 ampliado → borrado em telas grandes | Foto real ≥ 1920×1080 |
| `bolos/banner-historia.jpg` | 544×356, faixa rosa no topo | Foto real da Ioiô (com autorização de imagem) ≥ 1200 px |
| `bolos/banner-cta.jpg` | 704×354 | Foto real ≥ 1920×600 |
| `bolos/categoria-*.jpg`, `docinhos/*`, `salgados/*`, `bolo-*.jpg` | ~290–430 px; ilustrativas (não são produtos reais da Ioiô) | Fotos reais dos produtos ≥ 1200×900 |
| `icons/*-web.png` | Legenda do nome do arquivo removida por script; cor recolorida | Ícones **SVG** do kit (512×512) |
| `icons/whatsapp-web.png` | Recorte de baixa resolução | Ícone oficial do WhatsApp (SVG) |
| `decoracoes/*-web.png` | Xadrez de "transparência" estava gravado; fundo removido por script | PNG com transparência real ou SVG |

Não utilizados (com defeitos): `decoracoes/banner-contato.png` (texto/botão embutidos — a faixa foi feita em HTML), `fundo-rosa.jpg`, `fundo-creme.jpg` (substituídos por cores CSS), `folha-01`, `flor-01`, `flor-02`, `morango`, `chantilly`, `petala`, `folha-solta` (recortes com vizinhos/legendas). `pLhvnzPTx.jfif` (bolo de abelhas e girassóis) foi tratado como referência de estilo e **não** foi usado por não sabermos se é foto da Ioiô e se há autorização.
