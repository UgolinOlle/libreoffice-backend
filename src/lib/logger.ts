import chalk from "chalk";

class Logger {
  static send(
    level: "INFO" | "WARN" | "ERROR" | "DEBUG" | "SUCCESS",
    message: string,
  ): void {
    const timestamp = new Date().toISOString();
    let formattedMessage = "";

    switch (level) {
      case "SUCCESS":
        formattedMessage = `[${chalk.green("SUCCESS")}] [${timestamp}]: ${message}`;
        break;
      case "INFO":
        formattedMessage = `[${chalk.blue("INFO")}] [${timestamp}]: ${message}`;
        break;
      case "WARN":
        formattedMessage = `[${chalk.yellow("WARN")}] [${timestamp}]: ${message}`;
        break;
      case "ERROR":
        formattedMessage = `[${chalk.red("ERROR")}] [${timestamp}]: ${message}`;
        break;
      case "DEBUG":
        formattedMessage = `[${chalk.magenta("DEBUG")}] [${timestamp}]: ${message}`;
        break;
      default:
        formattedMessage = `[${chalk.white("LOG")}] [${timestamp}]: ${message}`;
    }

    console.log(formattedMessage);
  }
}

export default Logger;
