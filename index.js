import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import {
  readAll,
  readById,
  create,
  update,
  deleteById,
  search,
  filterByStatus,
  summary,
} from "./crud.js";

// --- SETUP ---

const rl = readline.createInterface({ input, output });

async function ask(question) {
  return await rl.question(`  ${question}`);
}

async function pressEnter() {
  await ask("\n  Press [Enter] to return to menu...");
}

// --- HEADER ---

function printHeader() {
  console.clear();
  console.log("=".repeat(60));
  console.log("        ORDER MANAGEMENT SYSTEM");
  console.log("        Freelance IT & Application Developer");
  console.log("=".repeat(60));
}

// --- MENU ---

async function menu() {
  printHeader();

  console.log("\n  MAIN MENU");
  console.log("  " + "-".repeat(40));
  console.log("  [1] List All Orders        (Read All)");
  console.log("  [2] Order Detail by ID     (Read One)");
  console.log("  [3] Add New Order          (Create)");
  console.log("  [4] Edit Order             (Update)");
  console.log("  [5] Delete Order           (Delete)");
  console.log("  [6] Search Orders          (Search)");
  console.log("  [7] Filter by Status       (Filter)");
  console.log("  [8] Summary & Stats        (Summary)");
  console.log("  [9] Exit");
  console.log("  " + "-".repeat(40));

  const choice = await ask("\n  Select menu [1-9]: ");

  switch (choice.trim()) {
    case "1":
      await handleReadAll();
      break;
    case "2":
      await handleReadById();
      break;
    case "3":
      await handleCreate();
      break;
    case "4":
      await handleUpdate();
      break;
    case "5":
      await handleDelete();
      break;
    case "6":
      await handleSearch();
      break;
    case "7":
      await handleFilterStatus();
      break;
    case "8":
      await handleSummary();
      break;
    case "9":
      await handleExit();
      return;
    default:
      console.log("\n  [!] Invalid choice. Enter a number between 1-9.");
      await pressEnter();
      await menu();
  }
}

// --- HANDLERS ---

async function handleReadAll() {
  printHeader();
  readAll();
  await pressEnter();
  await menu();
}

async function handleReadById() {
  printHeader();
  const input = await ask("Enter Order ID: ");
  const id = parseInt(input.trim());

  if (isNaN(id)) {
    console.log("\n  [!] ID must be a number.");
  } else {
    readById(id);
  }

  await pressEnter();
  await menu();
}

async function handleCreate() {
  printHeader();
  console.log("\n  ADD NEW ORDER\n");

  const productName = await ask("Product Name       : ");
  const category = await ask("Category           : ");
  const description = await ask("Description        : ");
  const standardCost = await ask("Standard Cost ($)  : ");
  const listPrice = await ask("List Price ($)      : ");
  const profit = await ask("Profit ($)         : ");
  const quantity = await ask("Quantity           : ");
  const status = await ask("Status (Shipped/Pending/Canceled): ");
  const warehouse = await ask("Warehouse          : ");
  const customerName = await ask("Customer Name      : ");
  const orderDate = await ask("Order Date (dd-mm-yyyy): ");

  if (!productName.trim()) {
    console.log("\n  [!] Product name cannot be empty.");
  } else {
    create({
      productName,
      category,
      description,
      standardCost,
      listPrice,
      profit,
      quantity,
      status,
      warehouse,
      customerName,
      orderDate,
    });
  }

  await pressEnter();
  await menu();
}

async function handleUpdate() {
  printHeader();
  console.log("\n  EDIT ORDER\n");

  const input = await ask("Enter Order ID to edit: ");
  const id = parseInt(input.trim());

  if (isNaN(id)) {
    console.log("\n  [!] ID must be a number.");
    await pressEnter();
    return await menu();
  }

  const order = readById(id);
  if (!order) {
    await pressEnter();
    return await menu();
  }

  console.log("\n  (Leave blank to keep current value)\n");

  const productName = await ask(`Product Name       [${order.productName}]: `);
  const category = await ask(`Category           [${order.category}]: `);
  const description = await ask(`Description        [${order.description}]: `);
  const standardCost = await ask(
    `Standard Cost      [${order.standardCost}]: `,
  );
  const listPrice = await ask(`List Price         [${order.listPrice}]: `);
  const profit = await ask(`Profit             [${order.profit}]: `);
  const quantity = await ask(`Quantity           [${order.quantity}]: `);
  const status = await ask(`Status             [${order.status}]: `);
  const warehouse = await ask(`Warehouse          [${order.warehouse}]: `);
  const customerName = await ask(
    `Customer Name      [${order.customerName}]: `,
  );
  const orderDate = await ask(`Order Date         [${order.orderDate}]: `);

  update(id, {
    productName,
    category,
    description,
    standardCost,
    listPrice,
    profit,
    quantity,
    status,
    warehouse,
    customerName,
    orderDate,
  });

  await pressEnter();
  await menu();
}

async function handleDelete() {
  printHeader();
  console.log("\n  DELETE ORDER\n");

  readAll();

  const input = await ask("\n  Enter Order ID to delete: ");
  const id = parseInt(input.trim());

  if (isNaN(id)) {
    console.log("\n  [!] ID must be a number.");
    await pressEnter();
    return await menu();
  }

  const confirm = await ask(`\n  [!] Confirm delete Order ID ${id}? (y/n): `);

  if (confirm.trim().toLowerCase() === "y") {
    deleteById(id);
  } else {
    console.log("\n  [-] Delete canceled.");
  }

  await pressEnter();
  await menu();
}

async function handleSearch() {
  printHeader();
  console.log("\n  SEARCH ORDERS\n");

  const keyword = await ask(
    "Enter keyword (product/category/customer/status): ",
  );

  if (!keyword.trim()) {
    console.log("\n  [!] Keyword cannot be empty.");
  } else {
    search(keyword.trim());
  }

  await pressEnter();
  await menu();
}

async function handleFilterStatus() {
  printHeader();
  console.log("\n  FILTER BY STATUS\n");
  console.log("  Available statuses: Shipped | Pending | Canceled\n");

  const status = await ask("Enter status: ");

  if (!status.trim()) {
    console.log("\n  [!] Status cannot be empty.");
  } else {
    filterByStatus(status.trim());
  }

  await pressEnter();
  await menu();
}

async function handleSummary() {
  printHeader();
  summary();
  await pressEnter();
  await menu();
}

async function handleExit() {
  console.log("\n  " + "=".repeat(40));
  console.log("  Thank you for using Order Management System.");
  console.log("  Goodbye!");
  console.log("  " + "=".repeat(40) + "\n");
  rl.close();
  process.exit(0);
}

// --- START ---

menu();
