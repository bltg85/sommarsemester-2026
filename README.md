# Sommarsemester 2026 - Boendejämförelse

En interaktiv webbsida för att jämföra semesterboenden i Europa för tre familjer (12 personer).

## Om projektet

Tre familjer planerar en gemensam sommarsemester i Europa 28 juni - 5 juli 2026. Detta projekt samlar alla boendealternativ som hittats och presenterar dem på ett överskådligt sätt med:

- **Interaktiv karta** med alla boenden markerade
- **AI-rankingar** från både Claude (Anthropic) och ChatGPT (OpenAI)
- **Filterbara kort** för varje boende
- **Jämförelsetabeller** från ChatGPTs analys
- **Köravstånd** från Hjärup till olika regioner

## Krav för resan

- **Datum:** 28 juni - 5 juli 2026 (söndag-söndag)
- **Deltagare:** 6 vuxna + 6 barn
- **Budget:** 50 000 - 60 000 SEK
- **Måsten:** Pool, minst 5 sovrum
- **Caroline-kravet:** Promenadavstånd till by med affär/restaurang

## Top 3 enligt Claude

1. **Bastide Saint-Joseph** - Le Rouret, Frankrike
2. **Villa i Amelia** - Umbrien, Italien
3. **Villa Luigi** - Piemonte, Italien

## Top 3 enligt ChatGPT

1. **Vista dai Colli** - Veneto, Italien
2. **Villa Cetona** - Toscana, Italien
3. **Villa Roccaverano** - Piemonte, Italien

## Köra lokalt

Öppna bara `index.html` i en webbläsare. Ingen build-process behövs.

## Teknologi

- Vanilla HTML, CSS, JavaScript
- [Leaflet.js](https://leafletjs.com/) för kartan
- [OpenStreetMap](https://www.openstreetmap.org/) för kartdata
- Google Fonts (Inter)

## Filer

```
website/
├── index.html      # Huvudsida
├── style.css       # Styling
├── data.js         # Alla boenden med koordinater
├── app.js          # Karta och interaktivitet
└── README.md       # Denna fil
```

---

*Sammanställt med hjälp av Claude & ChatGPT, januari 2026*
