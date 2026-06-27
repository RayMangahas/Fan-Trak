-- FAN-TRAK Initial Schema
-- Run this in your Supabase project: SQL Editor → New Query → paste & run

-- ── Waitlist Submissions ─────────────────────────────────────────────────────
create table if not exists waitlist_submissions (
  id                bigserial primary key,
  created_at        timestamptz default now(),
  name              text not null,
  stage_name        text,
  email             text not null,
  creator_type      text,
  has_manager       text,
  manager_name      text,
  company_name      text,
  company_email     text,
  primary_platform  text,
  source            text default 'landing_page',
  additional_info   text
);

-- ── Floor Research Responses ─────────────────────────────────────────────────
create table if not exists research_responses (
  id                    bigserial primary key,
  created_at            timestamptz default now(),
  full_name             text,
  stage_name            text,
  research_email        text,
  creator_type          text,
  has_manager           text,
  manager_name          text,
  company_name          text,
  company_email         text,
  platforms             text,
  hours_per_day         text,
  biggest_pain          text,
  chargeback            text,
  attribution           text,
  consolidation_value   integer,
  open_response         text
);

-- ── Creator Survey Responses ─────────────────────────────────────────────────
create table if not exists survey_responses (
  id                        bigserial primary key,
  created_at                timestamptz default now(),
  full_name                 text,
  stage_name                text,
  personal_email            text,
  creator_type_self         text,
  has_manager               integer,  -- 0 or 1
  manager_name              text,
  company_name              text,
  company_email             text,
  creator_type              text,
  current_platforms         text,
  rating_payouts            integer,
  rating_analytics          integer,
  rating_fan_management     integer,
  rating_scheduling         integer,
  rating_messaging          integer,
  rating_payment_processing integer,
  rating_onboarding         integer,
  rating_mobile_app         integer,
  comment_payouts           text,
  comment_analytics         text,
  comment_fan_management    text,
  comment_scheduling        text,
  comment_messaging         text,
  comment_payment_processing text,
  comment_onboarding        text,
  comment_mobile_app        text,
  overall_score             integer,
  biggest_pain_point        text,
  most_wanted_feature       text,
  additional_comments       text,
  would_join_beta           integer,  -- 0 or 1
  email                     text
);

-- ── Row-Level Security ───────────────────────────────────────────────────────
-- Enable RLS on all tables (data is private — only service role can read)
alter table waitlist_submissions enable row level security;
alter table research_responses   enable row level security;
alter table survey_responses     enable row level security;

-- Public INSERT only (anyone can submit a form)
create policy "Allow public insert on waitlist"
  on waitlist_submissions for insert
  with check (true);

create policy "Allow public insert on research"
  on research_responses for insert
  with check (true);

create policy "Allow public insert on survey"
  on survey_responses for insert
  with check (true);

-- No public SELECT — only service_role (your backend) can read
-- To grant co-founder access, create a Supabase user and add a policy:
-- create policy "Allow authed read" on waitlist_submissions
--   for select using (auth.role() = 'authenticated');
