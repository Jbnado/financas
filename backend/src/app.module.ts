import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { BillingCycleModule } from "./modules/billing-cycle/billing-cycle.module.js";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard.js";

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, BillingCycleModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
