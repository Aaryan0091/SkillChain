import { redirect } from "next/navigation";
import { getSessionUser } from "@/utils/supabase/server";
import RecruiterSearchClient from "./RecruiterSearchClient";

export default async function RecruiterSearchPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <RecruiterSearchClient viewerId={user.id} />;
}
