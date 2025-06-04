export interface KycApiResult {
  activated: boolean;
  activationBlockNumber: string | null;
  kycLastUpdateBlockNumber: string | null;
  kycLevel: string;
  reputation: string;
}

export interface KycApiResponse {
  status: string;
  message: string;
  result: KycApiResult | string;
}

export interface KycStatus {
  isActivated: boolean;
  kycLevel: string | null;
  reputation: string | null;
  activationBlockNumber?: string | null;
  kycLastUpdateBlockNumber?: string | null;
  error?: string;
  checkedAt?: Date;
}

export interface GraphiteAccountInfo {
  balance: string;
  active: boolean;
  kycLevel: string;
  kycFilterLevel: string;
  reputation: string;
}