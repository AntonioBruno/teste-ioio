# Bolos + Delícias da Ioiô — Website (MVP v0.1)

Site de uma página da confeitaria, baseado no **layout v2.0 aprovado** e no **manual de identidade visual v1.0**.
HTML5 semântico + CSS3 (variáveis) + JavaScript ES6 em módulos, com **Vite** apenas como servidor de desenvolvimento/build.
Sem dependências de runtime (sem React, Tailwind ou Bootstrap).

> ⚠️ **Ambiente de validação ativo** (`modoValidacao: true` em `js/config.js`): preços, sinal e QR Code exibidos são **fictícios**.
> Ver `CHECKLIST.md` antes de publicar.

---

## 1. Como executar no VS Code

### Pré-requisitos
- [VS Code](https://code.visualstudio.com/)
- [Node.js 18 ou superior](https://nodejs.org/) (LTS) — confira com `node -v`
- Git (opcional, para versionamento) — confira com `git --version`

### Opção A — Vite (recomendado)
1. No VS Code: **Arquivo › Abrir Pasta…** e selecione a pasta `ioio-site`.
2. Abra o terminal integrado: **Terminal › Novo Terminal** (atalho ``Ctrl + ` ``).
3. Instale as dependências (só na primeira vez):
   ```bash
   npm install
   ```
4. Rode o servidor local:
   ```bash
   npm run dev
   ```
   O navegador abre em **http://localhost:5173**. Alterações em HTML/CSS/JS recarregam automaticamente.
5. Para gerar a versão de produção (pasta `dist/`) e testá-la:
   ```bash
   npm run build
   npm run preview
   ```

> **Rede corporativa:** se o `npm install` falhar por proxy/firewall, use a Opção B.

### Opção B — Live Server (sem Node)
1. Instale a extensão **Live Server** (Ritwick Dey) — o VS Code vai sugeri-la ao abrir a pasta.
2. Clique com o botão direito em `index.html` › **Open with Live Server**.

> Não abra o `index.html` com duplo clique (`file://`): os módulos JavaScript exigem um servidor local.

### Testar como celular/tablet
No navegador, `F12` › ícone de dispositivo (`Ctrl + Shift + M`) e escolha 390 px (celular), 820 px (tablet) e 1440 px (desktop).
Para testar em um celular real na mesma rede Wi-Fi: `npm run dev -- --host` e acesse o endereço "Network" exibido.

---

## 2. Estrutura de pastas

```
ioio-site/
├── index.html              # Página única com as 8 seções (HTML semântico e acessível)
├── style.css               # Estilos: tokens → base → componentes → seções → responsivo
├── script.js               # Ponto de entrada: inicializa os módulos
├── js/
│   ├── config.js           # ★ Dados do negócio, modo de validação, sinal, Pix, depoimentos
│   ├── catalog.js          # ★ Cardápio (produtos/preços) + seleção e filtros
│   ├── store.js            # Estado do carrinho
│   ├── calculator.js       # Total, sinal e saldo (em centavos)
│   ├── order.js            # Formulário, validação e resumo
│   ├── whatsapp.js         # Links wa.me e mensagens do pedido/comprovante
│   ├── pix.js              # QR Code Pix após confirmação do orçamento (conferência manual)
│   ├── menu.js             # Menu responsivo
│   ├── navigation.js       # Navegação entre seções / link ativo
│   └── utils.js            # Formatação de moeda, data, telefone, código do pedido
├── assets/
│   ├── branding/           # Logo (original + logo-ioio-web.png tratado) e favicons
│   ├── bolos/              # Fotos de bolos e banners (hero, história, CTA)
│   ├── docinhos/
│   ├── salgados/
│   ├── decoracoes/         # Abelhas, girassol, folhas… (originais + *-web.png sem fundo)
│   ├── icons/              # Ícones (originais + *-web.png sem legenda)
│   ├── pix/                # VAZIA de propósito até validar o QR Code (ver LEIA-ME)
│   ├── LEIA-ME.md          # Limitações do pacote de assets recebido
│   └── manifesto.json
├── tools/
│   └── preparar-assets.py  # Gera os *-web.png a partir dos originais (Python + Pillow)
├── CHECKLIST.md            # Checklist de testes e pendências de validação
├── package.json · vite.config.js · .gitignore
└── .vscode/extensions.json # Extensões recomendadas
```

★ = arquivos que a equipe vai editar com mais frequência.

**Ordem das seções:** Cabeçalho › Hero › Diferenciais › Catálogo › Sobre (institucional) › Faixa CTA › Como funciona › Encomendas › (Depoimentos, oculto) › Contato/Rodapé.
"Como funciona" vem antes do formulário para o cliente entender o fluxo de sinal/Pix antes de preencher.

---

## 3. Onde alterar cada coisa

| O quê | Onde |
|---|---|
| WhatsApp, Instagram, cidade | `js/config.js › negocio` |
| Percentual do sinal | `js/config.js › pedido.percentualSinal` (ex.: `50`) |
| Antecedência mínima | `js/config.js › pedido.antecedenciaMinimaDias` |
| Preços reais | `js/catalog.js › precoCentavos` (ex.: `8990` = R$ 89,90) |
| Produtos / fotos | `js/catalog.js › PRODUCTS` |
| QR Code Pix | `assets/pix/` + `js/config.js › pix` (ver `assets/pix/LEIA-ME.md`) |
| Depoimentos reais | `js/config.js › depoimentos` (vazio = seção oculta) |
| Desligar modo de teste | `js/config.js › modoValidacao: false` |
| Cores / fontes / espaçamentos | `style.css › :root` |

## 4. Regras de negócio implementadas
- O site **não processa pagamentos** e **nunca marca pedidos como pagos**. Status fixo: "aguardando conferência manual da Ioiô".
- O QR Code só aparece depois que o cliente marca que a Ioiô confirmou o orçamento.
- Enquanto `pix.validado = false`, aparece um quadro "QR Code Pix em validação" — nenhum dado bancário é publicado.
- Cada pedido recebe um código (ex.: `IOIO-1105-4K7Q`) que acompanha a mensagem e o comprovante, facilitando a conferência manual.
- Dados do cliente não são salvos: seguem apenas na mensagem que ele mesmo envia no WhatsApp.
- Itens sem preço aparecem como "Valor sob consulta"; o sinal só é calculado quando todos os itens têm preço e o percentual está definido.

## 5. Git (versionamento)
```bash
git init
git add .
git commit -m "MVP v0.1 - site Bolos + Delícias da Ioiô (layout v2.0)"
# depois de criar o repositório no GitHub:
git branch -M main
git remote add origin https://github.com/<usuario>/<repositorio>.git
git push -u origin main
```
Sugestão de fluxo: uma branch por ajuste (`git checkout -b ajuste/precos`) e commit a cada validação aprovada.

## 6. Regenerar assets tratados
Quando chegarem artes melhores, substitua os originais e rode:
```bash
pip install pillow numpy scipy
python tools/preparar-assets.py
```
Com artes definitivas em PNG/SVG transparente, basta salvar por cima dos `*-web.png` (o script deixa de ser necessário).
