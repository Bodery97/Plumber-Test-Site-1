function $(sel, root = document) {
  return root.querySelector(sel);
}

function setStatus(el, msg, kind) {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("ok", "err");
  if (kind) el.classList.add(kind);
}

function requiredFields(form) {
  return Array.from(form.querySelectorAll("[required]"));
}

function validate(form) {
  const fields = requiredFields(form);
  const invalid = [];

  for (const el of fields) {
    const value = (el.value || "").trim();
    const isEmail = el.getAttribute("type") === "email";
    const ok = value.length > 0 && (!isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    if (!ok) invalid.push(el);
  }

  return { ok: invalid.length === 0, invalid };
}

function buildMailto({ to, subject, body }) {
  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}

function attachMailtoForm({
  formSelector,
  statusSelector,
  toEmail,
  subjectBuilder,
  bodyBuilder,
}) {
  const form = $(formSelector);
  const status = $(statusSelector);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    setStatus(status, "", null);

    const { ok, invalid } = validate(form);
    if (!ok) {
      invalid[0]?.focus?.();
      setStatus(status, "Please fill out the required fields.", "err");
      return;
    }

    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    const href = buildMailto({
      to: toEmail,
      subject: subjectBuilder(payload),
      body: bodyBuilder(payload),
    });

    setStatus(status, "Opening your email app…", "ok");
    window.location.href = href;
    form.reset();
  });
}

// Mobile nav toggle
(() => {
  const btn = $("#menuBtn");
  const nav = $("#mobileNav");
  if (!btn || !nav) return;

  function setOpen(open) {
    btn.setAttribute("aria-expanded", String(open));
    nav.hidden = !open;
  }

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  nav.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.tagName === "A") setOpen(false);
  });

  // Close on resize to desktop
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 981px)").matches) setOpen(false);
  });
})();

// Quote form (top card)
attachMailtoForm({
  formSelector: "#quoteForm",
  statusSelector: "#formStatus",
  toEmail: "service@bostonharborplumbing.com",
  subjectBuilder: (p) => `Quote request — ${p.service || "Plumbing"}`,
  bodyBuilder: (p) =>
    [
      "New quote request",
      "------------------",
      `Name: ${p.name}`,
      `Phone: ${p.phone}`,
      `Service: ${p.service}`,
      "",
      "Message:",
      p.message,
    ].join("\n"),
});

// Contact form (bottom)
attachMailtoForm({
  formSelector: "#contactForm",
  statusSelector: "#contactStatus",
  toEmail: "service@bostonharborplumbing.com",
  subjectBuilder: () => "Service request — Boston Harbor Plumbing website",
  bodyBuilder: (p) =>
    [
      "New service request",
      "-------------------",
      `Name: ${p.name}`,
      `Email: ${p.email}`,
      "",
      "Message:",
      p.message,
    ].join("\n"),
});

// Footer year
(() => {
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

