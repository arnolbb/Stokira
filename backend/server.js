const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { URL } = require("url");
const { getDatabasePath, readDatabase, resetDatabase, writeDatabase } = require("./repositories/local-store");
const stockService = require("./services/stock-service");

const port = Number(process.env.PORT || 3001);
const rootDir = path.join(__dirname, "..");
const publicFiles = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/styles.css", "styles.css"],
  ["/app.js", "app.js"]
]);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8"
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  });
  res.end(JSON.stringify(body, null, 2));
}

function sendText(res, status, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  });
  res.end(text);
}

function notFound(res) {
  sendJson(res, 404, { success: false, error: "Endpoint tidak ditemukan." });
}

function parsePathname(req) {
  const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  return {
    pathname: parsed.pathname,
    query: Object.fromEntries(parsed.searchParams.entries())
  };
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Body JSON tidak valid.");
    error.status = 400;
    throw error;
  }
}

async function getActor(req) {
  const userId = req.headers["x-user-id"] || "USR-002";
  return stockService.getUserById(userId);
}

function routeId(pathname, prefix, suffix = "") {
  if (!pathname.startsWith(prefix)) return null;
  if (suffix && !pathname.endsWith(suffix)) return null;
  const withoutPrefix = pathname.slice(prefix.length);
  const id = suffix ? withoutPrefix.slice(0, -suffix.length) : withoutPrefix;
  const normalized = id.replace(/^\/+|\/+$/g, "");
  return normalized || null;
}

function toCsv(rows, columns) {
  const header = columns.map((column) => column.key);
  const values = rows.map((row) =>
    columns.map((column) => {
      const value = column.get ? column.get(row) : row[column.key];
      return `"${String(value ?? "").replaceAll('"', '""')}"`;
    })
  );
  return [header, ...values].map((row) => row.join(",")).join("\n");
}

async function serveStatic(req, res, pathname) {
  const fileName = publicFiles.get(pathname);
  if (!fileName) return false;

  const filePath = path.join(rootDir, fileName);
  const ext = path.extname(filePath);
  const content = await fs.readFile(filePath);
  res.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
  res.end(content);
  return true;
}

async function handleApi(req, res, pathname, query) {
  if (req.method === "OPTIONS") {
    sendText(res, 204, "");
    return;
  }

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, {
      success: true,
      status: "ok",
      databaseMode: "local-json",
      databasePath: getDatabasePath()
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const body = await readJsonBody(req);
    const result = await stockService.login(body.email, body.password);
    sendJson(res, 200, { success: true, ...result });
    return;
  }

  if (req.method === "GET" && pathname === "/api/bootstrap") {
    sendJson(res, 200, { success: true, data: await stockService.getBootstrapData() });
    return;
  }

  if (req.method === "GET" && pathname === "/api/dashboard") {
    sendJson(res, 200, { success: true, data: await stockService.getDashboard() });
    return;
  }

  if (req.method === "GET" && pathname === "/api/products") {
    sendJson(res, 200, { success: true, data: await stockService.listProducts(query) });
    return;
  }

  if (req.method === "POST" && pathname === "/api/products") {
    const actor = await getActor(req);
    const body = await readJsonBody(req);
    const product = await stockService.createProduct(body, actor);
    sendJson(res, 201, { success: true, data: product });
    return;
  }

  const updateProductId = routeId(pathname, "/api/products/");
  if (req.method === "PUT" && updateProductId && !updateProductId.includes("/")) {
    const actor = await getActor(req);
    const body = await readJsonBody(req);
    const product = await stockService.updateProduct(updateProductId, body, actor);
    sendJson(res, 200, { success: true, data: product });
    return;
  }

  const inactiveProductId = routeId(pathname, "/api/products/", "/inactive");
  if (req.method === "PATCH" && inactiveProductId) {
    const actor = await getActor(req);
    const product = await stockService.deactivateProduct(inactiveProductId, actor);
    sendJson(res, 200, { success: true, data: product });
    return;
  }

  if (req.method === "POST" && pathname === "/api/stock-in") {
    const actor = await getActor(req);
    const body = await readJsonBody(req);
    const result = await stockService.createStockIn(body, actor);
    sendJson(res, 201, { success: true, data: result });
    return;
  }

  if (req.method === "POST" && pathname === "/api/stock-out") {
    const actor = await getActor(req);
    const body = await readJsonBody(req);
    const result = await stockService.createStockOut(body, actor);
    sendJson(res, 201, { success: true, data: result });
    return;
  }

  if (req.method === "GET" && pathname === "/api/movements") {
    sendJson(res, 200, { success: true, data: await stockService.listMovements(query) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/reports") {
    sendJson(res, 200, { success: true, data: await stockService.getReports() });
    return;
  }

  if (req.method === "GET" && pathname === "/api/reports/current-stock") {
    const report = await stockService.getReports();
    sendJson(res, 200, { success: true, data: report.currentStock });
    return;
  }

  if (req.method === "GET" && pathname === "/api/reports/low-stock") {
    const report = await stockService.getReports();
    sendJson(res, 200, { success: true, data: report.lowStock });
    return;
  }

  if (req.method === "GET" && pathname === "/api/reports/stock-in") {
    const report = await stockService.getReports();
    sendJson(res, 200, { success: true, data: report.stockIn });
    return;
  }

  if (req.method === "GET" && pathname === "/api/reports/stock-out") {
    const report = await stockService.getReports();
    sendJson(res, 200, { success: true, data: report.stockOut });
    return;
  }

  if (req.method === "GET" && pathname === "/api/reports/products.csv") {
    const rows = await stockService.listProducts({});
    const csv = toCsv(rows, [
      { key: "code" },
      { key: "name" },
      { key: "category" },
      { key: "unit" },
      { key: "stock" },
      { key: "minStock" },
      { key: "location" },
      { key: "status" }
    ]);
    sendText(res, 200, csv, "text/csv; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname === "/api/backup") {
    sendJson(res, 200, { success: true, data: await readDatabase() });
    return;
  }

  if (req.method === "POST" && pathname === "/api/restore") {
    const actor = await getActor(req);
    stockService.requireRole(actor, ["owner"]);
    const body = await readJsonBody(req);
    if (!body || !Array.isArray(body.products) || !Array.isArray(body.movements)) {
      sendJson(res, 400, { success: false, error: "Format backup tidak valid." });
      return;
    }
    await writeDatabase(body);
    sendJson(res, 200, { success: true, data: { restored: true } });
    return;
  }

  if (req.method === "POST" && pathname === "/api/reset") {
    const actor = await getActor(req);
    stockService.requireRole(actor, ["owner"]);
    sendJson(res, 200, { success: true, data: await resetDatabase() });
    return;
  }

  notFound(res);
}

async function handleRequest(req, res) {
  const { pathname, query } = parsePathname(req);

  try {
    if (pathname.startsWith("/api/")) {
      await handleApi(req, res, pathname, query);
      return;
    }

    const served = await serveStatic(req, res, pathname);
    if (!served) notFound(res);
  } catch (error) {
    const status = error.status || 500;
    sendJson(res, status, {
      success: false,
      error: error.message || "Terjadi kesalahan server."
    });
  }
}

const server = http.createServer(handleRequest);

server.listen(port, () => {
  console.log(`Stokira backend running at http://127.0.0.1:${port}`);
  console.log(`Database mode: local-json`);
  console.log(`Database file: ${getDatabasePath()}`);
});
