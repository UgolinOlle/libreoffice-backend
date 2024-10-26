import { faker } from "@faker-js/faker";

import Logger from "../src/lib/logger";
import { loadEnv } from "../src/lib/utils";

loadEnv();

import db from "../src/lib/database";

const NUMBER_OF_CLIENTS = 100;

const createTableIfNotExists = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      address TEXT,
      clients_liste TEXT,
      advisor_last_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await db.query(query);
    Logger.send("INFO", "Table 'clients' created or already exists.");
  } catch (error: any) {
    Logger.send("ERROR", `Error creating table: ${error.message}`);
    process.exit(1);
  }
};

const insertFakeClients = async () => {
  try {
    await db.connect();
    Logger.send("INFO", "Connected to the database successfully.");

    await createTableIfNotExists();

    Logger.send("INFO", `Insertion of ${NUMBER_OF_CLIENTS} fake clients...`);

    for (let i = 0; i < NUMBER_OF_CLIENTS; i++) {
      const address = faker.location.streetAddress();
      const clients_liste = faker.lorem.words(5).split(' ').join(', ');
      const advisor_last_name = faker.person.lastName();
      const created_at = faker.date.past();

      const query = `
        INSERT INTO clients (address, clients_liste, advisor_last_name, created_at)
        VALUES ($1, $2, $3, $4)
      `;
      const values = [
        address,
        clients_liste,
        advisor_last_name,
        created_at,
      ];

      await db.insert(query, values);
      Logger.send("DEBUG", `Client with address ${address} inserted successfully.`);
    }

    Logger.send("INFO", "All fake clients have been inserted successfully.");
    process.exit(0);
  } catch (error: any) {
    Logger.send(
      "ERROR",
      `Error while inserting fake clients: ${error.message}`,
    );
    process.exit(1);
  }
};

insertFakeClients();
