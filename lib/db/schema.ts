import {
  pgTable,
  pgEnum,
  text,
  numeric,
  timestamp,
  date,
  uuid,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

// NextAuth tables
export const users = pgTable("auth_user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
});

export const accounts = pgTable(
  "auth_account",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("auth_session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "auth_verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compositePk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const roleEnum = pgEnum("role", ["admin", "staff", "workshop"]);
export const fabricStatusEnum = pgEnum("fabric_status", [
  "active",
  "discontinued",
]);

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: roleEnum("role").notNull().default("staff"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fabrics = pgTable("fabrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  supplier: text("supplier"),
  stockMeters: numeric("stock_meters", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  avgCostPerMeter: numeric("avg_cost_per_meter", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  reorderThresholdMeters: numeric("reorder_threshold_meters", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0"),
  status: fabricStatusEnum("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fabricPurchases = pgTable("fabric_purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  fabricId: uuid("fabric_id")
    .notNull()
    .references(() => fabrics.id),
  meters: numeric("meters", { precision: 10, scale: 2 }).notNull(),
  costPerMeter: numeric("cost_per_meter", { precision: 10, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }).notNull(),
  supplier: text("supplier"),
  purchaseDate: date("purchase_date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
