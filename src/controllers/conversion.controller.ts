import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { convertToFormat } from "~/services/libre-office.service";
import { ErrorHandler, Logger } from "~/lib";

export const convertDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.info(
      "-------------------------------------------------------------------------------"
    );
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    if (!req.file) {
      return ErrorHandler.handleValidationError(
        new Error("Veuillez fournir un fichier à convertir."),
        res
      );
    }

    const inputPath = req.file.path;

    const outputDir = path.join(__dirname, "../../converted");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = `${Date.now()}_output.pdf`;
    const outputPath = path.join(outputDir, outputFileName);

    await convertToFormat(inputPath, outputPath, "pdf");

    if (!fs.existsSync(outputPath)) {
      throw new Error("Le fichier converti n'a pas été créé");
    }

    const fileData = fs.readFileSync(outputPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${outputFileName}`
    );

    res.send(fileData);

    // Nettoyage des fichiers temporaires
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    Logger.send("INFO", "Temporary files deleted.");
  } catch (error) {
    console.error("Erreur lors de la conversion:", error);
    return ErrorHandler.handleError(error, res);
  }
};
