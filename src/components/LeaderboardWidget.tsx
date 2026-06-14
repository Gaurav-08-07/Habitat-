import React from "react";
import { LeaderboardEntry } from "../types";
import { Trophy, Award, Users, ShieldAlert, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface LeaderboardWidgetProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

export default function LeaderboardWidget({ entries, currentUserId }: LeaderboardWidgetProps) {
  // Sum up all cumulative offset of the group for the combined social feel
  const totalCommunityOffset = entries.reduce((acc, entry) => acc + entry.totalOffset, 0);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="flex items-center justify-center bg-amber-50 text-amber-700 border border-amber-200 w-6 h-6 rounded-full text-xs font-black shadow-sm" aria-hidden="true">
            🥇
          </span>
        );
      case 2:
        return (
          <span className="flex items-center justify-center bg-[#F8F7F2] text-[#525146] border border-[#DCDAD2] w-6 h-6 rounded-full text-xs font-black" aria-hidden="true">
            🥈
          </span>
        );
      case 3:
        return (
          <span className="flex items-center justify-center bg-amber-50 text-amber-900 border border-amber-100 w-6 h-6 rounded-full text-xs font-black" aria-hidden="true">
            🥉
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center bg-[#F8F7F2] text-[#525146] w-6 h-6 rounded-full text-[11px] font-bold font-mono">
            {rank}
          </span>
        );
    }
  };

  return (
    <div id="social-leaderboard" className="bg-white rounded-2xl p-6 border border-[#DCDAD2] shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F8F7F2] mb-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="bg-[#708238]/10 text-[#5A5A40] rounded-lg p-1.5 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#5A5A40]" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-[#2C2C24]">
                Community Board
              </h3>
              <p className="text-[11px] text-[#525146]">Compete with friends and local climate peers.</p>
            </div>
          </div>
          <span className="text-xs bg-[#708238]/10 text-[#708238] border border-[#708238]/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#708238]" />
            Live
          </span>
        </div>

        {/* Aggregate Community Offset Counter Card */}
        <div className="bg-gradient-to-r from-[#5A5A40] to-[#708238] text-white rounded-xl p-3.5 opacity-95 flex items-center justify-between shadow-sm mb-4">
          <div>
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#F2F1EA] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-white" />
              Collective Impact
            </h4>
            <p className="font-display text-lg font-bold mt-0.5 leading-none">
              {totalCommunityOffset.toFixed(1)} kg CO₂ avoided
            </p>
          </div>
          <span className="text-[10px] bg-white/15 px-2 py-1 rounded text-[#F2F1EA] font-mono font-bold leading-none">
            5 Peers Active
          </span>
        </div>

        {/* Leaderboard Table rows */}
        <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
          {entries.map((entry) => {
            const isMe = entry.userId === currentUserId || entry.userId === "local_user";
            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isMe
                    ? "bg-[#5A5A40] border-[#5A5A40] text-white shadow-md scale-[1.01]"
                    : "bg-[#F8F7F2]/50 border-[#EBEAE3] hover:bg-[#F8F7F2]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankBadge(entry.rank || 0)}
                  <img
                    referrerPolicy="no-referrer"
                    src={entry.avatarUrl}
                    alt={entry.displayName}
                    className="w-8 h-8 rounded-full object-cover border border-[#DCDAD2]"
                  />
                  <div>
                    <h5 className={`text-xs font-black truncate max-w-[120px] ${isMe ? "text-white" : "text-[#2C2C24]"}`}>
                      {entry.displayName}
                    </h5>
                    <p className={`text-[10px] ${isMe ? "text-[#A3B18A] font-semibold" : "text-[#525146] font-medium"}`}>
                      Lvl {entry.level} &bull; {entry.points} XP
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-bold ${isMe ? "text-[#A3B18A]" : "text-[#708238]"}`}>
                    -{entry.totalOffset.toFixed(1)} kg
                  </span>
                  <p className="text-[9px] text-[#525146] font-mono leading-none mt-0.5">offset</p>
                </div>
              </div>
            );
          })}

          {entries.length === 0 && (
            <div className="text-center p-12 text-[#525146]">
              <ShieldAlert className="w-5 h-5 mx-auto mb-1.5" />
              <p className="text-xs">Leaderboard data initializing...</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#F8F7F2] pt-3.5 mt-4 text-[10px] text-[#525146] text-center">
        Leaderboard updates in real-time as users save emissions!
      </div>
    </div>
  );
}
