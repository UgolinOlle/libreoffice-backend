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

const createDataListsTableIfNotExists = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS data_lists (
      id SERIAL PRIMARY KEY,
      list_name VARCHAR(255) NOT NULL,
      values TEXT[] NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await db.query(query);
    Logger.send("INFO", "Table 'data_lists' created or already exists.");
  } catch (error: any) {
    Logger.send("ERROR", `Error creating data_lists table: ${error.message}`);
    process.exit(1);
  }
};

const insertDataLists = async () => {
  const dataLists = [
    {
      list_name: "Fruits",
      values: ["Apple", "Banana", "Cherry", "Date", "Elderberry"]
    },
    {
      list_name: "Colors",
      values: ["Red", "Blue", "Green", "Yellow", "Purple"]
    },
    {
      list_name: "Countries",
      values: ["France", "Germany", "Italy", "Spain", "Portugal"]
    }
  ];

  for (const list of dataLists) {
    const query = `
      INSERT INTO data_lists (list_name, values)
      VALUES ($1, $2)
    `;
    const values = [list.list_name, list.values];

    try {
      await db.insert(query, values);
      Logger.send("DEBUG", `Data list '${list.list_name}' inserted successfully.`);
    } catch (error: any) {
      Logger.send("ERROR", `Error inserting data list '${list.list_name}': ${error.message}`);
    }
  }
};

const insertFakeClients = async () => {
  try {
    await db.connect();
    Logger.send("INFO", "Connected to the database successfully.");

    await createTableIfNotExists();
    await createDataListsTableIfNotExists();

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

    Logger.send("INFO", "Inserting data lists...");
    await insertDataLists();

    Logger.send("INFO", "All fake clients and data lists have been inserted successfully.");
    process.exit(0);
  } catch (error: any) {
    Logger.send(
      "ERROR",
      `Error while inserting fake data: ${error.message}`,
    );
    process.exit(1);
  }
};

insertFakeClients();
