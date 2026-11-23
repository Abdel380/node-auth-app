
import express from "express";
import { AuthError, login, register } from "./auth.js";
import { initDb, pool } from "./db.js";

const app = express();

// Permet de lire les requêtes JSON
app.use(express.json());

// Vérifier la connexion à PostgreSQL
app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok" });
});


app.get("/api/users/count", async (req, res) => {
  const result = await pool.query(
    "SELECT COUNT(*)::int AS count FROM users"
  );

  res.json({
    count: result.rows[0].count
  });
});


// Inscrire un utilisateur
app.post("/api/register", async (req, res) => {
  const { username = "", password = "" } = req.body ?? {};

  try {
    const name = await register(username, password);
    res.status(201).json({ username: name });
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }
});

// Connecter un utilisateur
app.post("/api/login", async (req, res) => {
  const { username = "", password = "" } = req.body ?? {};

  const name = await login(username, password);

  if (!name) {
    return res.status(401).json({
      error: "Invalid username or password"
    });
  }

  res.json({ username: name });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON"
    });
  }

  console.error(err);
  res.status(500).json({
    error: "Internal server error"
  });
});

// Démarrer le serveur
const PORT = Number(process.env.PORT ?? 3000);

await initDb();

const server = app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

// Arrêt propre du serveur
process.on("SIGTERM", () => {
  server.close(() =>
    pool.end().then(() => process.exit(0))
  );
});
