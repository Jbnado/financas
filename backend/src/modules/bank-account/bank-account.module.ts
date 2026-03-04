import { Module } from "@nestjs/common";
import { BankAccountController } from "./bank-account.controller.js";
import { BankAccountService } from "./bank-account.service.js";

@Module({
  controllers: [BankAccountController],
  providers: [BankAccountService],
  exports: [BankAccountService],
})
export class BankAccountModule {}
