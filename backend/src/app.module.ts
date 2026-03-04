import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { BillingCycleModule } from "./modules/billing-cycle/billing-cycle.module.js";
import { CategoryModule } from "./modules/category/category.module.js";
import { PaymentMethodModule } from "./modules/payment-method/payment-method.module.js";
import { PersonModule } from "./modules/person/person.module.js";
import { TransactionModule } from "./modules/transaction/transaction.module.js";
import { SplitModule } from "./modules/split/split.module.js";
import { ReceivableModule } from "./modules/receivable/receivable.module.js";
import { FixedExpenseModule } from "./modules/fixed-expense/fixed-expense.module.js";
import { TaxModule } from "./modules/tax/tax.module.js";
import { ReportModule } from "./modules/report/report.module.js";
import { ProjectionModule } from "./modules/projection/projection.module.js";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard.js";

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, BillingCycleModule, CategoryModule, PaymentMethodModule, PersonModule, TransactionModule, SplitModule, ReceivableModule, FixedExpenseModule, TaxModule, ReportModule, ProjectionModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
