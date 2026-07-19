import { redirect } from "next/navigation";
import { fetchDashboardProjects } from "@/lib/dashboard-data";
import { getSessionUser } from "@/utils/supabase/server";
import PublicRepoRecruiterClient from "./PublicRepoRecruiterClient";

export default async function RecruiterPublicReposPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const initialProjects = await fetchDashboardProjects(user.id).catch(() => []);
  const recruiterLabel =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    user.email ||
    "Current recruiter";

  return (
    <PublicRepoRecruiterClient
      recruiterId={user.id}
      recruiterLabel={recruiterLabel}
      savedProjectCount={initialProjects.length}
    />
  );
}
