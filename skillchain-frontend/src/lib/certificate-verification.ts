export type CertificateStatusLike = {
  status?: string | null;
  verification_status?: string | null;
  verification_reason?: string | null;
  verification_url?: string | null;
  certificate_hash?: string | null;
  blockchain_tx?: string | null;
  contract_address?: string | null;
  created_at?: string | null;
};

export type ProjectVerificationLike = {
  analysis_status?: string | null;
};

export type VerificationCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type CertificateVerificationView = {
  state: "verified" | "pending" | "failed";
  badgeLabel: string;
  headline: string;
  summary: string;
  recruiterSummary: string;
  reason: string;
  badgeClass: string;
  checks: VerificationCheck[];
};

export function resolveCertificateVerification(
  certificate: CertificateStatusLike,
  project?: ProjectVerificationLike | null
): CertificateVerificationView {
  const status = certificate.status || null;
  const verificationStatus = certificate.verification_status || null;
  const analysisCompleted = project?.analysis_status === "completed";
  const hasPublicRecord = Boolean(certificate.verification_url && certificate.certificate_hash);
  const hasChainReference = Boolean(
    certificate.blockchain_tx || certificate.contract_address
  );
  const providedReason = certificate.verification_reason?.trim() || null;

  let state: CertificateVerificationView["state"] = "pending";

  if (verificationStatus === "verified" || status === "verified") {
    state = "verified";
  } else if (verificationStatus === "failed" || status === "failed") {
    state = "failed";
  }

  const checks: VerificationCheck[] = [
    {
      label: "Analysis completed",
      passed: analysisCompleted,
      detail: analysisCompleted
        ? "The repository analysis finished successfully."
        : "The repository analysis is not completed yet.",
    },
    {
      label: "Certificate payload saved",
      passed: hasPublicRecord,
      detail: hasPublicRecord
        ? "A public certificate record and integrity hash are stored."
        : "The public certificate payload or its integrity hash is missing.",
    },
    {
      label: "Blockchain anchor available",
      passed: hasChainReference,
      detail: hasChainReference
        ? "A chain transaction or contract reference is attached to this certificate."
        : "No blockchain anchor has been attached yet.",
    },
  ];

  if (state === "verified") {
    return {
      state,
      badgeLabel: "Verified",
      headline: "Verification passed",
      summary:
        "This certificate passed the final proof checks and the stored certificate hash matches its blockchain reference.",
      recruiterSummary:
        "Use this as a trusted project-level proof record for the candidate.",
      reason:
        providedReason ||
        "The certificate payload, stored hash, and blockchain reference all match.",
      badgeClass: "border-accent/30 bg-accent/15 text-accent",
      checks,
    };
  }

  if (state === "failed") {
    return {
      state,
      badgeLabel: "Failed",
      headline: "Verification failed",
      summary:
        "This certificate did not pass the final proof checks. Treat it as not trusted until the record is regenerated or reverified.",
      recruiterSummary:
        "Do not treat this certificate as verified proof right now.",
      reason:
        providedReason ||
        (!analysisCompleted
          ? "Repository analysis is not completed yet."
          : !hasPublicRecord
            ? "The public certificate payload or integrity hash is missing."
            : hasChainReference
              ? "Blockchain verification did not pass for this certificate."
              : "The blockchain anchor could not be written or confirmed for this certificate."),
      badgeClass: "border-red-400/25 bg-red-500/10 text-red-300",
      checks,
    };
  }

  return {
    state,
    badgeLabel: "Pending",
    headline: "Verification pending",
    summary:
      "The project certificate exists, but final proof is still incomplete. The analysis may be done while blockchain confirmation or final verification is still pending.",
    recruiterSummary:
      "Treat this as an issued certificate that is not fully verified yet.",
    reason:
      providedReason ||
      (!analysisCompleted
        ? "Repository analysis is still running, so certificate verification has not started."
        : !hasPublicRecord
          ? "The certificate record exists, but its public verification payload is incomplete."
          : "The certificate is waiting for its final blockchain verification step."),
    badgeClass: "border-[#a8f5e9]/30 bg-[#a8f5e9]/10 text-[#a8f5e9]",
    checks,
  };
}
