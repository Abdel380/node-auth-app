import pg from "pg";

// Crée un pool de connexions à PostgreSQL
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Gère les erreurs de connexion
pool.on("error", (err) =>
  console.error("Database connection lost:", err.message)
);

// Crée la table des utilisateurs si elle n'existe pas
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      username      TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}