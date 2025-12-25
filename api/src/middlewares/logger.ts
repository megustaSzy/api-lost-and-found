import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toLocaleTimeString("id-ID", { hour12: false });

    // Colors
    const reset = "\x1b[0m";
    const dim = "\x1b[2m";
    const bold = "\x1b[1m";
    const cyan = "\x1b[36m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const red = "\x1b[31m";
    const magenta = "\x1b[35m";
    const blue = "\x1b[34m";

    // Method color
    const methodColors: { [key: string]: string } = {
      GET: cyan,
      POST: green,
      PUT: yellow,
      DELETE: red,
      PATCH: magenta,
    };
    const methodColor = methodColors[req.method] || blue;

    // Status color
    let statusColor = green;
    if (res.statusCode >= 400 && res.statusCode < 500) statusColor = yellow;
    if (res.statusCode >= 500) statusColor = red;

    // Duration color
    let durationColor = green;
    if (duration > 500) durationColor = yellow;
    if (duration > 1000) durationColor = red;

    // Format
    const method = `${bold}${methodColor}${req.method.padEnd(6)}${reset}`;
    const status = `${bold}${statusColor}${res.statusCode}${reset}`;
    const time = `${durationColor}${duration}ms${reset}`;
    const url = `${dim}${req.originalUrl}${reset}`;

    console.log(
      `${dim}[${timestamp}]${reset} ${method} ${status} ${time} ${url}`
    );
  });

  next();
};
