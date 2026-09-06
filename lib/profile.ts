import type { CaregiverProfile, CaregiverSpecialty, Credential, WorkHistory } from "@prisma/client";

type ProfileBits = CaregiverProfile & {
  specialties: CaregiverSpecialty[];
  credentials: Credential[];
  workHistory: WorkHistory[];
};

export function profileChecklist(profile: ProfileBits) {
  const items = [
    {
      key: "headline",
      label: "Write a specific headline",
      done: Boolean(profile.headline) && profile.headline !== "New carer on CareProof",
    },
    {
      key: "bio",
      label: "Describe the care you offer",
      done: Boolean(profile.bio) && !profile.bio.startsWith("Tell families about your experience"),
    },
    {
      key: "specialties",
      label: "Choose at least one specialty",
      done: profile.specialties.length > 0,
    },
    {
      key: "credentials",
      label: "Add a WWCC, NDIS, AHPRA or police check",
      done: profile.credentials.length > 0,
    },
    {
      key: "work",
      label: "Add verified work history",
      done: profile.workHistory.length > 0,
    },
    {
      key: "rate",
      label: "Set your hourly rate",
      done: profile.hourlyRateCents >= 3000,
    },
  ];
  const complete = items.filter((item) => item.done).length;
  return {
    items,
    complete,
    total: items.length,
    ready: items.every((item) => item.done),
  };
}
