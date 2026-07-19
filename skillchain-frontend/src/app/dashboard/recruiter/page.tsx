import { redirect } from "next/navigation";
import { getSessionUser } from "@/utils/supabase/server";

export default async function RecruiterPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  redirect("/dashboard/recruiter/search");
}
