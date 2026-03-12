import { ApiProperty } from "@nestjs/swagger";

export class ProjectionEntryDto {
  @ApiProperty({ example: "Abril 2026" }) cycleName!: string;
  @ApiProperty({ example: "7000.00" }) projectedSalary!: string;
  @ApiProperty({ example: "3200.00" }) projectedFixedExpenses!: string;
  @ApiProperty({ example: "800.00" }) projectedTaxes!: string;
  @ApiProperty({ example: "500.00" }) projectedInstallments!: string;
  @ApiProperty({ example: "2500.00" }) projectedNetResult!: string;
}

export class AlertDto {
  @ApiProperty({ example: "Julho 2026" }) month!: string;
  @ApiProperty({ example: "-1200.00" }) deficit!: string;
}

export class ProjectionResponseDto {
  @ApiProperty({ type: [ProjectionEntryDto] }) projections!: ProjectionEntryDto[];
  @ApiProperty({ type: [AlertDto] }) alerts!: AlertDto[];
}

export class InstallmentCommitmentDto {
  @ApiProperty({ example: "Abril 2026" }) cycleName!: string;
  @ApiProperty({ example: "1500.00" }) totalCommitted!: string;
  @ApiProperty({ example: 3 }) installmentCount!: number;
}

export class InstallmentCommitmentsResponseDto {
  @ApiProperty({ type: [InstallmentCommitmentDto] }) commitments!: InstallmentCommitmentDto[];
}
