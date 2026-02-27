import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as argon2 from "argon2";

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const adminEmail = "admin@financas.local";
  const adminPassword = "admin12345";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const passwordHash = await argon2.hash(adminPassword);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
      },
    });
    console.log(`Seed: admin user created (${adminEmail})`);
  } else {
    console.log(`Seed: admin user already exists (${adminEmail})`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
