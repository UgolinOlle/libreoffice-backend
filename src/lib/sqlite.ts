import sqlite3 from "sqlite3";

import db from "~/lib/database";

export const updateSQLite = async (clientId: string) => {
  const clientData = await db.query(
    "SELECT address, clients_liste, date, created_at FROM clients WHERE id = $1",
    [clientId],
  );

  if (!clientData || clientData.length === 0) {
    throw new Error("Client non trouvé dans la base de données PostgreSQL.");
  }

  const client = clientData[0];

  return new Promise<void>((resolve, reject) => {
    const sqliteDb = new sqlite3.Database("data.sqlite");

    sqliteDb.serialize(() => {
      sqliteDb.run(
        "CREATE TABLE IF NOT EXISTS variables (key TEXT, value TEXT)",
      );
      sqliteDb.run("DELETE FROM variables");

      const stmt = sqliteDb.prepare(
        "INSERT INTO variables (key, value) VALUES (?, ?)",
      );

      stmt.run("address", client.address);
      stmt.run("clients_liste", client.clients_liste);
      stmt.run("date", client.date.toString());
      stmt.run("created_at", client.created_at.toString());

      stmt.finalize();
    });

    sqliteDb.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
