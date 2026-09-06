/**
 * Import carers from a CSV you already have a right to use.
 *
 *   npm run db:import-csv -- prisma/data/import-carers.csv
 *
 * Allowed sources (consent / a written right to list them is required):
 * - Carers who join at /register
 * - Your own CRM, agency roster, or prior-platform export
 * - Partner agencies with a listing agreement
 * - AHPRA / WWCC / NDIS numbers a carer already gave you, for verification only
 *
 * Do not scrape or republish profiles from Care.com, Mable, Hireup, Airtasker,
 * Seek, Gumtree, Facebook, Instagram, or LinkedIn.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { GeneratedCarer } from "./data/generate-carers";
import { slugifySuburb } from "./data/suburbs";
import { insertCarer } from "./insert-carer";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = process.env.IMPORT_PASSWORD ?? "CareProof123!";

const SOURCE_HELP = `
Usage:
  npm run db:import-csv -- prisma/data/import-carers.csv

Copy prisma/data/import-carers.example.csv and fill it with people who have
agreed to be listed, or with a roster you already own.

Where real profiles can come from:
  1. Self-serve — carers create an account at /register
  2. Owned data — CSV/XLSX from your CRM, agency, or previous product
  3. Partnerships — another provider supplies staff under a written agreement
  4. Public registers — AHPRA can verify a number someone already gave you.
     It is not a directory you can bulk-copy into marketplace profiles.

Do not extract listings from Care.com, Mable, Hireup, Airtasker, Seek, Gumtree,
or social networks. That breaks their terms and Australian privacy law.
`;

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    if (row.some((value) => value.trim())) rows.push(row);
  }
  return rows;
}

function parseCsv(text: string): Record<string, string>[] {
  const rows = parseCsvRows(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (row[index] ?? "").trim();
    });
    return record;
  });
}

function splitList(value: string) {
  return value
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function truthy(value: string) {
  return ["1", "true", "yes", "y"].includes(value.toLowerCase());
}

function dollarsToCents(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 4000;
  return Math.round(amount * 100);
}

function rowToCarer(row: Record<string, string>, index: number): GeneratedCarer | null {
  const name = row.name || [row.firstName, row.lastName].filter(Boolean).join(" ");
  const email = (row.email ?? "").toLowerCase();
  const suburb = row.suburb;
  const city = slugifySuburb(row.city || "");
  const state = slugifySuburb(row.state || "");
  if (!name || !email || !suburb || !city || !state) {
    console.warn(`Skipping row ${index + 2}: name, email, suburb, city and state are required.`);
    return null;
  }

  const specialties = splitList(row.specialties).map((slug) => slugifySuburb(slug));
  const credentialTypes = splitList(row.credentials);
  const yearsExperience = Math.max(1, Number(row.yearsExperience) || 1);
  const slug =
    row.slug ||
    `${slugifySuburb(name)}-${specialties[0] ?? "carer"}-${slugifySuburb(suburb)}`;

  return {
    email,
    name,
    slug,
    headline: row.headline || `${specialties[0] ?? "Carer"} in ${suburb}`,
    bio: row.bio || `${name} is a carer available around ${suburb}.`,
    hourlyRateCents: dollarsToCents(row.hourlyRateAud),
    yearsExperience,
    suburb,
    state,
    city,
    abn: row.abn || undefined,
    instantBook: truthy(row.instantBook),
    availableNow: row.availableNow ? truthy(row.availableNow) : true,
    specialties: specialties.length ? specialties : ["companion-care"],
    credentials: credentialTypes.map((type) => ({
      type: slugifySuburb(type).replace(/-/g, "_"),
      issuingState: state,
      months: 18,
    })),
    work:
      row.workEmployer || row.workTitle
        ? [
            {
              employer: row.workEmployer || "Private family",
              title: row.workTitle || "Carer",
              start: row.workStart || `${2026 - yearsExperience}-03-01`,
              end: row.workEnd || undefined,
              duties: row.workDuties || "In-home care for local families.",
              verification: row.workVerification || "document",
              hours: Number(row.workHours) || yearsExperience * 800,
            },
          ]
        : [],
    phone: row.phone || "",
  };
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.log(SOURCE_HELP);
    process.exit(1);
  }

  const filePath = resolve(fileArg);
  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.log(SOURCE_HELP);
    process.exit(1);
  }

  const [specialties, cities, existingUsers, existingSlugs] = await Promise.all([
    prisma.specialty.findMany(),
    prisma.city.findMany({ include: { state: true } }),
    prisma.user.findMany({ select: { email: true } }),
    prisma.caregiverProfile.findMany({ select: { slug: true } }),
  ]);

  if (specialties.length === 0 || cities.length === 0) {
    throw new Error("Run the main seed first so specialties and cities exist.");
  }

  const specBySlug = Object.fromEntries(specialties.map((item) => [item.slug, item]));
  const cityByKey = Object.fromEntries(cities.map((city) => [`${city.state.slug}:${city.slug}`, city.id]));
  const emails = new Set(existingUsers.map((user) => user.email));
  const slugs = new Set(existingSlugs.map((profile) => profile.slug));
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const rows = parseCsv(readFileSync(filePath, "utf8"));
  let created = 0;
  let skipped = 0;

  for (const [index, row] of rows.entries()) {
    const carer = rowToCarer(row, index);
    if (!carer) {
      skipped += 1;
      continue;
    }
    const cityId = cityByKey[`${carer.state}:${carer.city}`];
    if (!cityId) {
      console.warn(`Skipping ${carer.email}: unknown location ${carer.state}/${carer.city}`);
      skipped += 1;
      continue;
    }
    if (emails.has(carer.email) || slugs.has(carer.slug)) {
      console.warn(`Skipping ${carer.email}: already exists`);
      skipped += 1;
      continue;
    }
    await insertCarer(prisma, carer, passwordHash, specBySlug, cityId);
    emails.add(carer.email);
    slugs.add(carer.slug);
    created += 1;
  }

  const total = await prisma.caregiverProfile.count();
  console.log(`Imported ${created} carers (${skipped} skipped). Directory now has ${total} profiles.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
