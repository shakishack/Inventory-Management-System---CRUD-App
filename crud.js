import { orders, generateId } from "./data.js";

// --- UTILS ---

function formatUSD(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function line(len = 110) {
  console.log("-".repeat(len));
}

// --- READ ALL ---

export function readAll() {
  console.log("\n ORDER LIST");
  line();
  console.log(
    ` ${"ID".padEnd(4)} ${"Product Name".padEnd(38)} ${"Category".padEnd(14)} ${"Qty".padEnd(5)} ${"List Price".padEnd(12)} ${"Profit".padEnd(11)} ${"Status".padEnd(10)} ${"Customer"}`
  );
  line();

  if (orders.length === 0) {
    console.log("  No orders found.");
    line();
    return;
  }

  orders.forEach((o) => {
    console.log(
      ` ${String(o.id).padEnd(4)} ${o.productName.substring(0, 37).padEnd(38)} ${o.category.padEnd(14)} ${String(o.quantity).padEnd(5)} ${formatUSD(o.listPrice).padEnd(12)} ${formatUSD(o.profit).padEnd(11)} ${o.status.padEnd(10)} ${o.customerName}`
    );
  });

  line();
  console.log(` Total orders: ${orders.length}`);
}

// --- READ ONE ---

export function readById(id) {
  const order = orders.find((o) => o.id === id);

  if (!order) {
    console.log(`\n  [x] Order with ID ${id} not found.`);
    return null;
  }

  console.log("\n ORDER DETAIL");
  line(60);
  console.log(`  ID            : ${order.id}`);
  console.log(`  Product Name  : ${order.productName}`);
  console.log(`  Category      : ${order.category}`);
  console.log(`  Description   : ${order.description}`);
  console.log(`  Standard Cost : ${formatUSD(order.standardCost)}`);
  console.log(`  List Price    : ${formatUSD(order.listPrice)}`);
  console.log(`  Profit        : ${formatUSD(order.profit)}`);
  console.log(`  Quantity      : ${order.quantity} units`);
  console.log(`  Status        : ${order.status}`);
  console.log(`  Warehouse     : ${order.warehouse}`);
  console.log(`  Customer      : ${order.customerName}`);
  console.log(`  Order Date    : ${order.orderDate}`);
  line(60);

  return order;
}

// --- CREATE ---

export function create(data) {
  const newOrder = {
    id: generateId(),
    productName: data.productName,
    category: data.category,
    description: data.description || "-",
    standardCost: parseFloat(data.standardCost) || 0,
    listPrice: parseFloat(data.listPrice) || 0,
    profit: parseFloat(data.profit) || 0,
    quantity: parseInt(data.quantity) || 0,
    status: data.status || "Pending",
    warehouse: data.warehouse || "-",
    customerName: data.customerName,
    orderDate:
      data.orderDate ||
      (() => {
        const d = new Date();
        return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
      })(),
  };

  orders.push(newOrder);
  console.log(`\n  [+] Order created: "${newOrder.productName}" (ID: ${newOrder.id})`);
  return newOrder;
}

// --- UPDATE ---

export function update(id, data) {
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    console.log(`\n  [x] Order with ID ${id} not found.`);
    return null;
  }

  const before = { ...orders[index] };

  const fields = ["productName", "category", "description", "warehouse", "customerName", "orderDate", "status"];
  fields.forEach((f) => {
    if (data[f] && data[f].trim() !== "") orders[index][f] = data[f].trim();
  });

  const numFields = ["standardCost", "listPrice", "profit", "quantity"];
  numFields.forEach((f) => {
    if (data[f] && data[f].trim() !== "") {
      orders[index][f] = f === "quantity" ? parseInt(data[f]) : parseFloat(data[f]);
    }
  });

  console.log(`\n  [~] Order ID ${id} ("${before.productName}") updated successfully.`);
  return orders[index];
}

// --- DELETE ---

export function deleteById(id) {
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    console.log(`\n  [x] Order with ID ${id} not found.`);
    return false;
  }

  const deleted = orders.splice(index, 1)[0];
  console.log(`\n  [-] Deleted: "${deleted.productName}" (ID: ${id})`);
  return true;
}

// --- SEARCH ---

export function search(keyword) {
  const kw = keyword.toLowerCase();
  const results = orders.filter(
    (o) =>
      o.productName.toLowerCase().includes(kw) ||
      o.category.toLowerCase().includes(kw) ||
      o.customerName.toLowerCase().includes(kw) ||
      o.status.toLowerCase().includes(kw) ||
      o.warehouse.toLowerCase().includes(kw)
  );

  console.log(`\n SEARCH RESULTS: "${keyword}"`);
  line();

  if (results.length === 0) {
    console.log(`  No orders found matching "${keyword}".`);
    line();
    return [];
  }

  results.forEach((o) => {
    console.log(
      `  [${o.id}] ${o.productName} | ${o.category} | Qty: ${o.quantity} | ${formatUSD(o.listPrice)} | ${o.status} | ${o.customerName}`
    );
  });

  line();
  console.log(`  Found: ${results.length} order(s).`);
  return results;
}

// --- FILTER BY STATUS ---

export function filterByStatus(status) {
  const results = orders.filter(
    (o) => o.status.toLowerCase() === status.toLowerCase()
  );

  console.log(`\n FILTER BY STATUS: "${status}"`);
  line();

  if (results.length === 0) {
    console.log(`  No orders with status "${status}".`);
    line();
    return [];
  }

  results.forEach((o) => {
    console.log(
      `  [${o.id}] ${o.productName} | ${o.category} | Qty: ${o.quantity} | ${formatUSD(o.listPrice)} | ${o.customerName}`
    );
  });

  line();
  console.log(`  Found: ${results.length} order(s).`);
  return results;
}

// --- SUMMARY ---

export function summary() {
  console.log("\n ORDER SUMMARY");
  line(60);

  if (orders.length === 0) {
    console.log("  No orders available.");
    line(60);
    return;
  }

  const totalOrders  = orders.length;
  const totalQty     = orders.reduce((s, o) => s + o.quantity, 0);
  const totalRevenue = orders.reduce((s, o) => s + o.listPrice * o.quantity, 0);
  const totalProfit  = orders.reduce((s, o) => s + o.profit * o.quantity, 0);

  const byStatus = {};
  const byCategory = {};
  orders.forEach((o) => {
    byStatus[o.status]     = (byStatus[o.status] || 0) + 1;
    byCategory[o.category] = (byCategory[o.category] || 0) + 1;
  });

  const topProfit = [...orders].sort((a, b) => b.profit - a.profit)[0];

  console.log(`  Total Orders        : ${totalOrders}`);
  console.log(`  Total Quantity      : ${totalQty} units`);
  console.log(`  Total Revenue       : ${formatUSD(totalRevenue)}`);
  console.log(`  Total Profit        : ${formatUSD(totalProfit)}`);
  console.log(`  Highest Profit Item : [ID:${topProfit.id}] ${topProfit.productName} (${formatUSD(topProfit.profit)}/unit)`);

  console.log(`\n  By Status:`);
  Object.entries(byStatus).forEach(([s, c]) => console.log(`    ${s.padEnd(12)}: ${c} orders`));

  console.log(`\n  By Category:`);
  Object.entries(byCategory).forEach(([c, n]) => console.log(`    ${c.padEnd(14)}: ${n} orders`));

  line(60);
}
