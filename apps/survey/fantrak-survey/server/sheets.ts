import { execSync } from "child_process";
import type { InsertSurveyResponse } from "@shared/schema";

const SPREADSHEET_ID = "11etQYmPiNiwFk4blhaEjdxQtCNXQxYydyn0S0IQgOvA";
const SHEET_NAME = "Creator Survey";

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
    // Log but never throw — a Sheets failure should never break a survey submission
    console.error("[sheets] append failed:", err.stderr || err.message);
    return null;
  }
}

export function appendSurveyResponse(data: InsertSurveyResponse): void {
  const ts = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

  let platforms = "";
  try {
    const parsed = JSON.parse(data.currentPlatforms as string);
    platforms = Array.isArray(parsed) ? parsed.join(", ") : String(data.currentPlatforms);
  } catch {
    platforms = String(data.currentPlatforms ?? "");
  }

  const row = {
    Timestamp:                       ts,
    "Creator Type":                  data.creatorType ?? "",
    "Current Platforms":             platforms,
    "Rating - Payouts":              data.ratingPayouts?.toString() ?? "",
    "Comment - Payouts":             data.commentPayouts ?? "",
    "Rating - Analytics":            data.ratingAnalytics?.toString() ?? "",
    "Comment - Analytics":           data.commentAnalytics ?? "",
    "Rating - Fan Management":       data.ratingFanManagement?.toString() ?? "",
    "Comment - Fan Management":      data.commentFanManagement ?? "",
    "Rating - Scheduling":           data.ratingScheduling?.toString() ?? "",
    "Comment - Scheduling":          data.commentScheduling ?? "",
    "Rating - Messaging":            data.ratingMessaging?.toString() ?? "",
    "Comment - Messaging":           data.commentMessaging ?? "",
    "Rating - Payment Processing":   data.ratingPaymentProcessing?.toString() ?? "",
    "Comment - Payment Processing":  data.commentPaymentProcessing ?? "",
    "Rating - Onboarding":           data.ratingOnboarding?.toString() ?? "",
    "Comment - Onboarding":          data.commentOnboarding ?? "",
    "Rating - Mobile App":           data.ratingMobileApp?.toString() ?? "",
    "Comment - Mobile App":          data.commentMobileApp ?? "",
    "Overall Score":                 data.overallScore?.toString() ?? "",
    "Biggest Pain Point":            data.biggestPainPoint ?? "",
    "Most Wanted Feature":           data.mostWantedFeature ?? "",
    "Additional Comments":           data.additionalComments ?? "",
    "Would Join Beta":               data.wouldJoinBeta === 1 ? "Yes" : data.wouldJoinBeta === 0 ? "No" : "",
    Email:                           data.email ?? "",
  };

  callTool("google_sheets-add-rows", {
    spreadsheetId: SPREADSHEET_ID,
    sheetName: SHEET_NAME,
    rows: JSON.stringify([row]),
    hasHeaders: true,
  });
}
