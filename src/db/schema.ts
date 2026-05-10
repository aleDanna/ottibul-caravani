import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const vehicleType = pgEnum("vehicle_type", [
  "camper",
  "motorcycle",
  "car",
  "bicycle",
  "boat",
]);

export const vehicleStatus = pgEnum("vehicle_status", ["draft", "published"]);

export const localeEnum = pgEnum("locale", ["es", "ca", "en"]);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    type: vehicleType("type").notNull(),
    basePricePerDay: numeric("base_price_per_day", { precision: 10, scale: 2 }).notNull(),
    minRentalDays: integer("min_rental_days").default(1).notNull(),
    maxRentalDays: integer("max_rental_days"),
    location: text("location").notNull(),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{}'::jsonb`),
    status: vehicleStatus("status").default("draft").notNull(),
    featured: boolean("featured").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("vehicles_status_idx").on(t.status),
    typeIdx: index("vehicles_type_idx").on(t.type),
  }),
);

export const vehicleTranslations = pgTable(
  "vehicle_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
  },
  (t) => ({
    vehicleLocaleUnique: uniqueIndex("vehicle_translations_vehicle_locale_unique").on(
      t.vehicleId,
      t.locale,
    ),
  }),
);

export const vehicleImages = pgTable("vehicle_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isCover: boolean("is_cover").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  translations: many(vehicleTranslations),
  images: many(vehicleImages),
}));

export const vehicleTranslationsRelations = relations(vehicleTranslations, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleTranslations.vehicleId], references: [vehicles.id] }),
}));

export const vehicleImagesRelations = relations(vehicleImages, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleImages.vehicleId], references: [vehicles.id] }),
}));

export const faqStatus = pgEnum("faq_status", ["draft", "published"]);

export const faqs = pgTable("faqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: faqStatus("status").default("draft").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const faqTranslations = pgTable(
  "faq_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    faqId: uuid("faq_id")
      .notNull()
      .references(() => faqs.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
  },
  (t) => ({
    faqLocaleUnique: uniqueIndex("faq_translations_faq_locale_unique").on(t.faqId, t.locale),
  }),
);

export const faqsRelations = relations(faqs, ({ many }) => ({
  translations: many(faqTranslations),
}));

export const faqTranslationsRelations = relations(faqTranslations, ({ one }) => ({
  faq: one(faqs, { fields: [faqTranslations.faqId], references: [faqs.id] }),
}));

export const heroImageStatus = pgEnum("hero_image_status", ["draft", "published"]);

export const heroImages = pgTable("hero_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: heroImageStatus("status").default("draft").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
