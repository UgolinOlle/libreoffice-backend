import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import db from "~/lib/database";
import { ErrorHandler, Logger } from "~/lib";

export const generateDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateName, clientId } = req.body;

    if (!req.file) {
      return ErrorHandler.handleValidationError(
        new Error("Veuillez fournir un fichier template docx."),
        res
      );
    }

    const templatePath = req.file.path;
    const templateContent = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(templateContent);
    const customParser = (tag: string | number) => {
      return {
        get: (scope: { [x: string]: any; }) => {
          if (scope[tag]) {
            return scope[tag];
          }
          return `$${tag}$`;
        },
      };
    };
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '$',
        end: '$'
      },
      parser: customParser
    });
    const clientData = await db.query("SELECT * FROM clients WHERE id = $1", [
      clientId,
    ]);

    if (clientData.length === 0) {
      return ErrorHandler.handleNotFoundError(res, "Client");
    }

    const client = clientData[0];
    const data = {
      name: client.name,
      address: client.address,
      email: client.email,
      clients_liste: client.clients_liste.split(', ').join('\n'),
      advisor_last_name: client.advisor_last_name,
    };

    doc.setData(data);

    try {
      doc.render();
    } catch (error) {
      Logger.send("ERROR", `Error while rendering the document: ${error}`);
      return ErrorHandler.handleError(error, res);
    }

    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    const outputFileName = `filled-${templateName}-${Date.now()}.docx`;
    const outputPath = path.join(__dirname, "../../uploads", outputFileName);

    fs.writeFileSync(outputPath, buffer);
    Logger.send("INFO", `Filled template saved at: ${outputPath}`);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${outputFileName}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);

    fs.unlinkSync(templatePath);
    Logger.send("INFO", "Temp template deleted.");
  } catch (error) {
    Logger.send("ERROR", `Error while creating the document: ${error}`);
    ErrorHandler.handleError(error, res);
  }
};
