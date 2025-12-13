import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    // Timestamp
    const now = new Date();
    const timestamp = now.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // ANSI Colors & Styles
    const reset = "\x1b[0m";
    const bright = "\x1b[1m";
    const dim = "\x1b[2m";
    const cyan = "\x1b[36m";
    const blue = "\x1b[34m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const red = "\x1b[31m";
    const magenta = "\x1b[35m";
    const gray = "\x1b[90m";
    const white = "\x1b[37m";
    const bgCyan = "\x1b[46m";
    const bgGreen = "\x1b[42m";
    const bgYellow = "\x1b[43m";
    const bgRed = "\x1b[41m";
    const bgMagenta = "\x1b[45m";

    // Method colors and badges
    const methodStyles: {
      [key: string]: { color: string; bg: string; icon: string };
    } = {
      GET: { color: cyan, bg: bgCyan, icon: "📥" },
      POST: { color: green, bg: bgGreen, icon: "📤" },
      PUT: { color: yellow, bg: bgYellow, icon: "✏️" },
      DELETE: { color: red, bg: bgRed, icon: "🗑️" },
      PATCH: { color: magenta, bg: bgMagenta, icon: "🔧" },
      OPTIONS: { color: gray, bg: "", icon: "⚙️" },
      HEAD: { color: gray, bg: "", icon: "📋" },
    };

    const methodStyle = methodStyles[req.method] || {
      color: blue,
      bg: "",
      icon: "📡",
    };

    // Status color and icon
    let statusColor = green;
    let statusIcon = "✓";
    let statusEmoji = "✅";

    if (res.statusCode >= 200 && res.statusCode < 300) {
      statusColor = green;
      statusIcon = "✓";
      statusEmoji = "✅";
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      statusColor = cyan;
      statusIcon = "↻";
      statusEmoji = "🔄";
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      statusColor = yellow;
      statusIcon = "⚠";
      statusEmoji = "⚠️";
    } else if (res.statusCode >= 500) {
      statusColor = red;
      statusIcon = "✖";
      statusEmoji = "❌";
    }

    // Duration color and performance indicator
    let durationColor = green;
    let performanceIcon = "⚡";

    if (duration > 1000) {
      durationColor = red;
      performanceIcon = "🐌";
    } else if (duration > 500) {
      durationColor = yellow;
      performanceIcon = "🕐";
    } else if (duration > 200) {
      durationColor = cyan;
      performanceIcon = "💨";
    }

    // Format duration
    const formattedDuration =
      duration > 1000 ? `${(duration / 1000).toFixed(2)}s` : `${duration}ms`;

    // IP Address (sanitized)
    const ip = (req.ip || req.socket.remoteAddress || "-").replace(
      "::ffff:",
      ""
    );

    // User agent with icons
    const userAgent = req.get("user-agent") || "-";
    let browserIcon = "🌐";
    let browser = "Other";

    if (userAgent.includes("Postman")) {
      browser = "Postman";
      browserIcon = "📮";
    } else if (userAgent.includes("Chrome")) {
      browser = "Chrome";
      browserIcon = "🟢";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
      browserIcon = "🦊";
    } else if (userAgent.includes("Safari")) {
      browser = "Safari";
      browserIcon = "🧭";
    } else if (userAgent.includes("curl")) {
      browser = "curl";
      browserIcon = "💻";
    }

    // Request size (if available)
    const contentLength = req.get("content-length");
    const requestSize = contentLength
      ? formatBytes(parseInt(contentLength))
      : "-";

    // Response size (if available)
    const responseSize = res.get("content-length")
      ? formatBytes(parseInt(res.get("content-length") || "0"))
      : "-";

    // Build beautiful log line with box drawing
    const topBorder = `${gray}╭${"─".repeat(78)}╮${reset}`;
    const bottomBorder = `${gray}╰${"─".repeat(78)}╯${reset}`;
    const separator = `${gray}├${"─".repeat(78)}┤${reset}`;

    console.log(`\n${topBorder}`);

    // Header line with timestamp
    console.log(
      `${gray}│${reset} ${dim}🕐 ${timestamp}${reset}`.padEnd(90) +
        `${gray}│${reset}`
    );

    console.log(separator);

    // Request line with method badge
    const methodBadge = `${bright}${methodStyle.color}${methodStyle.icon} ${req.method}${reset}`;
    const urlLine = `${gray}│${reset} ${methodBadge} ${bright}${blue}${req.originalUrl}${reset}`;
    console.log(urlLine.padEnd(90) + `${gray}│${reset}`);

    console.log(separator);

    // Status and performance line
    const statusLine = `${gray}│${reset} ${statusEmoji}  Status: ${bright}${statusColor}${
      res.statusCode
    }${reset} ${dim}${getStatusText(res.statusCode)}${reset}`;
    console.log(statusLine.padEnd(99) + `${gray}│${reset}`);

    const perfLine = `${gray}│${reset} ${performanceIcon}  Duration: ${bright}${durationColor}${formattedDuration}${reset}`;
    console.log(perfLine.padEnd(99) + `${gray}│${reset}`);

    console.log(separator);

    // Client info line
    const clientLine = `${gray}│${reset} ${browserIcon}  Client: ${white}${browser}${reset} ${dim}from${reset} ${cyan}${ip}${reset}`;
    console.log(clientLine.padEnd(99) + `${gray}│${reset}`);

    // Size info line (if available)
    if (requestSize !== "-" || responseSize !== "-") {
      const sizeLine = `${gray}│${reset} 📦  Size: ${dim}↑ ${requestSize} / ↓ ${responseSize}${reset}`;
      console.log(sizeLine.padEnd(99) + `${gray}│${reset}`);
    }

    console.log(bottomBorder);
  });

  next();
};

// Helper function to get status text
function getStatusText(statusCode: number): string {
  const statusTexts: { [key: number]: string } = {
    200: "OK",
    201: "Created",
    204: "No Content",
    301: "Moved Permanently",
    302: "Found",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return statusTexts[statusCode] || "Unknown";
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
