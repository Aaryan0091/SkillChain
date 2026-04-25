import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

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

  return (
    <main className="w-full min-h-screen p-4 sm:p-8 pt-4 lg:p-10 lg:pt-4">
      <ProfileClient user={userData} signOutAction={signOut} />
    </main>
  );
}
