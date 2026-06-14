import React from "react";
import { UserProfile, HabitLog, ImpactLog } from "../types";
import { PREDEFINED_HABITS } from "../data/habits";
import { Leaf, Award, Flame, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface StatsWidgetProps {
  profile: UserProfile;
  habitLogs: HabitLog[];
  impactLogs: ImpactLog[];
}

export default function StatsWidget({ profile, habitLogs, impactLogs }: StatsWidgetProps) {
  // Let's calculate the breakdown of savings dynamically as part of the real-time feedback
  const categories = {
    transport: 0,
    energy: 0,
    diet: 0,
    waste: 0,
    water: 0
  };

  // Add savings from daily habits
  habitLogs.forEach((log) => {
    const cat = log.category as keyof typeof categories;
    if (cat in categories) {
      categories[cat] += log.carbonSaved;
    } else {
      categories.waste += log.carbonSaved; // fallback
    }
  });

  // Add savings from continuous logs
  impactLogs.forEach((log) => {
    // some mapping if needed
    let cat: keyof typeof categories = "energy";
    if (log.activityType === "driving" || log.activityType === "transport") cat = "transport";
    else if (log.activityType === "electricity") cat = "energy";
    else if (log.activityType === "diet") cat = "diet";
    else if (log.activityType === "waste") cat = "waste";

    categories[cat] += log.carbonSaved;
  });

  const totalCalculated = Object.values(categories).reduce((a, b) => a + b, 0);

  // Compute XP percentage toward next level (250 XP per level)
  const currentLevelXP = (profile.level - 1) * 250;
  const relativeXP = profile.points - currentLevelXP;
  const xpPercentage = Math.min(100, Math.max(0, (relativeXP / 250) * 100));

  const categoryColors = {
    transport: "bg-[#708238]",
    energy: "bg-[#5A5A40]",
    diet: "bg-[#A3B18A]",
    waste: "bg-[#8A887C]",
    water: "bg-[#A3B18A]/70"
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total offset display */}
      <motion.div 
        id="stat-impact"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#5A5A40] text-white rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
      >
        <div className="absolute right-[-20px] top-[-20px] text-[#A3B18A] opacity-20 transform rotate-12">
          <Leaf className="w-48 h-48" />
        </div>
        
        <div className="flex justify-between items-start z-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#C4ECCF] font-bold">Real-Time Impact</p>
            <h3 className="font-display text-4xl font-bold mt-1 tracking-tight text-white">
              {profile.totalOffset.toFixed(1)} <span className="text-xl font-light opacity-90">kg CO₂</span>
            </h3>
            <p className="text-[#F2F1EA]/80 text-xs mt-1">Total emissions offset or avoided</p>
          </div>
          <div className="bg-[#708238]/50 p-2.5 rounded-lg border border-[#A3B18A]/30">
            <Leaf className="w-5 h-5 text-[#C4ECCF]" />
          </div>
        </div>

        <div className="mt-8 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/10">
            <Flame className="w-3.5 h-3.5 text-[#C4ECCF] animate-pulse" />
            <span>Eco Streak Active</span>
          </div>
          <p className="text-xs text-[#F2F1EA]/70 mt-2 font-mono">
            Equivalent to absorbing {Math.max(1, Math.round(profile.totalOffset / 0.06))} forest tree-days of CO₂
          </p>
        </div>
      </motion.div>

      {/* Level and XP progress tracker */}
      <motion.div 
        id="stat-levels"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-[#DCDAD2] flex flex-col justify-between shadow-sm"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#525146] font-bold">Gamified Progress</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="font-display text-4xl font-bold text-[#2C2C24]">Lvl {profile.level}</h3>
              <span className="text-xs font-bold text-[#708238] bg-[#708238]/10 px-2.5 py-0.5 rounded-md">
                {profile.points} total XP
              </span>
            </div>
            <p className="text-xs text-[#525146] mt-1">Earn points by checking green habits</p>
          </div>
          <div className="bg-[#F8F7F2] p-2.5 rounded-lg border border-[#EBEAE3] text-[#5A5A40]">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-xs text-[#2C2C24] font-mono mb-1.5">
            <span>Level Progress</span>
            <span>{relativeXP} / 250 XP</span>
          </div>
          <div className="w-full bg-[#EBEAE3] h-2.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-[#5A5A40] rounded-full"
            />
          </div>
          <p className="text-[11px] text-[#525146] mt-2 text-right">
            {250 - relativeXP} XP needed for Level {profile.level + 1}
          </p>
        </div>
      </motion.div>

      {/* CO2 Savings Breakdown */}
      <motion.div 
        id="stat-breakdown"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-[#DCDAD2] flex flex-col justify-between shadow-sm"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#525146] font-bold">Offset Sectors</p>
            <h4 className="font-display text-lg font-bold text-[#2C2C24] mt-1">Sustainability Scope</h4>
            <p className="text-xs text-[#525146] mt-1">Saved distribution per lifestyle category</p>
          </div>
          <div className="bg-[#F8F7F2] p-2.5 rounded-lg border border-[#EBEAE3] text-[#5A5A40]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {Object.entries(categories).map(([category, value]) => {
            const pct = totalCalculated > 0 ? (value / totalCalculated) * 100 : 0;
            return (
              <div key={category} className="space-y-0.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="capitalize text-[#2C2C24] font-semibold">{category}</span>
                  <span className="text-[#525146] font-mono text-[11px]">{value.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-[#F8F7F2] h-1.5 rounded-full overflow-hidden border border-[#EBEAE3]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${categoryColors[category as keyof typeof categories] || "bg-slate-400"}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
