# TWÓJ PRAWNIK — strona internetowa

Strona wizytówka biura **„TWÓJ PRAWNIK" — Międzynarodowe Biuro Pomocy Prawnej do spraw Cudzoziemców w Polsce** (Łódź).

## Stack

Statyczny HTML + CSS + vanilla JS — bez builda i zależności. Wystarczy dowolny hosting plików statycznych (Cloudflare Pages, GitHub Pages, Netlify).

## Struktura

```
index.html         — strona główna (PL, źródło prawdy dla treści)
ua/ en/ de/        — statyczne podstrony językowe (GENEROWANE — nie edytuj ręcznie)
translations.json  — słowniki tłumaczeń: PL / UK / EN / DE
build.py           — generator podstron językowych
css/styles.css     — design system (zieleń + złoto, EB Garamond / IBM Plex Sans)
js/main.js         — przełącznik języka, animacje, menu, formularz
assets/            — logo, favicon, odznaka, og-image
```

## Języki

Każda wersja językowa to osobna statyczna podstrona (`/`, `/ua/`, `/en/`, `/de/`) — w pełni indeksowalna przez wyszukiwarki. Strona główna wykrywa język przeglądarki (`ru → uk`) i przekierowuje przy pierwszej wizycie; ręczny wybór zapamiętywany jest w `localStorage`.

**Edycja treści:** zmień tekst w `index.html` (polski) i/lub w `translations.json`, potem uruchom:

```
python build.py
```

i zacommituj wygenerowane podstrony. Przed produkcją uzupełnij `SITE_URL` w `build.py` (włącza hreflang + canonical) i przebuduj.

## Formularz

Domyślnie formularz otwiera program pocztowy (mailto). Aby wysyłać przez backend, wpisz adres endpointu (np. Formspree) w stałą `FORM_ENDPOINT` na górze `js/main.js`.

## Podgląd lokalny

```
python -m http.server 8791
```

i otwórz `http://localhost:8791`.
