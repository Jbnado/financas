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

  let adminUser = existing;
  if (!adminUser) {
    const passwordHash = await argon2.hash(adminPassword);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
      },
    });
    console.log(`Seed: admin user created (${adminEmail})`);
  } else {
    console.log(`Seed: admin user already exists (${adminEmail})`);
  }

  const categories = [
    { name: "Alimentação", icon: "utensils", color: "#f97316" },
    { name: "Transporte", icon: "car", color: "#3b82f6" },
    { name: "Moradia", icon: "home", color: "#8b5cf6" },
    { name: "Lazer", icon: "gamepad-2", color: "#ec4899" },
    { name: "Saúde", icon: "heart-pulse", color: "#ef4444" },
    { name: "Educação", icon: "graduation-cap", color: "#14b8a6" },
    { name: "Tecnologia", icon: "laptop", color: "#6366f1" },
    { name: "Vestuário", icon: "shirt", color: "#f59e0b" },
    { name: "Outros", icon: "ellipsis", color: "#6b7280" },
  ];

  const existingCategories = await prisma.category.findMany({
    where: { userId: adminUser.id },
  });

  if (existingCategories.length === 0) {
    for (const cat of categories) {
      await prisma.category.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          userId: adminUser.id,
        },
      });
    }
    console.log(`Seed: ${categories.length} categories created`);
  } else {
    console.log(
      `Seed: categories already exist (${existingCategories.length} found)`,
    );
  }

  const persons = [
    { name: "Eu" },
    { name: "Maria" },
    { name: "João" },
  ];

  const existingPersons = await prisma.person.findMany({
    where: { userId: adminUser.id },
  });

  if (existingPersons.length === 0) {
    for (const person of persons) {
      await prisma.person.create({
        data: {
          name: person.name,
          userId: adminUser.id,
        },
      });
    }
    console.log(`Seed: ${persons.length} persons created`);
  } else {
    console.log(
      `Seed: persons already exist (${existingPersons.length} found)`,
    );
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
