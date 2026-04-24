import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

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

  return (
    <main className="w-full p-6 pt-4 sm:p-8 sm:pt-4 lg:p-10 lg:pt-4 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Personal Details
        </h1>
        <p className="max-w-xl text-base text-muted leading-relaxed">
          Manage your profile and account settings.
        </p>
      </div>

      <div className="max-w-3xl">
        <div className="rounded-[2rem] border border-border/60 bg-surface/50 p-8 shadow-sm backdrop-blur-xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-border/50">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-accent to-accent-strong text-white flex items-center justify-center text-4xl font-bold shadow-inner border-4 border-background">
                {avatarLetter}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                <p className="text-muted mt-1">{displayEmail}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-accent/10 border-accent/20 text-accent/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    Active Account
                  </span>
                </div>
              </div>
            </div>

            <div className="py-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Account ID</label>
                  <p className="font-medium text-foreground font-mono text-sm break-all bg-surface-strong/50 p-2.5 rounded-xl border border-border/50">
                    {user.id}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Authentication Provider</label>
                  <p className="font-medium text-foreground capitalize bg-surface-strong/50 p-2.5 rounded-xl border border-border/50 flex items-center gap-2">
                    {user.app_metadata?.provider || 'Email'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Member Since</label>
                  <p className="font-medium text-foreground bg-surface-strong/50 p-2.5 rounded-xl border border-border/50">
                    {joinedDate}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Last Sign In</label>
                  <p className="font-medium text-foreground bg-surface-strong/50 p-2.5 rounded-xl border border-border/50">
                    {lastSignIn}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border/50 flex justify-end">
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-2.5 text-sm font-semibold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
