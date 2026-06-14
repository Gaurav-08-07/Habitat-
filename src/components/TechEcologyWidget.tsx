import React, { useState } from "react";
import { ActivityType } from "../types";
import { 
  Monitor, Smartphone, Mail, HardDrive, Zap, Sparkles, 
  BatteryCharging, CheckCircle, Info, RefreshCw, SmartphoneNfc 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TechEcologyWidgetProps {
  addImpactLog: (activityType: ActivityType, quantity: number, notes: string) => void;
}

export default function TechEcologyWidget({ addImpactLog }: TechEcologyWidgetProps) {
  // Simulator input values
  const [streamingHours, setStreamingHours] = useState<number>(3); // hours per day
  const [cloudStorage, setCloudStorage] = useState<number>(20); // GB of unused emails/backups
  const [vampireChargers, setVampireChargers] = useState<number>(4); // count of idle plug-ins
  
  // Action logging feedback states
  const [loggedAction, setLoggedAction] = useState<string | null>(null);

  // Footprint computations:
  // - Video streaming HD: ~0.15 kg CO2 per hour (daily * 30 days = monthly)
  const streamingOffsetMonthly = streamingHours * 0.15 * 30;
  // - Cloud standby storage: ~0.12 kg CO2 per GB per year or ~0.01 kg per month
  const cloudOffsetMonthly = cloudStorage * 0.01;
  // - Vampire chargers: each idle charger draws ~1.5W constantly, ~1.1 kWh/month, yielding ~0.5kg CO2
  const vampireOffsetMonthly = vampireChargers * 0.5;

  const totalTechFootprint = streamingOffsetMonthly + cloudOffsetMonthly + vampireOffsetMonthly;
  
  // Equivalents
  const carMilesEquivalent = totalTechFootprint / 0.41; // based on 0.41kg per mile
  const lightbulbHoursEquivalent = totalTechFootprint / 0.045; // ~10W incandescent equivalents

  // Pre-configured actionable electronic offsets
  const TECH_ACTIONS = [
    {
      id: "tech_vampire",
      title: "Vampire Charger Raid",
      benefit: "Saves 0.8kg CO₂ & removes background standby load",
      points: 40,
      co2: 0.8,
      icon: BatteryCharging,
      notes: "Tech: Unplugged warm standby charging bricks and idle display adapter hubs."
    },
    {
      id: "tech_digital",
      title: "Digital Storage Sweeper",
      benefit: "Saves 0.6kg CO₂ & reduces cooling power at data farms",
      points: 35,
      co2: 0.6,
      icon: Mail,
      notes: "Tech: Purged redundant cloud duplicates, archived videos, and deleted 500+ spam messages."
    },
    {
      id: "tech_dark_mode",
      title: "Enable Dark Mode Screen",
      benefit: "Saves 0.3kg CO₂ & preserves mobile OLED panel life",
      points: 20,
      co2: 0.3,
      icon: Smartphone,
      notes: "Tech: Activated auto-dark theme contrast constraints and minimized system monitor brightness."
    },
    {
      id: "tech_time",
      title: "Eco Auto-Sleep Trigger",
      benefit: "Saves 0.5kg CO₂ by lowering active monitor runtime",
      points: 30,
      co2: 0.5,
      icon: Monitor,
      notes: "Tech: Configured screen sleep timeouts to 5 minutes across primary devices."
    },
    {
      id: "tech_lifespan",
      title: "Extend Device Lifespan",
      benefit: "Saves 35.0kg CO₂ by skipping manufacturing cycles",
      points: 150,
      co2: 35.0,
      icon: SmartphoneNfc,
      notes: "Tech: Commited to repairing rather than replacing existing hardware for another active year."
    }
  ];

  const handleActionLog = (act: typeof TECH_ACTIONS[0]) => {
    // Log as 'electricity' category using standard helper
    // To support standard unit mapping in backend (which expects standard conversions on raw quantity),
    // we can calculate needed quantity such that computed co2 Saved equals our custom action save.
    // For electricity, co2PerUnit is 0.45 kg CO2 per kWh.
    // Quantity = desiredCO2 / 0.45.
    const calculatedKwh = act.co2 / 0.45;
    
    addImpactLog("electricity", calculatedKwh, act.notes);
    setLoggedAction(act.id);
    setTimeout(() => {
      setLoggedAction(null);
    }, 2000);
  };

  return (
    <div id="tech-ecology-hub" className="bg-white rounded-2xl p-6 border border-[#DCDAD2] shadow-sm space-y-6">
      
      {/* Header and subtitle */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F8F7F2]">
        <div className="flex items-center gap-2">
          <span className="bg-[#708238]/10 text-[#5A5A40] rounded-lg p-1.5 flex items-center justify-center">
            <Monitor className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-[#2C2C24]">
              Tech & Electronics Ecology Hub
            </h3>
            <p className="text-[11px] text-[#8A887C]">
              Interactive energy reduction and servers storage footprint optimization.
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#708238] bg-[#708238]/10 px-2 py-0.5 rounded-full">
          Digital Ecology
        </span>
      </div>

      {/* Two column grid layout (Simulator and Actions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Real-Time Digital Emissions Simulator */}
        <div className="bg-[#F8F7F2] rounded-xl p-5 border border-[#EBEAE3] flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5 select-none mb-4">
              <Zap className="w-3.5 h-3.5 text-[#708238]" />
              Digital Footprint Calculator
            </h4>

            <div className="space-y-4">
              {/* Slider 1: HD Streaming */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#2C2C24] mb-1">
                  <span>HD Streaming / Video Calls</span>
                  <span className="font-mono text-[#5A5A40]">{streamingHours} hrs/day</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={streamingHours}
                  onChange={(e) => setStreamingHours(Number(e.target.value))}
                  className="w-full accent-[#5A5A40] h-1.5 bg-[#DCDAD2] rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-[#8A887C]">HD video generates ~150g CO₂ e per streaming hour</span>
              </div>

              {/* Slider 2: Idle Cloud backups / spam */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#2C2C24] mb-1">
                  <span>Excessive Cloud Standby Storage</span>
                  <span className="font-mono text-[#5A5A40]">{cloudStorage} GB</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={cloudStorage}
                  onChange={(e) => setCloudStorage(Number(e.target.value))}
                  className="w-full accent-[#5A5A40] h-1.5 bg-[#DCDAD2] rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-[#8A887C]">1GB of unnecessary backups accounts for ~10g CO₂/month on server farms</span>
              </div>

              {/* Slider 3: Vampire wall bricks */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#2C2C24] mb-1">
                  <span>Vampire Sockets (Idle bricks plugged)</span>
                  <span className="font-mono text-[#5A5A40]">{vampireChargers} adapters</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={vampireChargers}
                  onChange={(e) => setVampireChargers(Number(e.target.value))}
                  className="w-full accent-[#5A5A40] h-1.5 bg-[#DCDAD2] rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-[#8A887C]">Adapters constantly leak backup phantom load when inactive</span>
              </div>
            </div>
          </div>

          {/* Footprint Indicator readout */}
          <div className="mt-6 pt-4 border-t border-[#EBEAE3] space-y-2.5">
            <div>
              <p className="text-[10px] text-[#8A887C] uppercase tracking-wider font-bold">Estimated Tech Footprint</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display text-2xl font-black text-[#5A5A40] font-mono">
                  {totalTechFootprint.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-[#5A5A40]">kg CO₂ e / month</span>
              </div>
            </div>

            {/* Equivalents list */}
            <div className="grid grid-cols-2 gap-2 bg-white/60 rounded-xl p-2.5 border border-[#EBEAE3]/60 text-[10px] text-[#2C2C24] select-none font-mono">
              <div>
                <span className="text-[#8A887C] block leading-3 mb-0.5 font-sans font-bold uppercase text-[8px] tracking-wide">Vehicle Drive Equivalent</span>
                <span className="text-[#2C2C24] font-black">{carMilesEquivalent.toFixed(1)} miles</span>
              </div>
              <div>
                <span className="text-[#8A887C] block leading-3 mb-0.5 font-sans font-bold uppercase text-[8px] tracking-wide">Lightbulb Run time</span>
                <span className="text-[#2C2C24] font-black">{Math.round(lightbulbHoursEquivalent)} light hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Smart Action checklist */}
        <div className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5 select-none mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#708238]" />
              Eco Tech Action Checklist
            </h4>
            
            <p className="text-xs text-[#8A887C] mb-3 leading-relaxed">
              Earn green points & complete personal targets instantly by completing and logging any carbon-safe digital action below:
            </p>

            <div className="space-y-2">
              {TECH_ACTIONS.map((act) => {
                const IconComponent = act.icon;
                const isLogged = loggedAction === act.id;
                return (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-2.5 bg-white border border-[#EBEAE3] hover:border-[#DCDAD2] rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-[#708238]/10 text-[#5A5A40] rounded-lg">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[11px] font-bold text-[#2C2C24] truncate leading-none">
                          {act.title}
                        </h5>
                        <p className="text-[9px] text-[#8A887C] truncate mt-0.5">
                          {act.benefit}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleActionLog(act)}
                      disabled={isLogged}
                      className={`flex items-center justify-center gap-1 text-[10px] font-bold rounded-lg px-2.5 py-1 transition-all cursor-pointer select-none ${
                        isLogged
                          ? "bg-emerald-500 text-white border border-emerald-500"
                          : "bg-[#5A5A40] text-white hover:bg-[#41412E]"
                      }`}
                    >
                      {isLogged ? (
                        <>
                          <CheckCircle className="w-3 h-3 animate-bounce" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <span>+{act.points} XP Log</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-1.5 bg-[#708238]/5 border border-[#708238]/10 p-2.5 rounded-xl text-[10px] text-[#708238]">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p className="leading-normal">
              Digital green logs feed directly into your weekly <strong>Personalized Targets</strong> as <strong>{`electricity`} electrical savings!</strong>
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
