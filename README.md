# Sotto la terra

Gioco di archeologia rilassante per Android: dodici scavi veri nel mondo (Pompei, Valle dei Re, Lascaux, Troia, Esercito di terracotta, Mohenjo-daro, Machu Picchu, Olduvai, Birka, Palenque, Cnosso, Sutton Hoo), 96 reperti da trovare, pulire, ricomporre, decifrare e mettere in un museo tutto tuo.

**Scarica l'app per Android:** https://github.com/massxxx/massxxx-sotto-la-terra/releases/latest/download/SottoLaTerra.apk

## Come è fatto
- `dati.js` siti, strati, reperti e iscrizioni; `disegni.js` disegni dei reperti e del personaggio; `audio.js` musica ed effetti sintetizzati; `gioco.js` il gioco; `stile.css` la grafica.
- `python3 build.py` crea `www/index.html`, una pagina sola che funziona senza rete.
- A ogni modifica su `main` GitHub Actions (`.github/workflows/app.yml`) costruisce l'APK con Capacitor e lo pubblica nella release `app`.
- La partita è salvata sul telefono.
