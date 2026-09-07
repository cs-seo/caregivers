export type HandoverFields = {
  handoverAccess: string;
  handoverCare: string;
  handoverEmergency: string;
};

export type HandoverSource = {
  handoverAccess?: string | null;
  handoverCare?: string | null;
  handoverEmergency?: string | null;
};

export const HANDOVER_LIMITS = {
  handoverAccess: 500,
  handoverCare: 500,
  handoverEmergency: 160,
} as const;

export function readHandover(source?: HandoverSource | null): HandoverFields {
  return {
    handoverAccess: source?.handoverAccess?.trim() ?? "",
    handoverCare: source?.handoverCare?.trim() ?? "",
    handoverEmergency: source?.handoverEmergency?.trim() ?? "",
  };
}

export function handoverFromForm(formData: FormData): HandoverFields {
  return {
    handoverAccess: String(formData.get("handoverAccess") ?? "")
      .trim()
      .slice(0, HANDOVER_LIMITS.handoverAccess),
    handoverCare: String(formData.get("handoverCare") ?? "")
      .trim()
      .slice(0, HANDOVER_LIMITS.handoverCare),
    handoverEmergency: String(formData.get("handoverEmergency") ?? "")
      .trim()
      .slice(0, HANDOVER_LIMITS.handoverEmergency),
  };
}

export function handoverToDb(fields: HandoverFields) {
  return {
    handoverAccess: fields.handoverAccess || null,
    handoverCare: fields.handoverCare || null,
    handoverEmergency: fields.handoverEmergency || null,
  };
}

export function hasHandover(source?: HandoverSource | null) {
  const fields = readHandover(source);
  return Boolean(fields.handoverAccess || fields.handoverCare || fields.handoverEmergency);
}

export function handoverGaps(source?: HandoverSource | null) {
  const fields = readHandover(source);
  return {
    access: !fields.handoverAccess,
    care: !fields.handoverCare,
    emergency: !fields.handoverEmergency,
  };
}

const GAP_LABELS = {
  access: "access",
  care: "care notes",
  emergency: "emergency",
} as const;

export function missingHandoverLabels(source?: HandoverSource | null) {
  const gaps = handoverGaps(source);
  return (Object.keys(GAP_LABELS) as (keyof typeof GAP_LABELS)[])
    .filter((key) => gaps[key])
    .map((key) => GAP_LABELS[key]);
}

export function isHandoverComplete(source?: HandoverSource | null) {
  return missingHandoverLabels(source).length === 0;
}

export function joinHandoverGaps(labels: string[]) {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

export function handoverGapSummary(source?: HandoverSource | null) {
  const missing = missingHandoverLabels(source);
  if (missing.length === 0) return "Handover ready";
  if (missing.length === 3) return "Handover · missing all notes";
  return `Handover · missing ${joinHandoverGaps(missing)}`;
}

export function fillEmptyHandover(target?: HandoverSource | null, source?: HandoverSource | null): HandoverFields {
  const current = readHandover(target);
  const fill = readHandover(source);
  return {
    handoverAccess: current.handoverAccess || fill.handoverAccess,
    handoverCare: current.handoverCare || fill.handoverCare,
    handoverEmergency: current.handoverEmergency || fill.handoverEmergency,
  };
}

export function handoverWouldChange(target?: HandoverSource | null, source?: HandoverSource | null) {
  const filled = fillEmptyHandover(target, source);
  const current = readHandover(target);
  return (
    filled.handoverAccess !== current.handoverAccess ||
    filled.handoverCare !== current.handoverCare ||
    filled.handoverEmergency !== current.handoverEmergency
  );
}

export function canFillFromHousehold(target?: HandoverSource | null, household?: HandoverSource | null) {
  return hasHandover(household) && handoverWouldChange(target, household);
}
