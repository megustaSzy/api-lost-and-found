import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

// seeder testing testttt

async function main() {
  const hashedPassword = await bcrypt.hash("Admin123@", 10);

  await prisma.tb_user.create({
    data: {
      name: "Admin",
      email: "himawand656@gmail.com",
      password: hashedPassword,
      notelp: "08572772",
      role: "Admin",
    },
  });
}

main()
  .then(() => console.log("Seeding done"))
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
