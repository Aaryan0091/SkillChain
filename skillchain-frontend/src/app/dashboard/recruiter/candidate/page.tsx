import { Suspense } from "react";
import EmptyStateCard from "@/components/EmptyStateCard";
import RecruiterCandidatePageClient from "./RecruiterCandidatePageClient";

export default function RecruiterCandidateQueryPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
          <EmptyStateCard
            compact
            title="Opening candidate review"
            message="Loading recruiter context..."
          />
        </main>
      }
    >
      <RecruiterCandidatePageClient />
    </Suspense>
  );
}
