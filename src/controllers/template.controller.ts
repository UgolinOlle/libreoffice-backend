import { Request, Response } from "express";
import path from "path";
import fs from "fs";

import { ErrorHandler, Logger } from "~/lib";
import db from "~/lib/database";
import { generateDocumentFromTemplate } from "~/services/docx.service";

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

    const templatePath = req.file.path;
    const templateName = req.file.originalname;
    const clientData = await db.query("SELECT * FROM clients WHERE id = $1", [
      clientId,
    ]);

    if (clientData.length === 0) {
      return ErrorHandler.handleNotFoundError(res, "Client");
    }

    const client = clientData[0];
    const tableData = await db.query(
      "SELECT list_name, values FROM data_lists",
    );
    const formattedTableData = tableData.map((row: any) => {
      let values = row.values;

      if (typeof values === "string" && values.startsWith("[")) {
        try {
          values = JSON.parse(values);
        } catch (e) {
          Logger.send("WARN", `Failed to parse JSON values: ${values}`);
          values = values.split(",");
        }
      } else if (typeof values === "string") {
        values = values.split(",").map((v: any) => v.trim());
      }

      return {
        list_name: row.list_name,
        values: values,
      };
    });

    const buffer = await generateDocumentFromTemplate(
      templatePath,
      client,
      formattedTableData,
    );
    const outputFileName = `filled-${templateName}-${Date.now()}.docx`;
    const outputPath = path.join(__dirname, "../../uploads", outputFileName);

    fs.writeFileSync(outputPath, buffer);
    Logger.send("INFO", `Filled template saved at: ${outputPath}`);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${outputFileName}`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.download(outputPath, outputFileName, (err: Error) => {
      if (err) {
        Logger.send("ERROR", `An error occured while sending file: ${err}`);
        res.status(500).send("An error occured while sending file.");
      }
    });

    fs.unlinkSync(templatePath);
    Logger.send("INFO", "Temp template deleted.");
  } catch (error) {
    Logger.send("ERROR", `Error while creating the document: ${error}`);
    ErrorHandler.handleError(error, res);
  }
};
