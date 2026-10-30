#!/usr/bin/env python3
"""Costruisce www/index.html (una sola pagina, funziona senza rete)."""
import base64, pathlib
q = pathlib.Path(__file__).parent
fonts = ''.join(
    f"@font-face{{font-family:{nome};src:url(data:font/woff2;base64,{base64.b64encode((q/'font'/f).read_bytes()).decode()}) format('woff2');font-display:block}}"
    for nome, f in [('SLTeg', 'eg.woff2'), ('SLTru', 'ru.woff2'), ('SLTlb', 'lb.woff2')])
js = '\n'.join((q/f).read_text() for f in ['terre.js', 'dati.js', 'disegni.js', 'audio.js', 'gioco.js'])
html = f"""<!doctype html>
<html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#3a2a1c">
<title>Sotto la terra</title>
<style>{fonts}{(q/'stile.css').read_text()}</style>
</head><body><p style="padding:20px;font-family:sans-serif">Caricamento…</p>
<span style="position:absolute;opacity:0;pointer-events:none;font-family:SLTeg">𓈖</span><span style="position:absolute;opacity:0;pointer-events:none;font-family:SLTru">ᚴ</span><span style="position:absolute;opacity:0;pointer-events:none;font-family:SLTlb">𐀒</span>
<script>{js}</script>
</body></html>
"""
out = q/'www'; out.mkdir(exist_ok=True)
(out/'index.html').write_text(html)
print('www/index.html', len(html), 'byte')
