const createdAt = "2026-06-19T08:00:00+07:00";

const seedData = {
  users: [
    { id: "USR-001", name: "Owner", email: "owner@example.com", role: "owner", status: "active" },
    { id: "USR-002", name: "Admin Gudang", email: "admin@example.com", role: "admin", status: "active" },
    { id: "USR-003", name: "Staff Gudang", email: "staff@example.com", role: "staff", status: "active" }
  ],
  categories: [
    { id: "CAT-001", name: "Mesin", status: "active", createdAt },
    { id: "CAT-002", name: "Filter", status: "active", createdAt },
    { id: "CAT-003", name: "Aksesoris", status: "active", createdAt },
    { id: "CAT-004", name: "Sparepart", status: "active", createdAt },
    { id: "CAT-005", name: "Tools", status: "active", createdAt }
  ],
  suppliers: [],
  products: [
    {
      id: "PRD-001",
      code: "WP-RO600",
      name: "RO 600G",
      category: "Mesin",
      unit: "unit",
      stock: 10,
      minStock: 3,
      location: "Rak A1",
      purchasePrice: 2500000,
      sellingPrice: 3250000,
      notes: "Unit mesin utama",
      status: "active",
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "PRD-002",
      code: "FLT-COMP",
      name: "Filter Composite",
      category: "Filter",
      unit: "pcs",
      stock: 25,
      minStock: 10,
      location: "Rak B1",
      purchasePrice: 65000,
      sellingPrice: 95000,
      notes: "Fast moving",
      status: "active",
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "PRD-003",
      code: "HOSE-14",
      name: "Selang 1/4 Inch",
      category: "Aksesoris",
      unit: "meter",
      stock: 50,
      minStock: 15,
      location: "Rak C1",
      purchasePrice: 4500,
      sellingPrice: 8500,
      notes: "",
      status: "active",
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "PRD-004",
      code: "FAUCET-01",
      name: "Keran RO",
      category: "Aksesoris",
      unit: "pcs",
      stock: 12,
      minStock: 5,
      location: "Rak C2",
      purchasePrice: 55000,
      sellingPrice: 85000,
      notes: "",
      status: "active",
      createdAt,
      updatedAt: createdAt
    }
  ],
  stockIn: [],
  stockOut: [],
  movements: [],
  settings: {
    appName: "Stokira",
    businessName: "Gudang Utama",
    databaseMode: "local-json",
    timezone: "Asia/Jakarta",
    currency: "IDR"
  }
};

module.exports = { seedData };
