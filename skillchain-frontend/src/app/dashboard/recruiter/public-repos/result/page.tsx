import { redirect } from "next/navigation";
import { getSessionUser } from "@/utils/supabase/server";
import PublicRepoResultClient from "./PublicRepoResultClient";

export default async function RecruiterPublicRepoResultPage({
  searchParams,
}: {
  searchParams: Promise<{ repo?: string; branch?: string }>;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  return (
    <PublicRepoResultClient
      recruiterId={user.id}
      initialRepoUrl={params.repo || ""}
      initialBranch={params.branch || ""}
    />
  );
}
