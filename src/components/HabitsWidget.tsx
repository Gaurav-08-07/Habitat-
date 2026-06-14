import React, { useState } from "react";
import { Habit, HabitLog } from "../types";
import { PREDEFINED_HABITS } from "../data/habits";
import { CheckCircle2, Circle, Zap, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HabitsWidgetProps {
  habitLogs: HabitLog[];
  completeHabit: (habitId: string) => void;
  todayString: string;
}

export default function HabitsWidget({ habitLogs, completeHabit, todayString }: HabitsWidgetProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = ["all", "transport", "energy", "diet", "water", "waste"];

  const filteredHabits = activeCategory === "all"
    ? PREDEFINED_HABITS
    : PREDEFINED_HABITS.filter(h => h.category === activeCategory);

  const isHabitCompleted = (habitId: string) => {
    return habitLogs.some((log) => log.habitId === habitId && log.date === todayString);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "transport": return "text-[#708238] bg-[#708238]/10 border-[#708238]/20";
      case "energy": return "text-[#5A5A40] bg-[#5A5A40]/10 border-[#5A5A40]/20";
      case "diet": return "text-[#A3B18A] bg-[#A3B18A]/10 border-[#A3B18A]/20";
      case "water": return "text-[#A3B18A] bg-[#A3B18A]/10 border-[#A3B18A]/20";
      case "waste": return "text-[#8A887C] bg-[#8A887C]/10 border-[#8A887C]/20";
      default: return "text-[#2C2C24] bg-[#F8F7F2] border-[#EBEAE3]";
    }
  };

  return (
    <div id="habits-gamifier" className="bg-white rounded-2xl p-6 border border-[#DCDAD2] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#EBEAE3] pb-4 mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#2C2C24] flex items-center gap-2">
            <span className="bg-[#5A5A40] text-white rounded-lg p-1.5 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            Completed Sustainable Habits
          </h2>
          <p className="text-xs text-[#8A887C] mt-1">Check off green habits daily to gain points and lower carbon counts.</p>
        </div>

        {/* Categories scroll menu */}
        <div className="flex gap-1 overflow-x-auto py-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs capitalize font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-[#5A5A40] text-white border-[#5A5A40]"
                  : "bg-[#F8F7F2] text-[#8A887C] border-[#EBEAE3] hover:bg-[#EBEAE3]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {filteredHabits.map((habit) => {
            const completed = isHabitCompleted(habit.id);
            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => completeHabit(habit.id)}
                className={`flex justify-between items-start p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  completed
                    ? "bg-[#708238]/10 border-[#708238] shadow-sm"
                    : "bg-[#F8F7F2]/50 border-[#EBEAE3] hover:bg-[#F8F7F2] hover:border-[#DCDAD2]"
                }`}
              >
                <div className="flex gap-3">
                  <button className="mt-0.5 text-[#8A887C] hover:text-[#708238] transition-colors">
                    {completed ? (
                      <CheckCircle2 className="w-5.5 h-5.5 text-[#708238]" />
                    ) : (
                      <Circle className="w-5.5 h-5.5 hover:scale-105 transition-transform" />
                    )}
                  </button>
                  <div>
                    <h4 className={`text-sm font-bold ${completed ? "text-[#5A5A40]" : "text-[#2C2C24]"}`}>
                      {habit.title}
                    </h4>
                    <p className="text-xs text-[#8A887C] mt-0.5 leading-relaxed">
                      {habit.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border ${getCategoryColor(habit.category)}`}>
                        {habit.category}
                      </span>
                      <span className="text-[10px] text-[#708238] bg-[#708238]/10 font-mono font-bold px-1.5 py-0.5 rounded">
                        -{habit.co2Saved} kg CO₂
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-bold ${completed ? "text-[#708238]" : "text-[#8A887C]"}`}>
                    +{habit.points} XP
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {habitLogs.filter(l => l.date === todayString).length === 0 && (
        <div className="mt-4 text-center p-6 bg-[#F8F7F2]/50 border border-dashed border-[#DCDAD2] rounded-xl text-[#8A887C]">
          <p className="text-xs">No habits checked off today. Tap above to get started!</p>
        </div>
      )}
    </div>
  );
}
