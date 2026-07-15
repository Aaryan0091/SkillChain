import { redirect } from "next/navigation";
import { fetchDashboardProjects } from "@/lib/dashboard-data";
import { getSessionUser } from "@/utils/supabase/server";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const initialProjects = await fetchDashboardProjects(user.id).catch(() => []);

  return <ProjectsClient initialProjects={initialProjects} />;
}
