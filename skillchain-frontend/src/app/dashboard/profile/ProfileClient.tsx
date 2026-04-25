"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, GitCommit, Award, Terminal, 
  Activity, Code, Zap, Calendar, Clock, 
  Mail, Fingerprint, LogOut, CheckCircle2,
  Cpu, Globe, Star, Hexagon, Layers,
  ChevronRight
} from "lucide-react";

interface ProfileClientProps {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarLetter: string;
    joinedDate: string;
    lastSignIn: string;
    provider: string;
  };
  signOutAction: () => Promise<void>;
}

export default function ProfileClient({ user, signOutAction }: ProfileClientProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-wider uppercase">Enterprise Profile</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">Credentials</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg mt-2">
          Comprehensive analysis of your developer identity, backed by AI assessment and secure verification.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8"
      >
        {/* Left Column - Identity */}
        <div className="lg:col-span-4 space-y-8">
          {/* Main Identity Card */}
          <motion.div variants={item} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-8 shadow-2xl backdrop-blur-xl">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent to-emerald-400 rounded-full blur-md opacity-40 animate-pulse" />
                <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-accent to-emerald-500 p-[2px]">
                  <div className="h-full w-full rounded-full bg-[#0f172a] flex items-center justify-center text-4xl font-bold text-white shadow-inner">
                    {user.avatarLetter}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#0f172a] rounded-full p-1 z-20">
                  <div className="bg-emerald-500 rounded-full p-1.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 className="h-4 w-4 text-[#0f172a]" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">{user.displayName}</h2>
              <p className="text-emerald-400 font-medium mb-4 flex items-center gap-1.5 justify-center">
                <Star className="h-4 w-4" /> Top 1% Developer
              </p>
              
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />
              
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5 transition-colors hover:bg-white/10">
                  <span className="text-sm text-muted-foreground">Trust Score</span>
                  <span className="text-lg font-bold text-white flex items-center gap-1">
                    99.8 <span className="text-emerald-400 text-sm">/100</span>
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5 transition-colors hover:bg-white/10">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-semibold text-[#0f172a] bg-emerald-400 px-2.5 py-1 rounded-md border border-emerald-300">
                    Fully Verified
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Details */}
          <motion.div variants={item} className="rounded-[2rem] border border-white/10 bg-surface/40 p-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-accent" />
              Account Details
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Email Address</p>
                  <p className="text-sm text-white font-medium truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Provider</p>
                  <p className="text-sm text-white font-medium capitalize">{user.provider}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Member Since</p>
                  <p className="text-sm text-white font-medium">{user.joinedDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Last Active</p>
                  <p className="text-sm text-white font-medium">{user.lastSignIn}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Terminal className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="overflow-hidden w-full">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">System ID</p>
                  <p className="text-xs text-muted-foreground font-mono truncate bg-background/50 p-2 rounded-lg mt-1 border border-white/5">{user.id}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Stats & Skills */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={item} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 backdrop-blur-xl hover:border-accent/40 transition-all duration-300 shadow-lg">
              <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <GitCommit className="h-32 w-32 text-accent" />
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/20">
                  <GitCommit className="h-6 w-6 text-accent" />
                </div>
                <h4 className="text-4xl font-bold text-white mb-2">2,491</h4>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Commits Analyzed</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 backdrop-blur-xl hover:border-blue-500/40 transition-all duration-300 shadow-lg">
              <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <Layers className="h-32 w-32 text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                  <Layers className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="text-4xl font-bold text-white mb-2">34</h4>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Repositories Verified</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 backdrop-blur-xl hover:border-purple-500/40 transition-all duration-300 shadow-lg">
              <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <Award className="h-32 w-32 text-purple-500" />
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-4xl font-bold text-white mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">A+</h4>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Code Quality Grade</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all duration-300 shadow-lg">
              <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <Activity className="h-32 w-32 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <Activity className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="text-4xl font-bold text-white mb-2 flex items-baseline gap-1">
                  99.9 <span className="text-xl text-emerald-400 font-bold">%</span>
                </h4>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Authenticity Rating</p>
              </div>
            </motion.div>
          </div>

          {/* Verified Skills */}
          <motion.div variants={item} className="rounded-[2rem] border border-white/10 bg-surface/40 p-8 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Code className="h-6 w-6 text-accent" />
                  Verified Tech Stack
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">AI-assessed proficiency based on deep analysis of real commit history.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
                <ShieldCheck className="h-4 w-4" />
                Blockchain Backed
              </div>
            </div>

            <div className="space-y-6">
              {[
                { name: "TypeScript", score: 96, color: "bg-blue-500" },
                { name: "React / Next.js", score: 92, color: "bg-cyan-400" },
                { name: "Solidity & Web3", score: 88, color: "bg-purple-500" },
                { name: "Node.js & Backend", score: 85, color: "bg-emerald-500" }
              ].map((skill, index) => (
                <div key={index} className="space-y-3 group">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">{skill.name}</span>
                    <span className="text-xs font-mono font-semibold text-white/80 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                      Score: <span className="text-emerald-400">{skill.score}</span>
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[#0f172a]/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                      className={`h-full rounded-full ${skill.color} relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite]" style={{ transform: 'translateX(-100%)' }} />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end items-center">
              <button className="text-sm font-semibold text-accent hover:text-emerald-400 transition-colors flex items-center gap-1 group">
                View detailed skill graph
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>

          {/* Action Footer */}
          <motion.div variants={item} className="flex justify-end pt-2">
            <button
              onClick={async () => {
                await signOutAction();
              }}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-red-500/10 border border-red-500/20 px-6 py-3 text-sm font-bold text-red-400 transition-all hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="relative z-10">Secure Sign Out</span>
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
