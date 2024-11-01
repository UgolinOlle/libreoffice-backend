import { Request, Response } from "express";
import path from "path";

import { ErrorHandler, Logger, updateSQLite } from "~/lib";
import { replaceSQLiteInDocx } from "~/services";

export const generateDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const clientId = req.body.clientId;

    if (!req.file) {
      return ErrorHandler.handleValidationError(
        new Error("Veuillez fournir un fichier template docx."),
        res,
      );
    }

    await updateSQLite(clientId);

    const templatePath = req.file.path;
    const sqlitePath = path.join(__dirname, "../../data.sqlite");
    const outputPath = path.join(__dirname, "../../output.docx");

    replaceSQLiteInDocx(templatePath, sqlitePath, outputPath);

    res.download(outputPath, "output.docx", (err) => {
      if (err) {
        console.error("Erreur lors de l'envoi du fichier :", err);
        res.status(500).send("Erreur lors de l'envoi du fichier");
      }
    });
  } catch (error) {
    Logger.send("ERROR", `Error while creating the document: ${error}`);
    ErrorHandler.handleError(error, res);
  }
};
