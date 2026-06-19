const fs = require("fs/promises");
const path = require("path");
const { seedData } = require("../seed");

const dataDir = path.join(__dirname, "..", "..", "data");
const databasePath = path.join(dataDir, "stokira-db.json");
let writeQueue = Promise.resolve();

async function ensureDatabase() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(databasePath);
  } catch {
    await writeDatabase(seedData);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readDatabase() {
  await ensureDatabase();
  const raw = await fs.readFile(databasePath, "utf8");
  return JSON.parse(raw);
}

async function writeDatabase(data) {
  await fs.mkdir(dataDir, { recursive: true });
  const tmpPath = `${databasePath}.tmp`;
  await fs.writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fs.rename(tmpPath, databasePath);
}

async function updateDatabase(mutator) {
  writeQueue = writeQueue.then(async () => {
    const database = await readDatabase();
    const result = await mutator(database);
    await writeDatabase(database);
    return result;
  });
  return writeQueue;
}

async function resetDatabase() {
  await writeDatabase(clone(seedData));
  return readDatabase();
}

function getDatabasePath() {
  return databasePath;
}

module.exports = {
  clone,
  databasePath,
  getDatabasePath,
  readDatabase,
  resetDatabase,
  updateDatabase,
  writeDatabase
};
