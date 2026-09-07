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
