"use strict";

const KEY = "stockroom_items_v1";
const COOKIE_KEY = "stockroom_cookie_choice";
// paste an analytics script url here if you want one. also add its domain to script-src in _headers and in the meta tag in index.html
const ANALYTICS_SRC = "";
const MAX_ITEMS = 2000;

let items = [];
const $ = (id) => document.getElementById(id);

// strips control chars and angle brackets, then cuts to max length
function clean(s, max) {
  return String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);
}
function toInt(v, hi) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(0, n)) : 0;
}
function toMoney(v) {
  const n = Math.round(Number(v) * 100) / 100;
  return Number.isFinite(n) ? Math.min(10000000, Math.max(0, n)) : 0;
}
function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
// textContent only, never innerHTML, so item names can't run code
function el(tag, text, cls) {
  const e = document.createElement(tag);
  e.textContent = text;
  if (cls) e.className = cls;
  return e;
}
function say(msg, bad) {
  const p = $("formMsg");
  p.textContent = msg;
  p.className = bad ? "bad" : "";
}

// local storage can be edited by anyone, so every field gets checked again on load
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, MAX_ITEMS).map((r) => ({
      id: clean(r.id, 40) || newId(),
      name: clean(r.name, 60),
      sku: clean(r.sku, 20),
      cat: clean(r.cat, 30),
      qty: toInt(r.qty, 1000000),
      price: toMoney(r.price),
      min: toInt(r.min, 1000000),
    })).filter((r) => r.name);
  } catch (e) {
    return [];
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (e) {
    say("Could not save. Your browser storage may be full or turned off.", true);
  }
}

function skeleton() {
  const body = $("rows");
  for (let i = 0; i < 5; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      const td = document.createElement("td");
      td.append(el("span", "", "skel"));
      tr.append(td);
    }
    body.append(tr);
  }
}

function button(label, aria, fn) {
  const b = el("button", label);
  b.type = "button";
  b.setAttribute("aria-label", aria);
  b.addEventListener("click", fn);
  return b;
}

function render() {
  const q = $("search").value.toLowerCase();
  const lowOnly = $("lowOnly").checked;
  const body = $("rows");
  body.replaceChildren();

  let units = 0, value = 0, low = 0;
  items.forEach((it) => {
    units += it.qty;
    value += it.qty * it.price;
    if (it.qty <= it.min) low++;
  });
  $("sItems").textContent = items.length;
  $("sUnits").textContent = units.toLocaleString();
  $("sValue").textContent = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  $("sLow").textContent = low;

  const shown = items.filter((it) => {
    if (lowOnly && it.qty > it.min) return false;
    return (it.name + " " + it.sku + " " + it.cat).toLowerCase().includes(q);
  });
  shown.forEach((it) => {
    const tr = document.createElement("tr");
    const isLow = it.qty <= it.min;
    tr.append(
      el("td", it.name), el("td", it.sku || "none"), el("td", it.cat || "none"),
      el("td", String(it.qty)), el("td", it.price.toFixed(2)),
      el("td", isLow ? "Low" : "OK", isLow ? "low" : "")
    );
    const act = document.createElement("td");
    act.append(
      button("-1", "Remove one " + it.name, () => change(it.id, -1)),
      button("+1", "Add one " + it.name, () => change(it.id, 1)),
      button("Edit", "Edit " + it.name, () => edit(it.id)),
      button("Delete", "Delete " + it.name, () => remove(it.id))
    );
    tr.append(act);
    body.append(tr);
  });
  $("empty").hidden = shown.length > 0;
}

function find(id) {
  return items.find((x) => x.id === id);
}
function change(id, d) {
  const it = find(id);
  if (!it) return;
  it.qty = toInt(it.qty + d, 1000000);
  save();
  render();
}
function remove(id) {
  const it = find(id);
  if (!it || !confirm("Delete " + it.name + "? This cannot be undone.")) return;
  items = items.filter((x) => x.id !== id);
  save();
  render();
}
function edit(id) {
  const it = find(id);
  if (!it) return;
  $("itemId").value = it.id;
  $("name").value = it.name;
  $("sku").value = it.sku;
  $("cat").value = it.cat;
  $("qty").value = it.qty;
  $("price").value = it.price;
  $("min").value = it.min;
  $("formTitle").textContent = "Edit item";
  $("saveBtn").textContent = "Save changes";
  $("cancelBtn").hidden = false;
  say("");
  $("add").scrollIntoView();
  $("name").focus();
}
function resetForm() {
  $("itemForm").reset();
  $("itemId").value = "";
  $("formTitle").textContent = "Add an item";
  $("saveBtn").textContent = "Add item";
  $("cancelBtn").hidden = true;
}

$("itemForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if ($("website").value) return; // bots fill the hidden box, people don't
  const id = $("itemId").value;
  const name = clean($("name").value, 60);
  const sku = clean($("sku").value, 20).toUpperCase();
  const cat = clean($("cat").value, 30);
  const qtyText = $("qty").value.trim();
  const priceText = $("price").value.trim();
  const minText = $("min").value.trim();

  if (!name) return say("Type a name for the item.", true);
  if (!/^[A-Z0-9-]*$/.test(sku)) return say("The SKU can only have letters, numbers and dashes.", true);
  if (!/^\d{1,7}$/.test(qtyText) || Number(qtyText) > 1000000) return say("Quantity must be a whole number from 0 to 1,000,000.", true);
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(priceText) || Number(priceText) > 10000000) return say("Price must be a number like 4.50.", true);
  if (!/^\d{1,7}$/.test(minText) || Number(minText) > 1000000) return say("Warn me at must be a whole number from 0 to 1,000,000.", true);
  if (sku && items.some((x) => x.sku === sku && x.id !== id)) return say("Another item already uses that SKU.", true);
  if (!id && items.length >= MAX_ITEMS) return say("You hit the limit of 2000 items. Delete some first.", true);

  const data = { name, sku, cat, qty: Number(qtyText), price: Number(priceText), min: Number(minText) };
  const old = id ? find(id) : null;
  if (old) Object.assign(old, data);
  else items.push({ id: newId(), ...data });
  save();
  render();
  resetForm();
  say("Saved " + name + ".");
});

$("cancelBtn").addEventListener("click", () => { resetForm(); say(""); });
$("search").addEventListener("input", render);
$("lowOnly").addEventListener("change", render);
$("cta").addEventListener("click", () => setTimeout(() => $("name").focus(), 0));

// cookie banner. analytics stays off unless they click yes
function loadAnalytics() {
  if (!ANALYTICS_SRC) return;
  const s = document.createElement("script");
  s.src = ANALYTICS_SRC;
  s.async = true;
  document.head.append(s);
}
function pick(choice) {
  try { localStorage.setItem(COOKIE_KEY, choice); } catch (e) {}
  $("cookie").hidden = true;
  if (choice === "yes") loadAnalytics();
}
let choice = null;
try { choice = localStorage.getItem(COOKIE_KEY); } catch (e) {}
if (choice === "yes") loadAnalytics();
if (!choice) $("cookie").hidden = false;
$("yes").addEventListener("click", () => pick("yes"));
$("no").addEventListener("click", () => pick("no"));

skeleton();
setTimeout(() => { items = load(); render(); }, 600);