"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import EmptyStateCard from "@/components/EmptyStateCard";
import { createClient } from "@/utils/supabase/client";
import RecruiterClient from "../RecruiterClient";

type ViewerState =
  | { status: "loading" }
  | { status: "ready"; id: string; label: string }
  | { status: "error"; message: string };

function viewerLabelFromUser(user: User | null) {
  return (
    (typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    (typeof user?.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    user?.email ||
    "Current recruiter"
  );
}

export default function RecruiterCandidatePageClient() {
  const searchParams = useSearchParams();
  const [viewer, setViewer] = useState<ViewerState>({ status: "loading" });

  useEffect(() => {
    let isActive = true;

    async function loadViewer() {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!isActive) return;

      if (error || !user) {
        setViewer({
          status: "error",
          message: "Please sign in again to open recruiter candidate review.",
        });
        return;
      }

      setViewer({
        status: "ready",
        id: user.id,
        label: viewerLabelFromUser(user),
      });
    }

    void loadViewer();

    return () => {
      isActive = false;
    };
  }, []);

  if (viewer.status === "loading") {
    return (
      <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <EmptyStateCard
          compact
          title="Opening candidate review"
          message="Loading recruiter context..."
        />
      </main>
    );
  }

  if (viewer.status === "error") {
    return (
      <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <EmptyStateCard
          compact
          title="Could not open candidate review"
          message={viewer.message}
          actionHref="/login"
          actionLabel="Go to login"
        />
      </main>
    );
  }

  const requestedCandidateId = searchParams.get("id") || "me";
  const resolvedCandidateId =
    requestedCandidateId === "me" ? viewer.id : requestedCandidateId;

  return (
    <RecruiterClient
      initialProjects={[]}
      viewerId={viewer.id}
      viewerLabel={viewer.label}
      candidateId={resolvedCandidateId}
      showCandidateSelector={false}
    />
  );
}
