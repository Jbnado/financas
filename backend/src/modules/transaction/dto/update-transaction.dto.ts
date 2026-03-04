import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateTransactionDto } from "./create-transaction.dto.js";

export class UpdateTransactionDto extends PartialType(
  OmitType(CreateTransactionDto, [
    "id",
    "billingCycleId",
    "parentTransactionId",
    "installmentNumber",
    "totalInstallments",
  ] as const),
) {}
