import React from "react";
import { useCarbonTracker } from "./hooks/useCarbonTracker";
import StatsWidget from "./components/StatsWidget";
import HabitsWidget from "./components/HabitsWidget";
import ImpactLoggerWidget from "./components/ImpactLoggerWidget";
import TechEcologyWidget from "./components/TechEcologyWidget";
import GoalsWidget from "./components/GoalsWidget";
import LeaderboardWidget from "./components/LeaderboardWidget";
import AICoachWidget from "./components/AICoachWidget";
import { 
  Leaf, LogIn, LogOut, Info, ShieldAlert, Sparkles, AlertCircle,
  Award, TrendingUp, Activity, Calendar, Target, Trophy, 
  ChevronLeft, ChevronRight, Menu, LayoutGrid, Monitor 
} from "lucide-react";
import { isFirebaseConfigured } from "./lib/firebase";
import { motion } from "motion/react";

const NAVIGATION_ITEMS = [
  { id: "stat-impact", label: "Real Time Impact", icon: Leaf, desc: "Avoided kg CO₂ metrics" },
  { id: "stat-levels", label: "Gamified Progress", icon: Award, desc: "XP levels & milestones" },
  { id: "stat-breakdown", label: "Offset Sectors", icon: TrendingUp, desc: "Scope category distribution" },
  { id: "habits-gamifier", label: "Completed Sustainable Habits", icon: Sparkles, desc: "Daily recurring eco checklist" },
  { id: "ai-sustainability-coach", label: "AI Green Coach", icon: Sparkles, desc: "Gemini action coaching" },
  { id: "real-time-impact-logger", label: "Real Time Impact Logger", icon: Activity, desc: "Interactive custom tracker" },
  { id: "activity-impact-feed", label: "Activity Impact Feed", icon: Calendar, desc: "Live carbon offsets timeline" },
  { id: "tech-ecology-hub", label: "Tech & Electronics Hub", icon: Monitor, desc: "Ecology carbon simulator & offsets" },
  { id: "goals-tracker", label: "Personalized Targets", icon: Target, desc: "Custom missions tracking" },
  { id: "social-leaderboard", label: "Community Board", icon: Trophy, desc: "Peer leaderboard positions" }
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<string | null>(null);

  const {
    currentUser,
    userProfile,
    habitLogs,
    impactLogs,
    goals,
    leaderboard,
    aiSuggestions,
    loading,
    aiLoading,
    aiError,
    completeHabit,
    addImpactLog,
    createGoal,
    getAISuggestions,
    handleSignIn,
    handleSignOut,
    todayString
  } = useCarbonTracker();

  const handleScrollTo = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Temporary high-contrast pulsing ring indicator for tactile selection feel
      element.classList.add("ring-4", "ring-[#708238]/60", "ring-offset-2", "scale-[1.015]", "transition-all", "duration-500");
      setTimeout(() => {
        element.classList.remove("ring-4", "ring-[#708238]/60", "ring-offset-2", "scale-[1.015]");
      }, 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <Leaf className="w-5 h-5 text-emerald-500 absolute top-3.5 left-3.5 animate-pulse" />
        </div>
        <p className="text-sm text-slate-600 font-semibold animate-pulse font-sans">
          Eco System Initiating...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F2F1EA] text-[#2C2C24] pb-12 antialiased selection:bg-[#A3B18A]/30 selection:text-[#5A5A40] transition-all duration-300 ${
      sidebarOpen ? "lg:pl-64" : "lg:pl-16"
    }`}>
      
      {/* Retractable Sidebar Navigation Panel */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-[#DCDAD2] shadow-sm flex flex-col transition-all duration-300 ease-in-out pt-20 ${
          sidebarOpen ? "w-64" : "w-12 lg:w-16"
        }`}
      >
        {/* Toggle Expand/Retract Handle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-24 bg-[#5A5A40] text-white rounded-full p-1 border border-[#DCDAD2] hover:bg-[#41412E] active:scale-90 transition-all shadow-sm z-50 cursor-pointer"
          title={sidebarOpen ? "Retract Sidebar" : "Expand Sidebar"}
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? "Collapse navigation sidebar" : "Expand navigation sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar Frame Header */}
        <div className="p-3 border-b border-[#EBEAE3] flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <Menu className="w-4 h-4 text-[#5A5A40] flex-shrink-0" />
          {sidebarOpen && (
            <span className="text-[10px] font-black text-[#5A5A40] uppercase tracking-wider animate-fade-in">
              Navigation Panel
            </span>
          )}
        </div>

        {/* Navigation Items Stack */}
        <div className="flex-1 overflow-y-auto px-1.5 py-4 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left group cursor-pointer ${
                  isActive 
                    ? "bg-[#5A5A40] text-white font-bold" 
                    : "text-[#2C2C24] hover:bg-[#F8F7F2]"
                }`}
                title={item.label}
                aria-label={`Navigate to ${item.label}`}
              >
                <div className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-[#5A5A40] group-hover:bg-[#EBEAE3]"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <div className="overflow-hidden transition-all duration-200 animate-fade-in w-full">
                    <p className="text-[11px] font-black leading-none truncate">{item.label}</p>
                    <p className={`text-[9px] truncate mt-0.5 ${isActive ? "text-[#F2F1EA]/80" : "text-[#525146]"}`}>
                      {item.desc}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Indicator */}
        <div className="p-3 border-t border-[#EBEAE3] text-center">
          {sidebarOpen ? (
            <span className="text-[9px] text-[#525146] font-mono leading-none tracking-tight block">
              Sidebar Dock Active
            </span>
          ) : (
            <LayoutGrid className="w-4 h-4 mx-auto text-[#525146]" />
          )}
        </div>
      </aside>

      {/* Top Header Banner */}
      <header className="bg-white border-b border-[#DCDAD2] sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="bg-[#5A5A40] text-white rounded-xl p-2.5 flex items-center justify-center shadow-sm shadow-[#5A5A40]/10">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-[#5A5A40] flex items-center gap-1.5">
                Carbon Footprint & Habits Tracker
              </h1>
              <p className="text-xs text-[#525146] font-medium">
                Gamified sustainability dashboards logging real-world environmental offsets.
              </p>
            </div>
          </div>

          {/* Sync mode and Auth Action controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              isFirebaseConfigured
                ? "bg-[#5A5A40]/10 text-[#5A5A40] border-[#DCDAD2]"
                : "bg-amber-50 text-amber-700 border-amber-150"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConfigured ? "bg-[#708238]" : "bg-amber-500 animate-pulse"}`} />
              <span>{isFirebaseConfigured ? "Firebase Cloud Mode" : "Local-Storage Mode"}</span>
            </span>

            {userProfile ? (
              <div className="flex items-center gap-2">
                <img
                  referrerPolicy="no-referrer"
                  src={userProfile.avatarUrl}
                  alt={userProfile.displayName}
                  className="w-8 h-8 rounded-full border border-[#DCDAD2] object-cover"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-[#2C2C24] leading-tight">
                    {userProfile.displayName}
                  </p>
                  <p className="text-[10px] text-[#525146] font-medium leading-none">
                    Guest Account
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 bg-[#F8F7F2] hover:bg-[#EBEAE3] text-[#2C2C24] rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-[#DCDAD2] cursor-pointer shadow-sm active:scale-95 transition-all"
                  title="Sign out or reset"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-1.5 bg-[#5A5A40] hover:bg-[#41412E] text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm cursor-pointer active:scale-95 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Link Player</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Dynamic Jump Station - Shortcut Navigation Tabs */}
        <div className="bg-white border border-[#DCDAD2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F8F7F2] pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#5A5A40] flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4" />
                Interactive Navigation Shortcuts
              </h3>
              <p className="text-xs text-[#525146] mt-0.5">
                Rapidly jump to and flash highlight key system dashboards. Test this header tab interface versus the retractable sidebar!
              </p>
            </div>
            
            {/* Visual Switch Indicator */}
            <span className="text-[10px] font-bold text-[#708238] bg-[#708238]/10 px-2.5 py-1 rounded-full border border-[#708238]/25 self-start md:self-auto uppercase tracking-wider font-mono">
              Dual Layout Test Active
            </span>
          </div>

          {/* Grid of Shortcut Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleScrollTo(item.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-center relative group overflow-hidden ${
                    isActive
                      ? "bg-[#5A5A40] border-[#5A5A40] text-white shadow-md scale-[1.03]"
                      : "bg-[#F8F7F2] border-[#EBEAE3] hover:border-[#DCDAD2] text-[#2C2C24] hover:bg-[#EBEAE3]"
                  }`}
                  title={`Scroll to ${item.label}`}
                  aria-label={`Jump shortcut path to dashboard: ${item.label}`}
                >
                  {/* Subtle colored accent ring around icon */}
                  <div className={`p-2 rounded-lg mb-1.5 transition-colors ${
                    isActive ? "bg-white/10 text-white" : "bg-white text-[#5A5A40] border border-[#EBEAE3] group-hover:bg-[#F2F1EA]"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <span className="text-[10px] font-bold leading-tight tracking-tight select-none leading-3 break-words max-w-[80px]">
                    {item.label}
                  </span>
                  
                  {/* Hover highlight line indicator */}
                  <span className={`absolute bottom-0 left-0 right-0 h-1 transition-all ${
                    isActive ? "bg-[#708238]" : "bg-transparent group-hover:bg-[#525146]/30"
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento Stats Display */}
        {userProfile && (
          <StatsWidget
            profile={userProfile}
            habitLogs={habitLogs}
            impactLogs={impactLogs}
          />
        )}

        {/* Dynamic Interactive Tracking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main workspace (Habits checklist & Impact LOGGER form) */}
          <div className="lg:col-span-2 space-y-6">
            <HabitsWidget
              habitLogs={habitLogs}
              completeHabit={completeHabit}
              todayString={todayString}
            />

            <ImpactLoggerWidget
              impactLogs={impactLogs}
              addImpactLog={addImpactLog}
            />

            <TechEcologyWidget addImpactLog={addImpactLog} />
          </div>

          {/* Sidebar workspace (AI Coach recommendations, Targets and Social competition leaderboard) */}
          <div className="space-y-6">
            <AICoachWidget
              suggestions={aiSuggestions}
              loading={aiLoading}
              error={aiError}
              onRefresh={getAISuggestions}
            />

            <GoalsWidget
              goals={goals}
              createGoal={createGoal}
            />

            <LeaderboardWidget
              entries={leaderboard}
              currentUserId={userProfile?.userId || "local_user"}
            />
          </div>

        </div>

      </main>

      {/* Humble green footer */}
      <footer className="mt-16 text-center text-[10px] text-[#525146] font-mono select-none pb-8">
        <p>© 2026 Carbon & Habits Tracker &bull; Gamified Ecology Mission</p>
        <p className="mt-1">Crafted elegantly with a warm Natural Tones palette to motivate community carbon reductions</p>
      </footer>
    </div>
  );
}
