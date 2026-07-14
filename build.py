# -*- coding: utf-8 -*-
"""
Generator statycznych podstron językowych.

Źródło prawdy: index.html (polski) + translations.json.
Wynik:        ua/index.html, en/index.html, de/index.html

Uruchomienie:  python build.py
Po każdej zmianie treści w index.html lub translations.json
uruchom ponownie i zacommituj wygenerowane pliki.
"""

import json
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))

# Uzupełnij przed produkcją (np. "https://twojprawnik.pl") —
# włącza znaczniki hreflang i canonical (wymagają pełnych adresów URL).
SITE_URL = ""

# kod języka (html lang / translations.json) -> katalog podstrony
LANGS = {"uk": "ua", "en": "en", "de": "de"}

OG_LOCALE = {"pl": "pl_PL", "uk": "uk_UA", "en": "en_GB", "de": "de_DE"}


def esc_attr(text):
    return text.replace('"', "&quot;")


def hreflang_block(self_lang):
    if not SITE_URL:
        return ""
    urls = {"pl": SITE_URL + "/"}
    for code, folder in LANGS.items():
        urls[code] = SITE_URL + "/" + folder + "/"
    lines = ['  <link rel="canonical" href="%s">' % urls[self_lang]]
    for code, url in urls.items():
        hl = "uk" if code == "uk" else code
        lines.append('  <link rel="alternate" hreflang="%s" href="%s">' % (hl, url))
    lines.append('  <link rel="alternate" hreflang="x-default" href="%s">' % urls["pl"])
    return "\n" + "\n".join(lines)


def build_page(src, lang, dictionary):
    out = src

    # 1. atrybut lang dokumentu
    out = out.replace('<html lang="pl">', '<html lang="%s">' % lang)

    # 2. metadane
    out = re.sub(r"<title>.*?</title>",
                 lambda m: "<title>%s</title>" % dictionary["meta.title"],
                 out, flags=re.S)
    out = re.sub(r'(<meta name="description" content=").*?(">)',
                 lambda m: m.group(1) + esc_attr(dictionary["meta.desc"]) + m.group(2),
                 out, flags=re.S)
    out = re.sub(r'(<meta property="og:title" content=").*?(">)',
                 lambda m: m.group(1) + esc_attr(dictionary["meta.title"]) + m.group(2),
                 out, flags=re.S)
    out = re.sub(r'(<meta property="og:description" content=").*?(">)',
                 lambda m: m.group(1) + esc_attr(dictionary["meta.desc"]) + m.group(2),
                 out, flags=re.S)
    out = out.replace('<meta property="og:type" content="website">',
                      '<meta property="og:type" content="website">\n'
                      '  <meta property="og:locale" content="%s">' % OG_LOCALE[lang])

    # 3. treści oznaczone data-i18n (elementy-liście) i data-i18n-html (hero h1)
    for key, val in dictionary.items():
        if key.startswith("meta."):
            continue
        out = re.sub(r'(data-i18n="%s"[^>]*>)[^<]*(<)' % re.escape(key),
                     lambda m, v=val: m.group(1) + v + m.group(2),
                     out)
        out = re.sub(r'(data-i18n-html="%s"[^>]*>).*?(</h1>)' % re.escape(key),
                     lambda m, v=val: m.group(1) + v + m.group(2),
                     out, flags=re.S)

    # 4. usuń skrypt auto-przekierowania (działa tylko na stronie głównej PL)
    out = re.sub(r"\s*<script data-lang-redirect>.*?</script>", "", out, flags=re.S)

    # 5. przełącznik języka: zaznacz bieżący język i pokaż jego etykietę
    out = out.replace('aria-selected="true"', 'aria-selected="false"')
    out = re.sub(r'(data-lang="%s"[^>]*?)aria-selected="false"' % lang,
                 lambda m: m.group(1) + 'aria-selected="true"',
                 out)
    label = {"uk": "UA", "en": "EN", "de": "DE"}[lang]
    out = out.replace('<span id="langCurrent">PL</span>',
                      '<span id="langCurrent">%s</span>' % label)

    # 6. hreflang + canonical
    block = hreflang_block(lang)
    if block:
        out = out.replace('  <link rel="icon"', block + '\n  <link rel="icon"', 1)

    return out


def main():
    src = open(os.path.join(BASE, "index.html"), encoding="utf-8").read()
    translations = json.load(open(os.path.join(BASE, "translations.json"), encoding="utf-8"))

    for lang, folder in LANGS.items():
        page = build_page(src, lang, translations[lang])
        target_dir = os.path.join(BASE, folder)
        os.makedirs(target_dir, exist_ok=True)
        with open(os.path.join(target_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(page)
        print("OK  /%s/index.html  (%d znaków)" % (folder, len(page)))

    if not SITE_URL:
        print("\nUWAGA: SITE_URL pusty — hreflang/canonical pominięte."
              "\nUzupełnij SITE_URL w build.py po ustaleniu domeny i przebuduj.")


if __name__ == "__main__":
    main()
