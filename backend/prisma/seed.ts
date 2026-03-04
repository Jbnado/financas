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

  // Seed bank accounts
  const existingAccounts = await prisma.bankAccount.findMany({
    where: { userId: adminUser.id },
  });

  if (existingAccounts.length === 0) {
    const bankAccounts = [
      { name: "Nubank CC", institution: "Nubank", type: "checking" as const, balance: 5000 },
      { name: "Itaú Poupança", institution: "Itaú", type: "savings" as const, balance: 10000 },
      { name: "PicPay", institution: "PicPay", type: "wallet" as const, balance: 500 },
    ];

    for (const ba of bankAccounts) {
      await prisma.bankAccount.create({
        data: {
          userId: adminUser.id,
          name: ba.name,
          institution: ba.institution,
          type: ba.type,
          balance: ba.balance,
        },
      });
    }
    console.log(`Seed: ${bankAccounts.length} bank accounts created`);
  } else {
    console.log(
      `Seed: bank accounts already exist (${existingAccounts.length} found)`,
    );
  }

  // Seed investments
  const existingInvestments = await prisma.investment.findMany({
    where: { userId: adminUser.id },
  });

  if (existingInvestments.length === 0) {
    const investments = [
      {
        name: "Tesouro Selic",
        type: "fixed_income" as const,
        institution: "Tesouro Direto",
        appliedAmount: 20000,
        currentValue: 21500,
        liquidity: "daily" as const,
        maturityDate: new Date("2029-01-01"),
      },
      {
        name: "Ações FII",
        type: "variable_income" as const,
        institution: "NuInvest",
        appliedAmount: 15000,
        currentValue: 16200,
        liquidity: "daily" as const,
        maturityDate: null,
      },
      {
        name: "Bitcoin",
        type: "crypto" as const,
        institution: "Binance",
        appliedAmount: 5000,
        currentValue: 7800,
        liquidity: "daily" as const,
        maturityDate: null,
      },
    ];

    for (const inv of investments) {
      await prisma.investment.create({
        data: {
          userId: adminUser.id,
          name: inv.name,
          type: inv.type,
          institution: inv.institution,
          appliedAmount: inv.appliedAmount,
          currentValue: inv.currentValue,
          liquidity: inv.liquidity,
          maturityDate: inv.maturityDate,
        },
      });
    }
    console.log(`Seed: ${investments.length} investments created`);
  } else {
    console.log(
      `Seed: investments already exist (${existingInvestments.length} found)`,
    );
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
