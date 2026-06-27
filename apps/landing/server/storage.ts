import { supabase } from "./db";
import type { InsertWaitlist, InsertResearch } from "@shared/schema";

export const storage = {
  async addWaitlist(data: InsertWaitlist) {
    const { data: row, error } = await supabase
      .from("waitlist_submissions")
      .insert({
        name: data.name,
        stage_name: data.stageName,
        email: data.email,
        creator_type: data.creatorType,
        has_manager: data.hasManager,
        manager_name: data.managerName,
        company_name: data.companyName,
        company_email: data.companyEmail,
        primary_platform: data.primaryPlatform,
        source: data.source ?? "landing_page",
        additional_info: data.additionalInfo,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  },

  async getWaitlistCount(): Promise<number> {
    const { count, error } = await supabase
      .from("waitlist_submissions")
      .select("*", { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  },

  async addResearch(data: InsertResearch) {
    const { data: row, error } = await supabase
      .from("research_responses")
      .insert({
        full_name: data.fullName,
        stage_name: data.stageName,
        research_email: data.researchEmail,
        creator_type: data.creatorType,
        has_manager: data.hasManager,
        manager_name: data.managerName,
        company_name: data.companyName,
        company_email: data.companyEmail,
        platforms: data.platforms,
        hours_per_day: data.hoursPerDay,
        biggest_pain: data.biggestPain,
        chargeback: data.chargeback,
        attribution: data.attribution,
        consolidation_value: data.consolidationValue,
        open_response: data.openResponse,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  },
};
