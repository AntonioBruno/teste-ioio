# Pasta do QR Code Pix

**Vazia de propósito.** Não colocar aqui QR Code, chave Pix ou dados bancários antes da validação com a cliente.

Depois de validado:
1. Salve a imagem oficial do QR Code fixo como `assets/pix/qrcode-pix.png` (PNG, mínimo 600×600 px).
2. Em `js/config.js`: `pix.validado = true`, `pix.qrCodeImagem = 'assets/pix/qrcode-pix.png'` e, se desejado, `pix.recebedor`.
3. Teste lendo o QR com o app do banco (sem pagar) e confira nome do recebedor.
