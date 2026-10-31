"""
Bolos + Delícias da Ioiô — preparação dos assets PROVISÓRIOS para a web.

Por que existe:
  O pacote recebido foi recortado de uma prancha única (1536x1024). Na prática:
  - logo e ícones têm o NOME DO ARQUIVO escrito dentro da imagem;
  - decorações têm o "xadrez de transparência" gravado como pixel (sem alfa real).
  Este script gera cópias "-web.png" limpas (recorte + fundo transparente),
  SEM alterar os arquivos originais.

Uso (na raiz do projeto):
  pip install pillow numpy scipy
  python tools/preparar-assets.py

Quando chegarem as artes definitivas (SVG/PNG com transparência real),
basta substituir os arquivos "-web.png" e este script deixa de ser necessário.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent / "assets"


def hsv(rgb):
    """Retorna H (0-360), S (0-1), V (0-1) para um array RGB uint8."""
    arr = rgb.astype(np.float32) / 255.0
    mx, mn = arr.max(-1), arr.min(-1)
    d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    h = np.zeros_like(mx)
    m = d > 1e-6
    rm = m & (mx == r)
    gm = m & (mx == g) & ~rm
    bm = m & ~rm & ~gm
    h[rm] = (60 * ((g - b) / np.maximum(d, 1e-6)) % 360)[rm]
    h[gm] = (60 * ((b - r) / np.maximum(d, 1e-6)) + 120)[gm]
    h[bm] = (60 * ((r - g) / np.maximum(d, 1e-6)) + 240)[bm]
    return h, s, mx


def crop_to_alpha(img, pad=6):
    bbox = img.getchannel("A").point(lambda a: 255 if a > 20 else 0).getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    return img.crop((max(0, x0 - pad), max(0, y0 - pad), min(img.width, x1 + pad), min(img.height, y1 + pad)))


def flood_background(rgb, sat_max=0.10, val_min=0.72):
    """Máscara do fundo claro/acinzentado (branco ou xadrez) conectado à borda."""
    _, s, v = hsv(rgb)
    cand = (s < sat_max) & (v > val_min)
    lab, _ = ndimage.label(cand)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    border = border[border > 0]
    return np.isin(lab, border)


def remove_bg(path_in, path_out, crop_bottom=None, drop_text=True):
    """Decorações e logo: remove fundo conectado à borda e legendas cinza."""
    im = Image.open(path_in).convert("RGB")
    if crop_bottom:
        im = im.crop((0, 0, im.width, crop_bottom))
    rgb = np.array(im)
    bg = flood_background(rgb)
    alpha = (~bg).astype(np.float32)
    if drop_text:
        _, s, _ = hsv(rgb)
        lab, n = ndimage.label(alpha > 0)
        if n:
            sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
            sats = ndimage.mean(s, lab, range(1, n + 1))
            biggest = int(np.argmax(sizes)) + 1
            h_, w_ = alpha.shape
            for i in range(1, n + 1):
                ys, xs = np.where(lab == i)
                touches = ys.min() == 0 or xs.min() == 0 or ys.max() == h_ - 1 or xs.max() == w_ - 1
                # legendas (cinza, pouco saturadas), ruídos e vizinhos cortados na borda
                if i != biggest and (sats[i - 1] < 0.2 or sizes[i - 1] < 40 or touches):
                    alpha[lab == i] = 0
    # borda suave de 1px para não serrilhar
    alpha = ndimage.uniform_filter(alpha, size=2)
    out = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    crop_to_alpha(Image.fromarray(out, "RGBA")).save(path_out, optimize=True)


def extract_icon(path_in, path_out, color=None, keep_top=1.0):
    """Ícones de linha: usa a saturação como alfa (remove texto e fundo)."""
    im = Image.open(path_in).convert("RGB")
    rgb = np.array(im)
    h, s, v = hsv(rgb)
    pinkish = ((h > 320) | (h < 20)) & (v > 0.55)
    greenish = (h > 90) & (h < 170) & (v > 0.35)
    colored = pinkish | greenish
    alpha = np.clip((s - 0.18) / 0.45, 0, 1) * colored
    if keep_top < 1.0:  # passos: ícone em cima, texto embaixo
        alpha[int(alpha.shape[0] * keep_top):] = 0
    # remove pontos isolados
    lab, n = ndimage.label(alpha > 0.3)
    if n:
        sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
        for i, sz in enumerate(sizes, start=1):
            if sz < 25:
                alpha[lab == i] = 0
    if color:
        rgb = np.zeros_like(rgb) + np.array(color, dtype=np.uint8)
    out = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    crop_to_alpha(Image.fromarray(out, "RGBA"), pad=4).save(path_out, optimize=True)


PINK = (239, 71, 114)  # #EF4772

if __name__ == "__main__":
    # Logo: corta a legenda "logo-ioio.png / PNG • Fundo transparente"
    remove_bg(ROOT / "branding/logo-ioio.png", ROOT / "branding/logo-ioio-web.png", crop_bottom=520, drop_text=False)

    for name in ["abelha-01", "abelha-02", "girassol", "folhas", "coracoes", "trilho-coracao",
                 "folha-01", "folha-02", "flor-01", "flor-02", "morango", "chantilly", "petala"]:
        remove_bg(ROOT / f"decoracoes/{name}.png", ROOT / f"decoracoes/{name}-web.png")

    for name in ["icon-bolo", "icon-docinho", "icon-salgado", "icon-ingredientes", "icon-artesanal",
                 "icon-especial", "instagram", "telefone", "localizacao", "email"]:
        extract_icon(ROOT / f"icons/{name}.png", ROOT / f"icons/{name}-web.png", color=PINK, keep_top=0.72)
    # WhatsApp: ícone preenchido (telefone branco dentro) -> remoção de fundo, não saturação
    remove_bg(ROOT / "icons/whatsapp.png", ROOT / "icons/whatsapp-web.png", crop_bottom=134)

    for name in ["passo-escolha", "passo-data", "passo-pagamento", "passo-retirada"]:
        extract_icon(ROOT / f"icons/{name}.png", ROOT / f"icons/{name}-web.png", color=PINK, keep_top=0.6)

    # Favicon: derivado do girassol tratado
    sun = Image.open(ROOT / "decoracoes/girassol-web.png")
    for size in (32, 180):
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        s = sun.copy()
        s.thumbnail((size, size), Image.LANCZOS)
        canvas.paste(s, ((size - s.width) // 2, (size - s.height) // 2), s)
        canvas.save(ROOT / f"branding/favicon-{size}.png", optimize=True)

    print("Assets -web gerados em", ROOT)
