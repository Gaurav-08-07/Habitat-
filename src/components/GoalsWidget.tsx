import React, { useState } from "react";
import { Goal } from "../types";
import { Target, Plus, Calendar, Trophy, CheckCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GoalsWidgetProps {
  goals: Goal[];
  createGoal: (title: string, category: string, targetValue: number, unit: "kg CO2" | "habits", deadline: string) => void;
}

export default function GoalsWidget({ goals, createGoal }: GoalsWidgetProps) {
  const [showCreator, setShowCreator] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("general");
  const [unit, setUnit] = useState<"kg CO2" | "habits">("kg CO2");
  const [target, setTarget] = useState<number>(30);
  const [deadline, setDeadline] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || target <= 0) return;

    // Default deadline to 7 days if blank
    const finalDeadline = deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    createGoal(title.trim(), category, target, unit, finalDeadline);
    setTitle("");
    setDeadline("");
    setShowCreator(false);
  };

  const getPercentage = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div id="goals-tracker" className="bg-white rounded-2xl p-6 border border-[#DCDAD2] shadow-sm">
      <div className="flex justify-between items-center pb-3 border-b border-[#F8F7F2] mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-[#708238]/10 text-[#5A5A40] rounded-lg p-1.5 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-[#2C2C24]">
              Personalized Targets
            </h3>
            <p className="text-[11px] text-[#525146]">Custom sustainability missions. Completing rewards 100 XP!</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreator(!showCreator)}
          id="goals-creator-toggle-btn"
          className="flex items-center gap-1 bg-[#5A5A40] text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold hover:bg-[#41412E] transition-colors cursor-pointer"
          aria-expanded={showCreator}
          aria-label={showCreator ? "Show Actions" : "Create New Goal Target"}
        >
          {showCreator ? "Show Actions" : "Create Target"}
          {!showCreator && <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showCreator ? (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-[#F8F7F2] border border-[#EBEAE3] rounded-xl p-4 space-y-3 mb-4 overflow-hidden"
          >
            <h4 className="text-xs font-bold text-[#2C2C24] uppercase tracking-wider">Set New Green Goal</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="goal-title-input" className="text-[10px] uppercase font-bold text-[#525146] block mb-1">Goal Action Title</label>
                <input
                  id="goal-title-input"
                  type="text"
                  placeholder="e.g., Avoid 10kg CO2 from driving"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs text-[#2C2C24] px-2.5 py-2 rounded-lg border border-[#DCDAD2] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] bg-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="goal-category-select" className="text-[10px] uppercase font-bold text-[#525146] block mb-1">Impact Sector</label>
                <select
                  id="goal-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs text-[#2C2C24] px-2.5 py-2 rounded-lg border border-[#DCDAD2] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] bg-white"
                >
                  <option value="general">🌳 General Offset</option>
                  <option value="transport">🚗 Clean Transport</option>
                  <option value="energy">🔌 Energy Conservation</option>
                  <option value="diet">🥗 Eco Sourced Diet</option>
                  <option value="waste">♻️ Waste Reduction</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="goal-unit-select" className="text-[10px] uppercase font-bold text-[#525146] block mb-1">Target Type</label>
                <select
                  id="goal-unit-select"
                  value={unit}
                  onChange={(e) => {
                    const selectedUnit = e.target.value as "kg CO2" | "habits";
                    setUnit(selectedUnit);
                    setTarget(selectedUnit === "kg CO2" ? 30 : 5);
                  }}
                  className="w-full text-xs text-[#2C2C24] px-2.5 py-2 rounded-lg border border-[#DCDAD2] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] bg-white"
                >
                  <option value="kg CO2">CO2 reduction (kg)</option>
                  <option value="habits">Habit completions (count)</option>
                </select>
              </div>

              <div>
                <label htmlFor="goal-target-input" className="text-[10px] uppercase font-bold text-[#525146] block mb-1">Target Required</label>
                <input
                  id="goal-target-input"
                  type="number"
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="w-full text-xs text-[#2C2C24] px-2.5 py-2 rounded-lg border border-[#DCDAD2] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] bg-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="goal-deadline-input" className="text-[10px] uppercase font-bold text-[#525146] block mb-1">Deadline Date</label>
                <input
                  id="goal-deadline-input"
                  type="date"
                  value={deadline}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full text-xs text-[#2C2C24] px-2.5 py-1.5 rounded-lg border border-[#DCDAD2] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                id="goals-creator-cancel-btn"
                onClick={() => setShowCreator(false)}
                className="bg-[#F8F7F2] text-[#525146] rounded-lg px-3 py-1.5 text-xs font-semibold border border-[#DCDAD2] hover:bg-[#EBEAE3] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="goals-creator-submit-btn"
                className="bg-[#5A5A40] text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-[#41412E] transition-colors"
              >
                Launch goal
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
          >
            {goals.map((goal) => {
              const completed = goal.status === "completed";
              const pct = getPercentage(goal.currentValue, goal.targetValue);
              
              return (
                <div
                  key={goal.goalId}
                  className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                    completed
                      ? "bg-[#708238]/5 border-[#708238]/20 relative overflow-hidden"
                      : "bg-white border-[#EBEAE3] hover:border-[#DCDAD2]"
                  }`}
                >
                  {completed && (
                    <div className="absolute right-[-15px] top-[-15px] opacity-10 text-[#708238]" aria-hidden="true">
                      <Trophy className="w-16 h-16" />
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-xs font-bold leading-normal truncate max-w-[200px] ${completed ? "text-[#525146] line-through font-normal" : "text-[#2C2C24]"}`}>
                        {goal.title}
                      </h4>
                      <p className="text-[10px] text-[#525146] capitalize mt-0.5">
                        Sector: {goal.category} &bull; Target: {goal.targetValue} {goal.unit}
                      </p>
                    </div>

                    {completed ? (
                      <span className="flex items-center gap-0.5 text-[9px] uppercase tracking-wider font-extrabold text-[#708238] bg-[#708238]/10 border border-[#708238]/20 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Done!
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#525146] hover:text-[#2C2C24] flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        By {goal.deadline}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-semibold text-[#2C2C24] mb-1 font-mono">
                      <span>{goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit === "kg CO2" ? "kg" : "habits"}</span>
                      <span>{pct}%</span>
                    </div>

                    <div className="w-full bg-[#EBEAE3] h-1.5 rounded-full overflow-hidden" aria-hidden="true">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${completed ? "bg-[#708238]" : "bg-[#5A5A40]"}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && (
              <div className="col-span-2 text-center p-8 border border-dashed rounded-xl border-[#DCDAD2] text-[#525146]">
                <ShieldAlert className="w-6 h-6 text-slate-350 mx-auto mb-1.5" />
                <p className="text-xs">No targets set yet. Challenge yourself with a new target above!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
