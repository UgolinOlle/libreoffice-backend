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
    const { templateName, clientId } = req.body;

    if (!req.file) {
      return ErrorHandler.handleValidationError(
        new Error("Veuillez fournir un fichier template docx."),
        res,
      );
    }

    const templatePath = req.file.path;
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

      if (typeof row.values === "string" && row.values.startsWith("[")) {
        try {
          values = JSON.parse(row.values);
        } catch (e) {
          Logger.send("WARN", `Failed to parse JSON values: ${row.values}`);
          values = row.values.split(",");
        }
      } else if (typeof row.values === "string") {
        values = row.values.split(",").map((v: any) => v.trim());
      }

      return {
        list_name: row.list_name,
        values: values,
      };
    });

    Logger.send(
      "INFO",
      `Processed table data: ${JSON.stringify(formattedTableData, null, 2)}`,
    );

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

    res.send(buffer);

    fs.unlinkSync(templatePath);
    Logger.send("INFO", "Temp template deleted.");
  } catch (error) {
    Logger.send("ERROR", `Error while creating the document: ${error}`);
    ErrorHandler.handleError(error, res);
  }
};
