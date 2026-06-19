const { clone, readDatabase, updateDatabase } = require("../repositories/local-store");

function nowIso() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createId(prefix) {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${date}-${random}`;
}

function asNumber(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
}

function assertPositiveQuantity(quantity) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    const error = new Error("Jumlah harus lebih dari 0.");
    error.status = 400;
    throw error;
  }
}

function assertNonNegative(value, fieldName) {
  if (!Number.isFinite(value) || value < 0) {
    const error = new Error(`${fieldName} tidak boleh negatif.`);
    error.status = 400;
    throw error;
  }
}

function requireRole(user, allowedRoles) {
  if (!user || !allowedRoles.includes(user.role)) {
    const error = new Error("Anda tidak memiliki akses untuk aksi ini.");
    error.status = 403;
    throw error;
  }
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  };
}

function matchesSearch(product, search) {
  if (!search) return true;
  const haystack = `${product.code} ${product.name}`.toLowerCase();
  return haystack.includes(String(search).toLowerCase());
}

function productStatus(product) {
  if (product.status === "inactive") return "inactive";
  if (product.stock === 0) return "empty";
  if (product.stock <= product.minStock) return "low";
  return "safe";
}

function filterProducts(products, query = {}) {
  return products.filter((product) => {
    const category = query.category || query.kategori;
    const stockStatus = query.stockStatus || query.statusStok;
    const status = query.status;
    return (
      matchesSearch(product, query.search) &&
      (!category || product.category === category) &&
      (!status || product.status === status) &&
      (!stockStatus || productStatus(product) === stockStatus)
    );
  });
}

function dashboardStats(database) {
  const products = database.products.filter((product) => product.status === "active");
  const currentDate = today();
  const stockInToday = database.stockIn
    .filter((item) => item.transactionDate === currentDate)
    .reduce((sum, item) => sum + Number(item.quantity), 0);
  const stockOutToday = database.stockOut
    .filter((item) => item.transactionDate === currentDate)
    .reduce((sum, item) => sum + Number(item.quantity), 0);

  return {
    totalProducts: products.length,
    totalStock: products.reduce((sum, item) => sum + Number(item.stock), 0),
    lowStock: products.filter((item) => item.stock <= item.minStock && item.stock > 0).length,
    emptyStock: products.filter((item) => item.stock === 0).length,
    stockInToday,
    stockOutToday,
    restockProducts: products
      .filter((item) => item.stock <= item.minStock)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10),
    latestMovements: [...database.movements].reverse().slice(0, 10)
  };
}

async function login(email, password) {
  const database = await readDatabase();
  if (password !== "password") {
    const error = new Error("Email atau password tidak sesuai.");
    error.status = 401;
    throw error;
  }

  const user = database.users.find(
    (item) => item.email.toLowerCase() === String(email || "").toLowerCase() && item.status === "active"
  );

  if (!user) {
    const error = new Error("Email atau password tidak sesuai.");
    error.status = 401;
    throw error;
  }

  return {
    user: publicUser(user),
    token: Buffer.from(`${user.id}:${Date.now()}`).toString("base64url")
  };
}

async function getUserById(userId) {
  const database = await readDatabase();
  return publicUser(database.users.find((user) => user.id === userId && user.status === "active"));
}

async function getBootstrapData() {
  const database = await readDatabase();
  return {
    users: database.users.map(publicUser),
    categories: database.categories,
    settings: database.settings
  };
}

async function getDashboard() {
  const database = await readDatabase();
  return dashboardStats(database);
}

async function listProducts(query) {
  const database = await readDatabase();
  return filterProducts(database.products, query);
}

async function createProduct(input, actor) {
  requireRole(actor, ["owner", "admin"]);
  return updateDatabase((database) => {
    const stock = asNumber(input.stock ?? input.initialStock, 0);
    const minStock = asNumber(input.minStock, 0);
    const purchasePrice = asNumber(input.purchasePrice, 0);
    const sellingPrice = asNumber(input.sellingPrice, 0);

    assertNonNegative(stock, "Stok");
    assertNonNegative(minStock, "Minimal stok");
    assertNonNegative(purchasePrice, "Harga beli");
    assertNonNegative(sellingPrice, "Harga jual");

    if (!input.code || !input.name || !input.category || !input.unit) {
      const error = new Error("Kode, nama barang, kategori, dan satuan wajib diisi.");
      error.status = 400;
      throw error;
    }

    const duplicate = database.products.find(
      (product) => product.code.toLowerCase() === String(input.code).toLowerCase()
    );
    if (duplicate) {
      const error = new Error("Kode barang sudah digunakan.");
      error.status = 409;
      throw error;
    }

    const product = {
      id: createId("PRD"),
      code: String(input.code).trim(),
      name: String(input.name).trim(),
      category: String(input.category).trim(),
      unit: String(input.unit).trim(),
      stock,
      minStock,
      location: String(input.location || "").trim(),
      purchasePrice,
      sellingPrice,
      notes: String(input.notes || "").trim(),
      status: input.status === "inactive" ? "inactive" : "active",
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    database.products.push(product);

    if (stock > 0) {
      database.movements.push({
        id: createId("MOV"),
        movementDate: today(),
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        type: "INITIAL",
        quantity: stock,
        stockBefore: 0,
        stockAfter: stock,
        refId: product.id,
        refType: "product",
        notes: "Stok awal barang",
        createdBy: actor.id,
        createdAt: nowIso()
      });
    }

    return clone(product);
  });
}

async function updateProduct(id, input, actor) {
  requireRole(actor, ["owner", "admin"]);
  return updateDatabase((database) => {
    const product = database.products.find((item) => item.id === id);
    if (!product) {
      const error = new Error("Produk tidak ditemukan.");
      error.status = 404;
      throw error;
    }

    const duplicate = database.products.find(
      (item) => item.id !== id && item.code.toLowerCase() === String(input.code || product.code).toLowerCase()
    );
    if (duplicate) {
      const error = new Error("Kode barang sudah digunakan.");
      error.status = 409;
      throw error;
    }

    const minStock = asNumber(input.minStock ?? product.minStock, product.minStock);
    const purchasePrice = asNumber(input.purchasePrice ?? product.purchasePrice, product.purchasePrice);
    const sellingPrice = asNumber(input.sellingPrice ?? product.sellingPrice, product.sellingPrice);
    assertNonNegative(minStock, "Minimal stok");
    assertNonNegative(purchasePrice, "Harga beli");
    assertNonNegative(sellingPrice, "Harga jual");

    Object.assign(product, {
      code: String(input.code || product.code).trim(),
      name: String(input.name || product.name).trim(),
      category: String(input.category || product.category).trim(),
      unit: String(input.unit || product.unit).trim(),
      minStock,
      location: String(input.location ?? product.location ?? "").trim(),
      purchasePrice,
      sellingPrice,
      notes: String(input.notes ?? product.notes ?? "").trim(),
      status: input.status === "inactive" ? "inactive" : "active",
      updatedAt: nowIso()
    });

    return clone(product);
  });
}

async function deactivateProduct(id, actor) {
  requireRole(actor, ["owner", "admin"]);
  return updateDatabase((database) => {
    const product = database.products.find((item) => item.id === id);
    if (!product) {
      const error = new Error("Produk tidak ditemukan.");
      error.status = 404;
      throw error;
    }

    product.status = "inactive";
    product.updatedAt = nowIso();
    return clone(product);
  });
}

async function createStockIn(input, actor) {
  requireRole(actor, ["owner", "admin", "staff"]);
  return updateDatabase((database) => {
    const product = database.products.find((item) => item.id === input.productId && item.status === "active");
    const quantity = asNumber(input.quantity, NaN);

    if (!product) {
      const error = new Error("Produk tidak ditemukan atau sudah tidak aktif.");
      error.status = 404;
      throw error;
    }
    assertPositiveQuantity(quantity);

    const stockBefore = product.stock;
    const stockAfter = stockBefore + quantity;
    const transaction = {
      id: createId("SIN"),
      transactionDate: input.transactionDate || today(),
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      quantity,
      supplierName: String(input.supplierName || "").trim(),
      invoiceNumber: String(input.invoiceNumber || "").trim(),
      notes: String(input.notes || "").trim(),
      createdBy: actor.id,
      createdAt: nowIso()
    };

    product.stock = stockAfter;
    product.updatedAt = nowIso();
    database.stockIn.push(transaction);
    database.movements.push({
      id: createId("MOV"),
      movementDate: transaction.transactionDate,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      type: "IN",
      quantity,
      stockBefore,
      stockAfter,
      refId: transaction.id,
      refType: "stock_in",
      notes: transaction.notes || `Barang masuk dari ${transaction.supplierName || "supplier"}`,
      createdBy: actor.id,
      createdAt: nowIso()
    });

    return clone({ transaction, product });
  });
}

async function createStockOut(input, actor) {
  requireRole(actor, ["owner", "admin", "staff"]);
  return updateDatabase((database) => {
    const product = database.products.find((item) => item.id === input.productId && item.status === "active");
    const quantity = asNumber(input.quantity, NaN);

    if (!product) {
      const error = new Error("Produk tidak ditemukan atau sudah tidak aktif.");
      error.status = 404;
      throw error;
    }
    assertPositiveQuantity(quantity);

    if (quantity > product.stock) {
      const error = new Error(`Stok tidak mencukupi. Stok tersedia hanya ${product.stock}.`);
      error.status = 400;
      throw error;
    }

    if (!input.purpose) {
      const error = new Error("Keperluan wajib diisi.");
      error.status = 400;
      throw error;
    }

    const stockBefore = product.stock;
    const stockAfter = stockBefore - quantity;
    const transaction = {
      id: createId("SOUT"),
      transactionDate: input.transactionDate || today(),
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      quantity,
      recipient: String(input.recipient || "").trim(),
      purpose: String(input.purpose).trim(),
      referenceNumber: String(input.referenceNumber || "").trim(),
      notes: String(input.notes || "").trim(),
      createdBy: actor.id,
      createdAt: nowIso()
    };

    product.stock = stockAfter;
    product.updatedAt = nowIso();
    database.stockOut.push(transaction);
    database.movements.push({
      id: createId("MOV"),
      movementDate: transaction.transactionDate,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      type: "OUT",
      quantity,
      stockBefore,
      stockAfter,
      refId: transaction.id,
      refType: "stock_out",
      notes: transaction.notes || `${transaction.purpose} untuk ${transaction.recipient || "penerima"}`,
      createdBy: actor.id,
      createdAt: nowIso()
    });

    return clone({ transaction, product });
  });
}

async function listMovements(query = {}) {
  const database = await readDatabase();
  const rows = [...database.movements].reverse().filter((movement) => {
    const search = String(query.search || "").toLowerCase();
    return (
      (!search || `${movement.productCode} ${movement.productName}`.toLowerCase().includes(search)) &&
      (!query.type || movement.type === query.type) &&
      (!query.productId || movement.productId === query.productId) &&
      (!query.startDate || movement.movementDate >= query.startDate) &&
      (!query.endDate || movement.movementDate <= query.endDate)
    );
  });
  return rows;
}

async function getReports() {
  const database = await readDatabase();
  const activeProducts = database.products.filter((product) => product.status === "active");
  return {
    currentStock: activeProducts,
    lowStock: activeProducts.filter((product) => product.stock <= product.minStock),
    stockIn: database.stockIn,
    stockOut: database.stockOut,
    movements: database.movements,
    summary: dashboardStats(database)
  };
}

module.exports = {
  createProduct,
  createStockIn,
  createStockOut,
  deactivateProduct,
  getBootstrapData,
  getDashboard,
  getReports,
  getUserById,
  listMovements,
  listProducts,
  login,
  publicUser,
  requireRole,
  updateProduct
};
