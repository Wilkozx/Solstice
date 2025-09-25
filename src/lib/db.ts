import Database from "@tauri-apps/plugin-sql";
import { Transaction, Customer } from "@/types";


let dbInstance: any = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:./sunbed.db");

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        lastname TEXT,
        minutes_remaining INTEGER NOT NULL
      )
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        change INTEGER NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);

  }
  return dbInstance;
}

export async function getCustomers(): Promise<Customer[]> {
  const db = await getDb();
  const rows = await db.select("SELECT * FROM customers");
  return rows as Customer[];
}

/**
 * Update a customer's name and lastname
 */
export async function updateCustomerInfo(
  id: number,
  name: string,
  lastname?: string
): Promise<Customer> {
  const db = await getDb();

  // Check if customer exists
  const rows = await db.select("SELECT * FROM customers WHERE id = ?", [id]);
  if (rows.length === 0) throw new Error("Customer not found");

  // Update customer info
  await db.execute(
    "UPDATE customers SET name = ?, lastname = ? WHERE id = ?",
    [name, lastname || null, id]
  );

  // Return updated customer
  const updatedRows = await db.select("SELECT * FROM customers WHERE id = ?", [id]);
  return updatedRows[0] as Customer;
}


export async function addCustomer(
  name: string,
  lastname?: string,
  minutes: number = 0
): Promise<Customer> {
  const db = await getDb();

  await db.execute(
    "INSERT INTO customers (name, lastname, minutes_remaining) VALUES (?, ?, ?)",
    [name, lastname || null, minutes]
  );

  // Get the last inserted customer to return it
  const rows = await db.select("SELECT * FROM customers ORDER BY id DESC LIMIT 1");
  return rows[0] as Customer;
}

export async function updateCustomerMinutes(id: number, newMinutes: number) {
  const db = await getDb();

  const rows = await db.select("SELECT * FROM customers WHERE id = ?", [id]);
  if (rows.length === 0) throw new Error("Customer not found");

  const oldMinutes = rows[0].minutes_remaining;
  const change = newMinutes - oldMinutes;

  await db.execute("UPDATE customers SET minutes_remaining = ? WHERE id = ?", [newMinutes, id]);

  if (change !== 0) {
    await db.execute(
      "INSERT INTO transactions (customer_id, change) VALUES (?, ?)",
      [id, change]
    );
  }
}

/**
 * Remove a customer and all their transactions
 */
export async function removeCustomer(customer_id: number) {
  const db = await getDb();

  // Optional: Check if customer exists first
  const rows = await db.select("SELECT * FROM customers WHERE id = ?", [customer_id]);
  if (rows.length === 0) throw new Error("Customer not found");

  // Delete the customer; transactions are deleted automatically due to ON DELETE CASCADE
  await db.execute("DELETE FROM customers WHERE id = ?", [customer_id]);
}

export async function getTransactionsForCustomer(customer_id: number): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.select(
    "SELECT * FROM transactions WHERE customer_id = ? ORDER BY timestamp DESC",
    [customer_id]
  );
  return rows as Transaction[];
}

/**
 * Get all transactions in the system, optionally filtered by date range
 */
export async function getAllTransactions(
  startDate?: string, // ISO date string
  endDate?: string
): Promise<Transaction[]> {
  const db = await getDb();
  let query = "SELECT * FROM transactions";
  const params: any[] = [];

  if (startDate && endDate) {
    query += " WHERE timestamp BETWEEN ? AND ?";
    params.push(startDate, endDate);
  }

  query += " ORDER BY timestamp DESC";
  const rows = await db.select(query, params);
  return rows as Transaction[];
}

/**
 * Add a transaction manually
 */
export async function addTransaction(customer_id: number, change: number) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO transactions (customer_id, change) VALUES (?, ?)",
    [customer_id, change]
  );

  // Update customer minutes
  const rows = await db.select("SELECT * FROM customers WHERE id = ?", [customer_id]);
  if (rows.length === 0) throw new Error("Customer not found");

  const newMinutes = rows[0].minutes_remaining + change;
  await db.execute("UPDATE customers SET minutes_remaining = ? WHERE id = ?", [newMinutes, customer_id]);
}