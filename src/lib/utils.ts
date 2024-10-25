import dotenv from "dotenv";
import path from "path";

export const loadEnv = (): void => {
  const envPath = path.join(__dirname, "../../.env");

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error("Erreur lors du chargement du fichier .env :", result.error);
    process.exit(1);
  }

  console.log("Les variables d'environnement ont été chargées avec succès.");
};
