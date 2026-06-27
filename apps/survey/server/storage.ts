import { supabase } from "./db";
import type { InsertSurveyResponse } from "@shared/schema";

export const storage = {
  async submitResponse(data: InsertSurveyResponse) {
    const { data: row, error } = await supabase
      .from("survey_responses")
      .insert({
        full_name: data.fullName,
        stage_name: data.stageName,
        personal_email: data.personalEmail,
        creator_type_self: data.creatorTypeSelf,
        has_manager: data.hasManager,
        manager_name: data.managerName,
        company_name: data.companyName,
        company_email: data.companyEmail,
        creator_type: data.creatorType,
        current_platforms: data.currentPlatforms,
        rating_payouts: data.ratingPayouts,
        rating_analytics: data.ratingAnalytics,
        rating_fan_management: data.ratingFanManagement,
        rating_scheduling: data.ratingScheduling,
        rating_messaging: data.ratingMessaging,
        rating_payment_processing: data.ratingPaymentProcessing,
        rating_onboarding: data.ratingOnboarding,
        rating_mobile_app: data.ratingMobileApp,
        comment_payouts: data.commentPayouts,
        comment_analytics: data.commentAnalytics,
        comment_fan_management: data.commentFanManagement,
        comment_scheduling: data.commentScheduling,
        comment_messaging: data.commentMessaging,
        comment_payment_processing: data.commentPaymentProcessing,
        comment_onboarding: data.commentOnboarding,
        comment_mobile_app: data.commentMobileApp,
        overall_score: data.overallScore,
        biggest_pain_point: data.biggestPainPoint,
        most_wanted_feature: data.mostWantedFeature,
        additional_comments: data.additionalComments,
        would_join_beta: data.wouldJoinBeta,
        email: data.email,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  },

  async getStats() {
    const { count } = await supabase
      .from("survey_responses")
      .select("*", { count: "exact", head: true });
    return { totalResponses: count ?? 0 };
  },
};
