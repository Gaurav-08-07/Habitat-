import React from "react";
import { AISuggestions } from "../types";
import { Sparkles, RefreshCw, AlertCircle, Lightbulb, Compass, Send } from "lucide-react";
import { motion } from "motion/react";

interface AICoachWidgetProps {
  suggestions: AISuggestions | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function AICoachWidget({ suggestions, loading, error, onRefresh }: AICoachWidgetProps) {
  return (
    <div id="ai-sustainability-coach" className="bg-gradient-to-br from-[#5A5A40] to-[#2C2C24] text-white rounded-2xl p-6 border border-[#5A5A40] shadow-lg flex flex-col justify-between h-full relative overflow-hidden">
      {/* Visual background ambient details */}
      <div className="absolute right-[-20px] bottom-[-20px] text-[#A3B18A] opacity-10 transform -rotate-12 select-none">
        <Sparkles className="w-44 h-44" />
      </div>

      <div className="z-10">
        <div className="flex justify-between items-start pb-4 border-b border-[#A3B18A]/20">
          <div className="flex items-center gap-3">
            <span className="bg-[#708238]/30 text-[#A3B18A] rounded-full w-10 h-10 flex items-center justify-center border border-[#A3B18A]/20">
              <Sparkles className="w-5 h-5 text-[#A3B18A] animate-pulse" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#F2F1EA] flex items-center gap-1.5 leading-none">
                AI Green Coach
              </h3>
              <p className="text-[10px] text-[#A3B18A] mt-1 font-medium select-none">
                Powered by Gemini 3.5 &bull; Real-Time Data Analysis
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg bg-[#708238]/20 border border-[#708238]/40 hover:bg-[#708238]/40 transition-colors cursor-pointer group disabled:opacity-40"
            title="Refresh green suggestions"
            aria-label="Refresh green suggestions"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#A3B18A] ${loading ? "animate-spin" : "group-hover:rotate-45 transition-transform"}`} />
          </button>
        </div>

        {/* Dynamic Display Area */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#A3B18A] border-t-transparent"></div>
              <Sparkles className="w-4 h-4 text-[#A3B18A] absolute" />
            </div>
            <p className="text-xs text-[#F2F1EA]/80 font-medium animate-pulse">
              Analyzing daily logs & tracking goals progress...
            </p>
          </div>
        ) : error ? (
          <div className="py-8 flex flex-col items-center text-center justify-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-xs text-rose-300">Could not retrieve automated recommendations.</p>
            <button
              onClick={onRefresh}
              className="text-[11px] font-semibold text-[#A3B18A] underline hover:text-white"
            >
              Retry Connection
            </button>
          </div>
        ) : suggestions ? (
          <div className="mt-4 space-y-4 animate-fade-in">
            {/* Coaching statement block */}
            <blockquote className="bg-[#2C2C24]/40 border-l-2 border-[#A3B18A] p-3 rounded-r-xl text-xs text-[#F2F1EA] italic leading-relaxed font-medium">
              "{suggestions.coachingStatement}"
            </blockquote>

            {/* Daily actionable tips */}
            <div className="space-y-2">
              <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-[#A3B18A] flex items-center gap-1.5 select-none">
                <Lightbulb className="w-3.5 h-3.5 text-[#F2F1EA]" />
                Custom Sustainability Handouts
              </h4>
              <ul className="space-y-1.5">
                {suggestions.dailyTips.map((tip, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-1.5 text-xs text-white/90 leading-relaxed font-semibold bg-[#2C2C24]/20 p-2.5 rounded-lg border border-[#A3B18A]/10"
                  >
                    <span className="text-[#A3B18A] mt-0.5">•</span>
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Goal-oriented strategies */}
            {suggestions.goalStrategies && suggestions.goalStrategies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-[#A3B18A] flex items-center gap-1.5 select-none">
                  <Compass className="w-3.5 h-3.5 text-[#A3B18A]" />
                  Target-Driven Action Items
                </h4>
                <div className="space-y-1.5">
                  {suggestions.goalStrategies.map((strategy, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-[#F2F1EA] bg-[#708238]/20 border border-[#A3B18A]/10 p-2.5 rounded-lg font-medium"
                    >
                      {strategy}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-[#A3B18A]/60">
            <p className="text-xs">No advice available yet. Click refresh to query your AI coach!</p>
          </div>
        )}
      </div>

      <div className="border-t border-[#A3B18A]/20 pt-4 mt-6 flex justify-between items-center text-[10px] text-[#A3B18A]/70 select-none z-10 font-mono">
        <span>Active Feedback Mechanism</span>
        <span>Goal status synced</span>
      </div>
    </div>
  );
}
