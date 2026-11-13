const BASE_PRICE = 4.8;
const form = document.querySelector("[data-customizer]");
const priceOutput = document.querySelector("[data-total-price]");
const summaryOutput = document.querySelector("[data-summary]");
const quantityOutput = document.querySelector("[data-quantity]");
const toast = document.querySelector("[data-toast]");
const toastSummary = document.querySelector("[data-toast-summary]");
let quantity = 1;
let toastTimer;

function selectedValue(name) {
  return form.querySelector(`input[name="${name}"]:checked`);
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function currentSelections() {
  const size = selectedValue("size");
  const milk = selectedValue("milk");
  const addons = [...form.querySelectorAll("[data-addon][aria-pressed='true']")];
  const unitPrice = BASE_PRICE + [size, milk, ...addons]
    .reduce((total, option) => total + Number(option.dataset.price), 0);

  return {
    size,
    milk,
    addons,
    unitPrice
  };
}

function renderOrder() {
  const selections = currentSelections();
  const extras = selections.addons.length
    ? ` · ${selections.addons.map((addon) => addon.dataset.label).join(", ")}`
    : "";

  summaryOutput.textContent =
    `${selections.size.dataset.label} · ${selections.milk.dataset.label}${extras}`;
  priceOutput.textContent = money(selections.unitPrice * quantity);
  quantityOutput.value = quantity;
  quantityOutput.textContent = quantity;
}

form.addEventListener("change", (event) => {
  if (event.target.matches("input[type='radio']")) {
    renderOrder();
  }
});

form.addEventListener("input", (event) => {
  if (event.target.name === "notes") {
    document.querySelector("[data-char-count]").textContent = event.target.value.length;
  }
});

form.querySelectorAll("[data-addon]").forEach((button) => {
  button.addEventListener("click", () => {
    button.setAttribute("aria-pressed", button.getAttribute("aria-pressed") !== "true");
    renderOrder();
  });
});

document.querySelector("[data-decrease]").addEventListener("click", () => {
  quantity = Math.max(1, quantity - 1);
  renderOrder();
});

document.querySelector("[data-increase]").addEventListener("click", () => {
  quantity = Math.min(8, quantity + 1);
  renderOrder();
});

document.querySelector("[data-favorite]").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const isFavorite = button.getAttribute("aria-pressed") === "true";
  button.setAttribute("aria-pressed", String(!isFavorite));
  button.setAttribute(
    "aria-label",
    isFavorite ? "Save Java to favorites" : "Remove Java from favorites"
  );
});

document.querySelector("[data-back]").addEventListener("click", () => {
  if (history.length > 1) {
    history.back();
  } else {
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

document.querySelector("[data-order]").addEventListener("click", () => {
  const selections = currentSelections();
  toastSummary.textContent =
    `${quantity} House Latte${quantity > 1 ? "s" : ""} · ${money(selections.unitPrice * quantity)}`;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
});

renderOrder();

const demoParams = new URLSearchParams(window.location.search);
if (demoParams.has("showFixed")) {
  const revealFixedState = () => {
    requestAnimationFrame(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
  };

  revealFixedState();
  window.addEventListener("load", revealFixedState, { once: true });
}
