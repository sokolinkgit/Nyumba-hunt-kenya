# 🏠 Nyumba Hunt Kenya

**Making house-hunting stress-free, safe and reliable** in Kasarani & Roysambu, Nairobi.

Nyumba Hunt Kenya connects **tenants with rentals** and **landlords with tenants**.
Tenants fill in a short form — name, phone, preferred unit type, location (Kasarani /
Roysambu areas), monthly budget range, the date they want to come see rentals, and an
optional note — then submit straight to **WhatsApp (0113 591 027)**.
Transport to view options is provided, and the tenant pays **one charge, set by unit type,
until they get their desired rental** (see below). Landlords can register their properties
for free via a dedicated form that also submits to WhatsApp.

## Charges (per unit type)

| Unit type                        | Charge     |
| -------------------------------- | ---------- |
| Bedsitter / Studio               | KSh 2,000  |
| 1 Bedroom                        | KSh 2,500  |
| 2 Bedroom                        | KSh 3,000  |
| 3 Bedroom                        | KSh 4,000  |
| 4 Bedroom                        | KSh 4,500  |
| Maisonette / House               | KSh 6,000  |

The charge shown under the tenant form, the amount quoted in the WhatsApp message, the
pricing card and the "Inquire" messages on the listings all come from a single list,
`RATE_CARD`, at the top of `js/script.js`. **To change a price, edit it there** — nothing
else needs touching. (*Shared House* has no rate of its own, so it follows the Bedsitter /
Studio rate. Any new option added to the unit-type dropdown needs a matching `RATE_CARD`
entry; the browser console warns if one is missing.)

## Website

Built with **pure HTML, CSS and JavaScript** — no frameworks, no build step.

- One continuous scrolling experience: Home → Find a Rental → How it Works → Pricing →
  Listings → Landlords → About → Reviews → Contact
- 50 Google-verified reviews in an auto-rotating carousel (3 at a time, refreshes every 5 seconds)
- Fully mobile-friendly: compact cards, forms and footer on phones, and listings still show
  2 per row
- Opens straight onto the page — no splash screen
- Floating WhatsApp button on the right-hand side
- Orange · Blue · White animated theme

### Run locally

```bash
# any static server works, e.g.
python3 -m http.server 8000
# then open http://localhost:8000
```

### Structure

```
index.html          – all pages/sections
css/styles.css      – theme, layout, animations
js/reviews-data.js  – the 50 reviews
js/script.js        – forms → WhatsApp, carousel, animations
assets/img/         – imagery
```

© Nyumba Hunt Kenya 🇰🇪
