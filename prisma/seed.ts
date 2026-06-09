
import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import "dotenv/config";

const userData: Prisma.UserCreateInput[] = [
  {
    id: "user-1",
    name: "Alice",
    email: "alice@prisma.io",
    mobile: "1234567890",
  },
  {
    id: "user-2",
    name: "Bob",
    email: "bob@prisma.io",
    mobile: "1234567891",
  },
];

export async function main() {
  for (const u of userData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u as any,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });