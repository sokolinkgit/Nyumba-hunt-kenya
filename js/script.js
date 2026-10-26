/* ============================================================
   NYUMBA HUNT KENYA — script.js
   Reactive animations · WhatsApp submissions · Reviews carousel
   ============================================================ */
(function () {
  "use strict";

  const WA_NUMBER = "254113591027"; // +254 113 591 027
  const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const money = (n) => "KSh " + Number(n).toLocaleString("en-KE");

  /* ---------------- Toast ---------------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg, ms = 3800) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  /* ---------------- Preloader ---------------- */
  window.addEventListener("load", () => {
    setTimeout(() => $("#preloader").classList.add("done"), 650);
  });
  // safety fallback
  setTimeout(() => $("#preloader")?.classList.add("done"), 3500);

  /* ---------------- Year ---------------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------------- Navbar ---------------- */
  const navbar = $("#navbar");
  const navProgress = $("#navProgress");
  const hamburger = $("#hamburger");
  const navLinks = $("#navLinks");

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    navProgress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  hamburger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ---------------- Scrollspy ---------------- */
  const spyIds = ["home", "finder", "listings", "about", "reviews", "contact"];
  const spyLinks = $$(".nav-link[data-spy]");
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          spyLinks.forEach((l) => l.classList.toggle("active", l.dataset.spy === e.target.id));
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  spyIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) spyObserver.observe(el);
  });

  /* ---------------- Reveal on scroll ---------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------------- Counters ---------------- */
  const counters = $$("[data-count]");
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.count;
        const dur = 1600;
        const t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString("en-KE");
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        countObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => countObserver.observe(c));

  /* ---------------- Hero photo tilt ---------------- */
  const tilt = $(".tilt");
  if (tilt && window.matchMedia("(pointer:fine)").matches) {
    const wrap = tilt.closest(".hero-visual");
    wrap.addEventListener("mousemove", (ev) => {
      const r = wrap.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateZ(6px)`;
    });
    wrap.addEventListener("mouseleave", () => (tilt.style.transform = ""));
  }

  /* ---------------- Budget slider ---------------- */
  const budget = $("#tBudget");
  const budgetOut = $("#budgetOut");
  function syncBudget() {
    if (!budget) return;
    const pct = ((budget.value - budget.min) / (budget.max - budget.min)) * 100;
    budget.style.setProperty("--fill", pct + "%");
    budgetOut.textContent = money(budget.value);
  }
  budget?.addEventListener("input", syncBudget);
  syncBudget();

  /* ---------------- Date minimums ---------------- */
  const today = new Date().toISOString().split("T")[0];
  $("#tViewDate").min = today;
  $("#tMoveDate").min = today;
  $("#tViewDate").addEventListener("change", (e) => {
    const move = $("#tMoveDate");
    if (e.target.value && move.value && move.value < e.target.value) move.value = e.target.value;
    move.min = e.target.value || today;
  });

  /* ---------------- Validation helpers ---------------- */
  function markErrors(form) {
    let firstBad = null;
    $$("input[required], select[required], textarea[required]", form).forEach((f) => {
      const bad = !f.value.trim();
      f.classList.toggle("error", bad);
      if (bad && !firstBad) firstBad = f;
      f.addEventListener("input", () => f.classList.remove("error"), { once: true });
      f.addEventListener("change", () => f.classList.remove("error"), { once: true });
    });
    if (firstBad) {
      firstBad.focus();
      firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return !firstBad;
  }
  function fmtDate(v) {
    if (!v) return "Flexible";
    const d = new Date(v + "T00:00:00");
    return d.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }
  function sendToWhatsApp(msg, okText) {
    window.open(waLink(msg), "_blank", "noopener");
    toast(okText);
  }

  /* ---------------- Tenant form ---------------- */
  $("#tenantForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (!markErrors(f)) return toast("⚠️ Please fill in all required fields.");

    const msg =
`🏠 *NYUMBA HUNT KENYA — TENANT SEARCH* 🏠
Hello! I'd like you to hunt a rental for me:

👤 *Name:* ${f.name.value.trim()}
📞 *Phone:* ${f.phone.value.trim()}
🏘️ *Unit type:* ${f.unitType.value}
📍 *Location:* ${f.location.value}
💰 *Budget:* ${money(f.budget.value)} per month
👀 *Date to come see rentals:* ${fmtDate(f.viewDate.value)}
📦 *Date to move in:* ${fmtDate(f.moveDate.value)}
💧 *Must-haves:* ${f.extras.value}
📝 *Notes:* ${f.notes.value.trim() || "—"}

I understand the charge is a flat *KSh 2,000* (transport to view options provided) until I get my desired rental. Asante!`;

    sendToWhatsApp(msg, "✅ Opening WhatsApp… your search is on its way!");
  });

  /* ---------------- Landlord form ---------------- */
  $("#landlordForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (!markErrors(f)) return toast("⚠️ Please fill in all required fields.");

    const msg =
`🏢 *NYUMBA HUNT KENYA — LANDLORD REGISTRATION* 🏢
Hello! I'd like to register my property and get tenants:

👤 *Name:* ${f.name.value.trim()}
📞 *Phone:* ${f.phone.value.trim()}
📍 *Property location:* ${f.location.value}
🏘️ *Unit types available:* ${f.unitType.value}
🔢 *Vacant units now:* ${f.units.value}
💰 *Monthly rent range:* ${f.rent.value.trim()}
📝 *Amenities / notes:* ${f.notes.value.trim() || "—"}

Kindly register me and start bringing serious tenants. Asante!`;

    sendToWhatsApp(msg, "✅ Opening WhatsApp… registration on its way!");
  });

  /* ---------------- Contact form ---------------- */
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (!markErrors(f)) return toast("⚠️ Please fill in all required fields.");

    const msg =
`✉️ *NYUMBA HUNT KENYA — WEBSITE MESSAGE*
👤 *Name:* ${f.name.value.trim()}
💬 *I am:* ${f.subject.value}

${f.message.value.trim()}`;

    sendToWhatsApp(msg, "✅ Opening WhatsApp… message on its way!");
  });

  /* ---------------- Listing inquire buttons ---------------- */
  $$("[data-wa-unit]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const unit = btn.dataset.waUnit;
      sendToWhatsApp(
`🏠 *Nyumba Hunt Kenya — Listing Enquiry*
Hello! I'm interested in this unit:

▸ ${unit}

Is it still available? I'd like to schedule a viewing (transport provided, flat KSh 2,000 until I get my desired rental).`
      , "💬 Opening WhatsApp for this unit…");
    });
  });

  /* ---------------- Favourite hearts ---------------- */
  $$(".listing-fav").forEach((b) =>
    b.addEventListener("click", () => {
      b.classList.toggle("liked");
      toast(b.classList.contains("liked") ? "❤️ Saved! We'll prioritise similar units for you." : "Removed from favourites.");
    })
  );

  /* ============================================================
     REVIEWS CAROUSEL — 50 reviews · 3 at a time · 5s refresh
     ============================================================ */
  const AV_COLORS = [
    "linear-gradient(135deg,#FF7A1A,#F25C05)",
    "linear-gradient(135deg,#0B63CE,#084B9E)",
    "linear-gradient(135deg,#25D366,#1EBE57)",
    "linear-gradient(135deg,#8E44FF,#5B2BD9)",
    "linear-gradient(135deg,#F25C05,#0B63CE)"
  ];
  const track = $("#reviewsTrack");
  const dotsWrap = $("#revDots");

  // build cards
  track.innerHTML = REVIEWS.map((r, i) => {
    const initials = r.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
    const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
    return `
      <div class="review-card">
        <div class="review-inner">
          <div class="review-top">
            <div class="avatar" style="background:${AV_COLORS[i % AV_COLORS.length]}">${initials}</div>
            <div class="review-name">
              <strong>${r.name}</strong>
              <small>${r.date} · Kasarani/Roysambu</small>
            </div>
          </div>
          <div class="review-stars" aria-label="${r.rating} out of 5">${stars}</div>
          <p class="review-text">${r.text}</p>
          <span class="review-google"><span class="tick">✔</span> Verified by Google</span>
        </div>
      </div>`;
  }).join("");

  const cards = $$(".review-card", track);
  let perView = window.innerWidth <= 720 ? 1 : 3;
  let pages = Math.ceil(cards.length / perView);
  let page = 0;
  let timer = null;

  function buildDots() {
    dotsWrap.innerHTML = "";
    for (let i = 0; i < pages; i++) {
      const d = document.createElement("button");
      d.className = "car-dot" + (i === page ? " active" : "");
      d.setAttribute("aria-label", `Go to reviews page ${i + 1}`);
      d.addEventListener("click", () => { goTo(i); restart(); });
      dotsWrap.appendChild(d);
    }
  }
  function goTo(p) {
    page = ((p % pages) + pages) % pages;
    const cardW = cards[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${page * perView * cardW}px)`;
    $$(".car-dot", dotsWrap).forEach((d, i) => d.classList.toggle("active", i === page));
  }
  function next() { goTo(page + 1); }
  function prev() { goTo(page - 1); }
  function start() { stop(); timer = setInterval(next, 5000); } // refreshes every 5 seconds
  function stop() { if (timer) clearInterval(timer); }
  function restart() { start(); }

  $("#revNext").addEventListener("click", () => { next(); restart(); });
  $("#revPrev").addEventListener("click", () => { prev(); restart(); });

  const carousel = $("#reviewsCarousel");
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("touchstart", stop, { passive: true });

  // touch swipe
  let sx = null;
  carousel.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  carousel.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 45) (dx < 0 ? next() : prev());
    sx = null;
    restart();
  }, { passive: true });

  // responsive rebuild
  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const np = window.innerWidth <= 720 ? 1 : 3;
      if (np !== perView) {
        perView = np;
        pages = Math.ceil(cards.length / perView);
        page = Math.min(page, pages - 1);
        buildDots();
      }
      goTo(page);
    }, 200);
  });

  // start auto-rotation when reviews come into view
  const revObserver = new IntersectionObserver(
    (entries) => (entries[0].isIntersecting ? start() : stop()),
    { threshold: 0.25 }
  );
  buildDots();
  goTo(0);
  revObserver.observe($("#reviews"));

  /* ---------------- Floating WhatsApp nudge ---------------- */
  const waFloat = $("#waFloat");
  setInterval(() => {
    if (window.scrollY > 300) {
      waFloat.classList.add("nudge");
      setTimeout(() => waFloat.classList.remove("nudge"), 800);
    }
  }, 12000);

  /* ---------------- Friendly first-visit toast ---------------- */
  setTimeout(() => {
    if (window.scrollY < 100) toast("👋 Karibu! Tell us your budget & dates — we'll hunt your home.");
  }, 4200);
})();
