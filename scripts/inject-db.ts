import { faker } from "@faker-js/faker";

import Logger from "../src/lib/logger";
import { loadEnv } from "../src/lib/utils";

loadEnv();

import db from "../src/lib/database";

const NUMBER_OF_CLIENTS = 100;

const insertFakeClients = async () => {
  try {
    console.info(process.env.DB_USER);

    await db
      .connect()
      .then(() => {
        Logger.send("INFO", "Connected to the database successfully.");
      })
      .catch((error: any) => {
        Logger.send(
          "ERROR",
          `Error while connecting to the database: ${error.message}`,
        );
        process.exit(1);
      });

    Logger.send("INFO", `Insertion of ${NUMBER_OF_CLIENTS} fake clients...`);

    for (let i = 0; i < NUMBER_OF_CLIENTS; i++) {
      const name = faker.person.fullName();
      const address = faker.location.streetAddress();
      const email = faker.internet.email();
      const advisor_first_name = faker.person.firstName();
      const advisor_last_name = faker.person.lastName();

      const query = `
        INSERT INTO clients (name, address, email, advisor_first_name, advisor_last_name)
        VALUES ($1, $2, $3, $4, $5)
      `;
      const values = [
        name,
        address,
        email,
        advisor_first_name,
        advisor_last_name,
      ];

      await db.insert(query, values);
      Logger.send("DEBUG", `Client ${name} inserted successfully.`);
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
