import React, { useState } from "react";
import { ActivityType, ImpactLog } from "../types";
import { EMISSION_CONVERSIONS } from "../data/habits";
import { PlusCircle, Activity, Calendar, Footprints, Fuel, Lightbulb, ChefHat, Trash, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImpactLoggerWidgetProps {
  impactLogs: ImpactLog[];
  addImpactLog: (activityType: ActivityType, quantity: number, notes: string) => void;
}

export default function ImpactLoggerWidget({ impactLogs, addImpactLog }: ImpactLoggerWidgetProps) {
  const [activeType, setActiveType] = useState<ActivityType>("driving");
  const [quantity, setQuantity] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // Get active conversion constants
  const conversionInfo = EMISSION_CONVERSIONS[activeType];
  const calculatedSavings = Number((quantity * conversionInfo.co2PerUnit).toFixed(2));
  const calculatedPoints = Math.round(quantity * conversionInfo.pointsPerUnit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    addImpactLog(activeType, quantity, notes.trim());
    setSuccess(true);
    setNotes("");

    setTimeout(() => {
      setSuccess(false);
    }, 2500);
  };

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "driving": return <Fuel className="w-4 h-4" />;
      case "transport": return <Footprints className="w-4 h-4" />;
      case "electricity": return <Lightbulb className="w-4 h-4" />;
      case "diet": return <ChefHat className="w-4 h-4" />;
      case "waste": return <Trash className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case "driving": return "bg-[#F8F7F2] text-[#525146] border-[#EBEAE3] text-red-700/80";
      case "transport": return "bg-[#708238]/10 text-[#708238] border-[#708238]/20";
      case "electricity": return "bg-[#5A5A40]/10 text-[#5A5A40] border-[#5A5A40]/20";
      case "diet": return "bg-[#A3B18A]/15 text-[#708238] border-[#A3B18A]/30";
      case "waste": return "bg-[#525146]/10 text-[#2C2C24] border-[#EBEAE3]";
    }
  };

  return (
    <div id="impact-logger" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Logger Form */}
      <div id="real-time-impact-logger" className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#DCDAD2] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-[#F8F7F2]">
            <span className="bg-[#5A5A40]/10 text-[#5A5A40] rounded-lg p-1.5 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="font-display text-lg font-bold text-[#2C2C24]">
              Real-Time Impact Logger
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Sector selection */}
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#525146] block mb-1.5">
                Activity Category
              </span>
              <div className="grid grid-cols-5 gap-1.5" role="tablist" aria-label="Impact Category Options">
                {(Object.keys(EMISSION_CONVERSIONS) as ActivityType[]).map((type) => (
                  <button
                    key={type}
                    id={`impact-category-btn-${type}`}
                    type="button"
                    role="tab"
                    aria-selected={activeType === type}
                    aria-label={`Select impact category of ${type}`}
                    onClick={() => {
                      setActiveType(type);
                      setQuantity(type === "diet" || type === "waste" ? 2 : 5);
                    }}
                    className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all capitalize cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#5A5A40] ${
                      activeType === type
                        ? "bg-[#5A5A40] text-white border-[#5A5A40] font-bold scale-[1.02]"
                        : "bg-[#F8F7F2] text-[#525146] border-[#EBEAE3] hover:bg-[#EBEAE3] hover:text-[#2C2C24]"
                    }`}
                  >
                    {getIcon(type)}
                    <span className="text-[9px] font-semibold tracking-tight">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity metric selector */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label id="impact-quantity-range-label" htmlFor="impact-quantity-range-input" className="text-xs font-semibold text-[#2C2C24]">
                  {conversionInfo.label}
                </label>
                <span className="text-xs font-mono font-bold text-[#2C2C24]">
                  {quantity} {conversionInfo.unit}
                </span>
              </div>
              <input
                id="impact-quantity-range-input"
                type="range"
                aria-describedby="impact-quantity-range-label"
                min="1"
                max={activeType === "diet" || activeType === "waste" ? "10" : "50"}
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-[#5A5A40] h-2 bg-[#EBEAE3] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#525146] font-mono mt-1">
                <span>1 {conversionInfo.unit}</span>
                <span>{activeType === "diet" || activeType === "waste" ? "10" : "50"} {conversionInfo.unit}</span>
              </div>
            </div>

            {/* Custom explanations */}
            <div>
              <label htmlFor="impact-notes-text-input" className="text-xs font-semibold text-[#2C2C24] block mb-1">
                Notes / Context (Optional)
              </label>
              <input
                id="impact-notes-text-input"
                type="text"
                placeholder={conversionInfo.placeholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs text-[#2C2C24] px-3 py-2 rounded-lg border border-[#DCDAD2] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] bg-[#F8F7F2]/50"
              />
            </div>
          </form>
        </div>

        {/* Impact Live display calculations */}
        <div className="mt-6 border-t border-[#F8F7F2] pt-4">
          <div className="bg-[#708238]/10 border border-[#708238]/20 rounded-xl p-3 text-center mb-4">
            <h4 className="text-[11px] uppercase tracking-wider text-[#708238] font-bold">Dynamic Prediction</h4>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="font-display text-lg font-extrabold text-[#2C2C24] font-mono">
                {calculatedSavings} kg CO₂
              </span>
              <span className="text-xs text-[#525146]">avoided</span>
            </div>
            <p className="text-[10px] text-[#708238] mt-1 font-semibold">
              🎁 Awards +{calculatedPoints} XP Points instantly
            </p>
          </div>

          <button
            type="button"
            id="impact-submit-btn"
            onClick={handleSubmit}
            className="w-full bg-[#5A5A40] text-white rounded-xl py-2.5 text-xs font-bold hover:bg-[#41412E] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Submit Impact Log
          </button>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-1.5 mt-2 bg-[#708238]/10 text-[#708238] text-xs py-1.5 rounded-lg border border-[#708238]/20"
              >
                <ShieldCheck className="w-4 h-4 text-[#708238]" />
                <span>Impact logged successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* History Feed list */}
      <div id="activity-impact-feed" className="lg:col-span-3 bg-white rounded-2xl p-6 border border-[#DCDAD2] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-[#F8F7F2]">
            <span className="bg-[#F8F7F2] text-[#2C2C24] rounded-lg p-1.5 flex items-center justify-center border border-[#EBEAE3]">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="font-display text-lg font-bold text-[#2C2C24]">
              Activity Impact Feed
            </h3>
          </div>

          <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {impactLogs.length > 0 ? (
                impactLogs.map((log) => (
                  <motion.div
                    key={log.logId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex justify-between items-center p-3 rounded-xl border border-dotted border-[#EBEAE3] bg-[#F8F7F2]/20"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-lg border ${getActivityColor(log.activityType)}`}>
                        {getIcon(log.activityType)}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-[#2C2C24] capitalize">
                          Logged {log.quantity} {log.unit}
                        </h5>
                        <p className="text-[10px] text-[#525146] font-medium">
                          {log.notes || `Category: ${log.activityType} offsetting Carbon`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#708238] font-mono block">
                        -{log.carbonSaved} kg
                      </span>
                      <span className="text-[10px] text-[#525146] font-mono font-bold">
                        +{log.pointsEarned} XP
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center p-12 text-[#525146]">
                  <p className="text-xs">No metrics logged yet. Make your first entry on the left!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-right mt-4 text-[10px] text-[#525146] font-mono">
          Logs calculate real-time environmental savings dynamically
        </div>
      </div>
    </div>
  );
}
