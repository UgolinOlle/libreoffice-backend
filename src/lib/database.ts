import { Pool, PoolConfig } from "pg";
import Logger from "./logger";

class DB {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  public async connect(): Promise<void> {
    try {
      await this.pool.connect();
      Logger.send("INFO", "Connexion à la base de données réussie.");
    } catch (error: any) {
      Logger.send(
        "ERROR",
        `Erreur de connexion à la base de données : ${error.message}`,
      );
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      Logger.send("INFO", "Déconnexion de la base de données réussie.");
    } catch (error: any) {
      Logger.send("ERROR", `Erreur lors de la déconnexion : ${error.message}`);
    }
  }

  public async query(queryText: string, params?: any[]): Promise<any> {
    try {
      const result = await this.pool.query(queryText, params);
      Logger.send("INFO", `Requête réussie : ${queryText}`);
      return result.rows;
    } catch (error: any) {
      Logger.send(
        "ERROR",
        `Erreur lors de l'exécution de la requête : ${error.message}`,
      );
      throw error;
    }
  }

  public async createTable(queryText: string): Promise<void> {
    try {
      await this.query(queryText);
      Logger.send("INFO", "Table créée avec succès.");
    } catch (error: any) {
      Logger.send(
        "ERROR",
        `Erreur lors de la création de la table : ${error.message}`,
      );
    }
  }

  public async insert(queryText: string, values: any[]): Promise<void> {
    try {
      await this.query(queryText, values);
      Logger.send("INFO", "Données insérées avec succès.");
    } catch (error: any) {
      Logger.send(
        "ERROR",
        `Erreur lors de l'insertion des données : ${error.message}`,
      );
    }
  }

  public async delete(queryText: string, params?: any[]): Promise<void> {
    try {
      await this.query(queryText, params);
      Logger.send("INFO", "Données supprimées avec succès.");
    } catch (error: any) {
      Logger.send(
        "ERROR",
        `Erreur lors de la suppression des données : ${error.message}`,
      );
    }
  }
}

// --- Configuration
const dbConfig: PoolConfig = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "wealthcome_test",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432", 10),
};

// --- Instance of the DB class
const db = new DB(dbConfig);

export default db;
