import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { Logger } from "~/lib";

export const generateDocumentFromTemplate = async (
  templatePath: string,
  client: any,
  tableData: { list_name: string; values: any[] }[],
): Promise<Buffer> => {
  const templateContent = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(templateContent);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "$", end: "$" },
    nullGetter: () => "",
  });

  const tableRows = tableData.map((row) => [
    row.list_name || "",
    Array.isArray(row.values)
      ? row.values.join(", ")
      : String(row.values || ""),
  ]);

  const tableWithHeaders = [
    ["Liste", "Valeurs"],
    ...tableRows,
  ];

  const data = {
    address: client.address || "",
    clients_liste: (client.clients_liste || "").split(", ").join("\n"),
    advisor_last_name: client.advisor_last_name || "",
    dataTable: tableWithHeaders,
  };

  Logger.send("INFO", `Final formatted data: ${JSON.stringify(data, null, 2)}`);

  doc.setData(data);

  try {
    doc.render();
  } catch (error: any) {
    Logger.send("ERROR", `Error rendering document: ${error}`);
    if (error.properties && error.properties.errors) {
      Logger.send(
        "ERROR",
        `Details of the errors: ${JSON.stringify(error.properties.errors)}`,
      );
    }
    throw error;
  }

  return doc.getZip().generate({ type: "nodebuffer" });
};
