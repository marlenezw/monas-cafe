const MENU = [
  {
    section: "Espresso Bar",
    items: [
      { name: "Espresso Merge",    price: "$3.50", desc: "Double shot, zero conflicts.",              chip: "house favourite" },
      { name: "Latte Rebase",      price: "$4.25", desc: "Interactive, with oat milk.",               chip: "new" },
      { name: "Flat White Fork",   price: "$4.00", desc: "Same base, slightly different history.",    chip: null },
      { name: "Cortado Commit",    price: "$3.75", desc: "Small, dense, and well described.",         chip: null }
    ]
  },
  {
    section: "Brew Bar",
    items: [
      { name: "Cold Brew Branch",  price: "$4.75", desc: "Steeped 18 hours, well off main.",          chip: null },
      { name: "Pour Over Push",    price: "$5.25", desc: "Single origin, Ethiopia. Slow and worth it.", chip: null },
      { name: "Octo Chai",         price: "$4.50", desc: "Eight spices. Obviously.",                  chip: "seasonal" }
    ]
  },
  {
    section: "From the Bakery",
    items: [
      { name: "Merge Conflict Croissant", price: "$3.95", desc: "Flaky, but it resolves beautifully.", chip: null },
      { name: "Blame Bagel",              price: "$4.50", desc: "Everything seasoning. We know who did it.", chip: null },
      { name: "Stash Scone",              price: "$3.25", desc: "Saved for later. Still warm.",       chip: null }
    ]
  }
];

/**
 * Prices arrive from the CMS pre-formatted ("$3.50", and occasionally
 * "$1,234.50"). Handing that string straight to parseFloat makes it stop at the
 * leading "$" and return NaN, so strip everything that isn't part of the number
 * before parsing.
 */
function toNumber(raw) {
  return parseFloat(String(raw).replace(/[^0-9.]/g, ""));
}

function formatPrice(value) {
  return "$" + value.toFixed(2);
}

function render() {
  const board = document.getElementById("board-sections");
  let subtotal = 0;
  let failures = 0;
  let total = 0;

  board.innerHTML = MENU.map((group) => {
    const rows = group.items.map((item) => {
      const value = toNumber(item.price);
      const broken = Number.isNaN(value);

      if (broken) failures++;
      subtotal += value;
      total++;

      return `
        <div class="row">
          <div class="row-main">
            <h4>${item.name}${item.chip ? `<span class="chip">${item.chip}</span>` : ""}</h4>
            <p>${item.desc}</p>
          </div>
          <div class="leader"></div>
          <div class="price${broken ? " is-broken" : ""}">${formatPrice(value)}</div>
        </div>`;
    }).join("");

    return `<section class="menu-section"><h3>${group.section}</h3>${rows}</section>`;
  }).join("");

  const grand = document.getElementById("grand-total");
  grand.textContent = formatPrice(subtotal + subtotal * 0.0875);
  grand.classList.toggle("is-broken", failures > 0);

  if (failures > 0) {
    document.getElementById("error-banner").classList.add("show");
    console.error(
      `MenuPriceError: parseFloat() returned NaN for ${failures} of ${total} items. ` +
      `Currency symbol was not stripped before parsing.`
    );
  }
}

render();
