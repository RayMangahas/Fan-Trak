import { google } from "googleapis";
import type { InsertWaitlist, InsertResearch } from "@shared/schema";

const SPREADSHEET_ID = "11etQYmPiNiwFk4blhaEjdxQtCNXQxYydyn0S0IQgOvA";

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function appendRows(sheetName: string, values: string[][]) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}

export async function appendWaitlist(data: InsertWaitlist) {
  const ts = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  await appendRows("Waitlist", [[
    ts,
    data.name,
    data.stageName ?? "",
    data.email,
    data.creatorType ?? "",
    data.hasManager ?? "",
    data.managerName ?? "",
    data.companyName ?? "",
    data.companyEmail ?? "",
    data.primaryPlatform ?? "",
    data.source ?? "landing_page",
    data.additionalInfo ?? "",
  ]]);
}

export async function appendResearch(data: InsertResearch) {
  const ts = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  await appendRows("Floor Research", [[
    ts,
    data.fullName ?? "",
    data.stageName ?? "",
    data.researchEmail ?? "",
    data.creatorType ?? "",
    data.hasManager ?? "",
    data.managerName ?? "",
    data.companyName ?? "",
    data.companyEmail ?? "",
    data.platforms ?? "",
    data.hoursPerDay ?? "",
    data.biggestPain ?? "",
    data.chargeback ?? "",
    data.attribution ?? "",
    data.consolidationValue?.toString() ?? "",
    data.openResponse ?? "",
  ]]);
}
