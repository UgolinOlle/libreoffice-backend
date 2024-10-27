import { exec } from "child_process";
import fs from "fs";
import path from "path";

export const convertToFormat = (
  inputPath: string,
  outputPath: string,
  format: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // --- Variables
    const outputFormat = format || "pdf";
    const outputDir = path.dirname(outputPath);
    const inputFileName = path.basename(inputPath);
    const expectedOutputFileName = inputFileName.replace(
      /\.[^/.]+$/,
      `.${outputFormat}`,
    );

    console.info(
      "-------------------------------------------------------------------------------",
    );
    console.log(`Input path: ${inputPath}`);
    console.log(`Output directory: ${outputDir}`);
    console.log(`Output format: ${outputFormat}`);
    console.log(`Expected output file name: ${expectedOutputFileName}`);
    console.info(
      "-------------------------------------------------------------------------------",
    );

    // --- Execution
    exec(
      `soffice --headless --convert-to ${outputFormat} "${inputPath}" --outdir "${outputDir}"`,
      (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(`Erreur lors de la conversion: ${stderr}`));
        } else {
          setTimeout(() => {
            // --- Variables
            const files = fs.readdirSync(outputDir);
            const convertedFile = files.find((file) =>
              file.endsWith(`.${outputFormat}`),
            );

            if (convertedFile) {
              const actualOutputPath = path.join(outputDir, convertedFile);

              if (convertedFile !== path.basename(outputPath)) {
                fs.renameSync(actualOutputPath, outputPath);
              }

              resolve(outputPath);
            } else {
              files.forEach((file) => console.log(file));
              reject(
                new Error(
                  `Aucun fichier ${outputFormat} n'a été trouvé dans le répertoire de sortie`,
                ),
              );
            }
          }, 1000);
        }
      },
    );
  });
};
