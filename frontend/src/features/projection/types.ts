export interface ProjectionEntry {
  cycleName: string
  projectedSalary: string
  projectedFixedExpenses: string
  projectedTaxes: string
  projectedInstallments: string
  projectedNetResult: string
}

export interface Alert {
  month: string
  deficit: string
}

export interface ProjectionResponse {
  projections: ProjectionEntry[]
  alerts: Alert[]
}

export interface InstallmentCommitment {
  cycleName: string
  totalCommitted: string
  installmentCount: number
}

export interface InstallmentCommitmentsResponse {
  commitments: InstallmentCommitment[]
}
