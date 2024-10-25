import { Client } from "pg";

export const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

export const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log("Connexion à PostgreSQL réussie");
  } catch (error) {
    console.error("Erreur lors de la connexion à PostgreSQL :", error);
  }
};
