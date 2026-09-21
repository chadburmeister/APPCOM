import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@/lib/id";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  // "member" = a rep; sees only their own calls/scores.
  // "coach"  = sees every call and score, and can manage users.
  role: text("role").notNull().default("member"),
  // Deactivated accounts can't log in, but their calls/scorecards are kept
  // intact rather than cascade-deleted, so history survives someone leaving.
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calls = pgTable("calls", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  repName: text("rep_name").notNull(),
  accountName: text("account_name").notNull(),
  callDate: timestamp("call_date", { withTimezone: true }).notNull(),
  recordingUrl: text("recording_url"),
  context: text("context"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scorecards = pgTable(
  "scorecards",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    callId: text("call_id")
      .notNull()
      .references(() => calls.id, { onDelete: "cascade" }),
    scorerId: text("scorer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // A - Acceptance
    acceptanceScore: integer("acceptance_score").notNull(),
    acceptanceNotes: text("acceptance_notes"),

    // P - Purpose
    purposeScore: integer("purpose_score").notNull(),
    purposeStatedEarly: boolean("purpose_stated_early"),
    purposeNotes: text("purpose_notes"),

    // P - Probing
    probingScore: integer("probing_score").notNull(),
    qualQuestion1: text("qual_question_1"),
    qualQuestion2: text("qual_question_2"),
    qualQuestion3: text("qual_question_3"),
    uncoveredChallenges: boolean("uncovered_challenges"),
    uncoveredCostOfInaction: boolean("uncovered_cost_of_inaction"),
    uncoveredIdealSolution: boolean("uncovered_ideal_solution"),
    understoodBuyingProcess: boolean("understood_buying_process"),
    probingNotes: text("probing_notes"),

    // C - Consulting
    consultingScore: integer("consulting_score").notNull(),
    consultingNotes: text("consulting_notes"),

    // O - Overcome Objections
    objectionsScore: integer("objections_score").notNull(),
    objectionsNotes: text("objections_notes"),

    // M - Motivate to Act
    motivateScore: integer("motivate_score").notNull(),
    motivateNotes: text("motivate_notes"),

    overallRating: integer("overall_rating").notNull(),
    overallNotes: text("overall_notes"),

    submitted: boolean("submitted").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("scorecards_call_scorer_idx").on(table.callId, table.scorerId)]
);

export const usersRelations = relations(users, ({ many }) => ({
  callsCreated: many(calls),
  scorecards: many(scorecards),
}));

export const callsRelations = relations(calls, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [calls.createdById],
    references: [users.id],
  }),
  scorecards: many(scorecards),
}));

export const scorecardsRelations = relations(scorecards, ({ one }) => ({
  call: one(calls, {
    fields: [scorecards.callId],
    references: [calls.id],
  }),
  scorer: one(users, {
    fields: [scorecards.scorerId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Call = typeof calls.$inferSelect;
export type Scorecard = typeof scorecards.$inferSelect;
