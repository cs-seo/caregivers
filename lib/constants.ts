export const SITE_NAME = "CareProof";
export const SITE_TAGLINE = "Verified carers across Australia";
export const PLATFORM_ENTITY = "CareProof Pty Ltd";
export const PLATFORM_ABN = "11 222 333 444";
export const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? "1000");
export const AUTO_RELEASE_HOURS = 72;
export const DEMO_PASSWORD = "CareProof123!";

export const ROLES = {
  FAMILY: "FAMILY",
  CAREGIVER: "CAREGIVER",
} as const;

export const BOOKING_STATUS = {
  PENDING_ACCEPTANCE: "pending_acceptance",
  AWAITING_PAYMENT: "awaiting_payment",
  ESCROW_HELD: "escrow_held",
  IN_PROGRESS: "in_progress",
  PENDING_RELEASE: "pending_release",
  RELEASED: "released",
  DISPUTED: "disputed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  HELD: "held",
  RELEASED: "released",
  REFUNDED: "refunded",
  FAILED: "failed",
} as const;

export const WORK_VERIFICATION = {
  UNVERIFIED: "unverified",
  DOCUMENT: "document",
  EMPLOYER_CONFIRMED: "employer_confirmed",
  PLATFORM_COMPLETED: "platform_completed",
} as const;

export const CREDENTIAL_TYPES = {
  WWCC: "wwcc",
  NDIS_SCREENING: "ndis_screening",
  POLICE_CHECK: "police_check",
  AHPRA: "ahpra",
  FIRST_AID: "first_aid",
  CHILD_FIRST_AID: "child_first_aid",
  AGED_CARE_SCREENING: "aged_care_screening",
} as const;

export const CREDENTIAL_LABELS: Record<string, string> = {
  wwcc: "Working with Children Check",
  ndis_screening: "NDIS Worker Screening",
  police_check: "National Police Check",
  ahpra: "AHPRA registration",
  first_aid: "First aid (asthma & anaphylaxis)",
  child_first_aid: "Child first aid (HLTAID012)",
  aged_care_screening: "Aged Care Worker Screening",
};

export const WORK_VERIFICATION_LABELS: Record<string, string> = {
  unverified: "Unverified",
  document: "Document verified",
  employer_confirmed: "Employer confirmed",
  platform_completed: "Completed on CareProof",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending_acceptance: "Waiting for carer",
  awaiting_payment: "Awaiting payment",
  escrow_held: "Funds in escrow",
  in_progress: "Care in progress",
  pending_release: "Ready to release",
  released: "Paid to carer",
  disputed: "In dispute",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const BOOKING_OCCASIONS = [
  { value: "date-night", label: "Date night" },
  { value: "last-minute", label: "Last-minute sit" },
  { value: "after-school", label: "After school" },
  { value: "weekday", label: "Weekday day sit" },
  { value: "overnight", label: "Overnight" },
  { value: "holiday", label: "Holiday / visiting family" },
  { value: "recurring", label: "Recurring booking" },
] as const;

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
