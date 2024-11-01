import AdmZip from "adm-zip";

import { Logger } from "~/lib";

export const replaceSQLiteInDocx = (
  docxPath: string,
  sqlitePath: string,
  outputPath: string,
) => {
  const zip = new AdmZip(docxPath);

  zip.addLocalFile(sqlitePath, "sqlite_data");
  zip.writeZip(outputPath);

  Logger.send(
    "INFO",
    `The file .docx modified with the SQLite file has been created: ${outputPath}`,
  );
};
