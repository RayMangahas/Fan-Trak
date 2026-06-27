import { google } from "googleapis";
import type { InsertSurveyResponse } from "@shared/schema";

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

export async function appendSurveyResponse(data: InsertSurveyResponse) {
  const ts = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  await appendRows("Creator Survey", [[
    ts,
    data.fullName ?? "",
    data.stageName ?? "",
    data.personalEmail ?? "",
    data.creatorTypeSelf ?? "",
    data.hasManager === 1 ? "Yes" : data.hasManager === 0 ? "No" : "",
    data.managerName ?? "",
    data.companyName ?? "",
    data.companyEmail ?? "",
    data.creatorType ?? "",
    data.currentPlatforms ?? "",
    data.ratingPayouts?.toString() ?? "",
    data.commentPayouts ?? "",
    data.ratingAnalytics?.toString() ?? "",
    data.commentAnalytics ?? "",
    data.ratingFanManagement?.toString() ?? "",
    data.commentFanManagement ?? "",
    data.ratingScheduling?.toString() ?? "",
    data.commentScheduling ?? "",
    data.ratingMessaging?.toString() ?? "",
    data.commentMessaging ?? "",
    data.ratingPaymentProcessing?.toString() ?? "",
    data.commentPaymentProcessing ?? "",
    data.ratingOnboarding?.toString() ?? "",
    data.commentOnboarding ?? "",
    data.ratingMobileApp?.toString() ?? "",
    data.commentMobileApp ?? "",
    data.overallScore?.toString() ?? "",
    data.biggestPainPoint ?? "",
    data.mostWantedFeature ?? "",
    data.additionalComments ?? "",
    data.wouldJoinBeta === 1 ? "Yes" : data.wouldJoinBeta === 0 ? "No" : "",
    data.email ?? "",
  ]]);
}
