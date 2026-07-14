# TWÓJ PRAWNIK — strona internetowa

Strona wizytówka biura **„TWÓJ PRAWNIK" — Międzynarodowe Biuro Pomocy Prawnej do spraw Cudzoziemców w Polsce** (Łódź).

## Stack

Statyczny HTML + CSS + vanilla JS — bez builda i zależności. Wystarczy dowolny hosting plików statycznych (Cloudflare Pages, GitHub Pages, Netlify).

## Struktura

```
index.html        — cała treść strony (polski w źródle + atrybuty data-i18n)
css/styles.css    — design system (zieleń + złoto, EB Garamond / Inter)
js/i18n.js        — słowniki tłumaczeń: PL / UK / EN / DE
js/main.js        — przełącznik języka, animacje, menu, formularz
assets/           — logo, favicon
```

## Języki

Strona wykrywa język przeglądarki (PL/UK/EN/DE; `ru → uk`) i zapamiętuje ręczny wybór w `localStorage`. Edycja tekstów: `js/i18n.js`.

## Podgląd lokalny

```
python -m http.server 8791
```

i otwórz `http://localhost:8791`.
