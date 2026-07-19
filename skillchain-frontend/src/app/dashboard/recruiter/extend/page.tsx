import { redirect } from "next/navigation";
import { getSessionUser } from "@/utils/supabase/server";
import ExtendRecruiterClient from "./ExtendRecruiterClient";

export default async function ExtendRecruiterPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <ExtendRecruiterClient recruiterId={user.id} />
    </main>
  );
}
