import { execSync } from "child_process";

const SPREADSHEET_ID = "11etQYmPiNiwFk4blhaEjdxQtCNXQxYydyn0S0IQgOvA";

function callTool(toolName: string, args: Record<string, unknown>) {
  const payload = JSON.stringify({
    source_id: "google_sheets__pipedream",
    tool_name: toolName,
    arguments: args,
  });
  try {
    const out = execSync(`external-tool call '${payload}'`, {
      encoding: "utf8",
      timeout: 15000,
    });
    return JSON.parse(out);
  } catch (err: any) {
    console.error("[sheets] tool error:", err.stderr || err.message);
    throw new Error("Sheets write failed");
  }
}

export function appendWaitlist(data: {
  name: string;
  email: string;
  creatorType?: string | null;
  primaryPlatform?: string | null;
  source?: string | null;
}) {
  const ts = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  callTool("google_sheets-add-rows", {
    spreadsheetId: SPREADSHEET_ID,
    sheetName: "Waitlist",
    rows: JSON.stringify([{
      Timestamp: ts,
      Name: data.name,
      Email: data.email,
      "Creator Type": data.creatorType || "",
      "Primary Platform": data.primaryPlatform || "",
      Source: data.source || "landing_page",
    }]),
    hasHeaders: true,
  });
}

export function appendResearch(data: {
  platforms?: string | null;
  hoursPerDay?: string | null;
  biggestPain?: string | null;
  chargeback?: string | null;
  attribution?: string | null;
  consolidationValue?: number | null;
  openResponse?: string | null;
}) {
  const ts = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  callTool("google_sheets-add-rows", {
    spreadsheetId: SPREADSHEET_ID,
    sheetName: "Floor Research",
    rows: JSON.stringify([{
      Timestamp: ts,
      Platforms: data.platforms || "",
      "Hours Per Day": data.hoursPerDay || "",
      "Biggest Pain": data.biggestPain || "",
      Chargebacks: data.chargeback || "",
      "Revenue Attribution": data.attribution || "",
      "Consolidation Value (1-5)": data.consolidationValue?.toString() || "",
      "Open Response": data.openResponse || "",
    }]),
    hasHeaders: true,
  });
}
