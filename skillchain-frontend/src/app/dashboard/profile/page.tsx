import { redirect } from "next/navigation";
import { getSessionUser } from "@/utils/supabase/server";
import { averageNumbers } from "@/lib/formatting";
import { fetchDashboardProjects, type ProjectRecord } from "@/lib/dashboard-data";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Developer";

  const displayEmail = user.email || "dev@skillchain.ai";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "D";
  
  const lastSignIn = user.last_sign_in_at 
    ? new Date(user.last_sign_in_at).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "Unknown";
    
  const joinedDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })
    : "Unknown";

  const userData = {
    id: user.id,
    email: displayEmail,
    displayName,
    avatarLetter,
    joinedDate,
    lastSignIn,
    provider: user.app_metadata?.provider || 'Email',
  };

  let projects: ProjectRecord[] = [];
  let loadError: string | null = null;

  try {
    projects = await fetchDashboardProjects(user.id);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load profile data.";
  }

  const certificatesIssued = projects.reduce(
    (count, project) => count + (project.certificates?.length || 0),
    0
  );
  const verifiedCertificates = projects.reduce(
    (count, project) =>
      count +
      (project.certificates?.filter(
        (certificate) => certificate.verification_status === "verified"
      ).length || 0),
    0
  );
  const confidenceAverage = averageNumbers(
    projects.map((project) => project.scores?.[0]?.confidence_score)
  );
  const architectureAverage = averageNumbers(
    projects.map((project) => project.scores?.[0]?.architecture_score)
  );

  const skillProjectCounts = new Map<string, number>();
  for (const project of projects) {
    const frameworkSkills = project.metrics?.[0]?.raw_metrics_json?.frameworks || [];
    const evidenceSkills = project.scores?.[0]?.score_breakdown_json?.skillEvidence || [];
    const projectSkills = new Set<string>(
      [...frameworkSkills, ...evidenceSkills]
        .map((skill) => skill?.trim())
        .filter(Boolean)
    );

    for (const skill of projectSkills) {
      skillProjectCounts.set(skill, (skillProjectCounts.get(skill) || 0) + 1);
    }
  }

  const colorPool = [
    "bg-blue-500",
    "bg-cyan-400",
    "bg-purple-500",
    "bg-emerald-500",
    "bg-amber-400",
  ];

  const verifiedSkills = Array.from(skillProjectCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, projectCount], index) => ({
      name,
      score:
        projects.length > 0 ? Math.round((projectCount / projects.length) * 100) : 0,
      projectCount,
      totalProjects: projects.length,
      color: colorPool[index % colorPool.length],
    }));

  const profileStats = {
    repositoriesAnalyzed: projects.length,
    certificatesIssued,
    verifiedCertificates,
    confidenceAverage,
    architectureAverage,
  };

  return (
    <main className="min-h-screen w-full px-4 pt-4 pb-10 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
      <ProfileClient
        user={userData}
        profileStats={profileStats}
        verifiedSkills={verifiedSkills}
        loadError={loadError}
      />
    </main>
  );
}
