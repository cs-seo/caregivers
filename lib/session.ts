import { auth } from "@/auth";
import { prisma } from "./prisma";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { caregiverProfile: true, familyProfile: true },
  });
  return user;
}

export async function requireRole(role: "FAMILY" | "CAREGIVER") {
  const user = await requireUser();
  if (!user || user.role !== role) return null;
  return user;
}
