# 🏠 Nyumba Hunt Kenya

**Making house-hunting stress-free, safe and reliable** in Kasarani & Roysambu, Nairobi.

Nyumba Hunt Kenya connects **tenants with rentals** and **landlords with tenants**.
Tenants fill in the unit they want, location (Kasarani / Roysambu areas), budget, viewing
date and move-in date — then submit straight to **WhatsApp (0113 591 027)**.
Transport to view options is provided, at a flat charge of **KSh 2,000 until the tenant
gets their desired rental**. Landlords can register their properties for free via a
dedicated form that also submits to WhatsApp.

## Website

Built with **pure HTML, CSS and JavaScript** — no frameworks, no build step.

- One continuous scrolling experience: Home → Find a Rental → How it Works → Pricing →
  Listings → Landlords → About → Reviews → Contact
- 50 Google-verified reviews in an auto-rotating carousel (3 at a time, refreshes every 5 seconds)
- Fully mobile-friendly (listings show 2 per row on phones)
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
