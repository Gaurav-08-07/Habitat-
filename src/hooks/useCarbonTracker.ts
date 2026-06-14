import { useState, useEffect } from "react";
import { UserProfile, HabitLog, ImpactLog, Goal, AISuggestions, LeaderboardEntry, ActivityType } from "../types";
import { PREDEFINED_HABITS, EMISSION_CONVERSIONS } from "../data/habits";
import { db, auth, googleProvider, isFirebaseConfigured, handleFirestoreError, OperationType } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs, onSnapshot } from "firebase/firestore";

const LOCAL_STORAGE_PREFIX = "carbon_tracker_";

// Mock peer users for the social leaderboard competition
const SEEDED_PEERS: LeaderboardEntry[] = [
  { userId: "peer1", displayName: "Sienna Greenwood", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", points: 840, level: 4, totalOffset: 124.5 },
  { userId: "peer2", displayName: "Leo Solaris", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", points: 610, level: 3, totalOffset: 92.8 },
  { userId: "peer3", displayName: "Maya Windward", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", points: 430, level: 2, totalOffset: 65.2 },
  { userId: "peer4", displayName: "Kai EcoRunner", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", points: 290, level: 2, totalOffset: 41.0 }
];

export function useCarbonTracker() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [impactLogs, setImpactLogs] = useState<ImpactLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => curr === message ? null : curr);
    }, 4500);
  };

  // Helper date string in local browser time zone (YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  // 1. Setup Authentication States & Profile Sync
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setCurrentUser(fbUser);
        if (fbUser) {
          // Sync profile & collections with Firestore
          await syncWithFirestore(fbUser);
        } else {
          // Loading states for unauthenticated users (who run in local storage)
          loadLocalFallbackState();
        }
      });
      return () => unsubscribe();
    } else {
      // Local fallback execution
      loadLocalFallbackState();
    }
  }, []);

  // 2. Fetch/Build Leaderboard combining User and Peers
  useEffect(() => {
    if (userProfile) {
      const userEntry: LeaderboardEntry = {
        userId: userProfile.userId,
        displayName: userProfile.displayName + " (You)",
        avatarUrl: userProfile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        points: userProfile.points,
        level: userProfile.level,
        totalOffset: Number(userProfile.totalOffset.toFixed(1))
      };

      const sorted = [...SEEDED_PEERS, userEntry].sort((a, b) => b.points - a.points);
      const ranked = sorted.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      setLeaderboard(ranked);
    }
  }, [userProfile]);

  // Load standard states from LocalStorage for local-only users
  const loadLocalFallbackState = () => {
    setLoading(true);
    try {
      const pStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}profile`);
      const hStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}habitLogs`);
      const iStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}impactLogs`);
      const gStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}goals`);

      const loadedProfile: UserProfile = pStr ? JSON.parse(pStr) : {
        userId: "local_user",
        displayName: "Eco Warrior",
        email: "guest@ecosave.org",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        points: 80,
        level: 1,
        totalOffset: 12.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Set initial state
      setUserProfile(loadedProfile);
      setHabitLogs(hStr ? JSON.parse(hStr) : []);
      setImpactLogs(iStr ? JSON.parse(iStr) : []);
      
      const loadedGoals: Goal[] = gStr ? JSON.parse(gStr) : [
        {
          goalId: "g_default_1",
          userId: "local_user",
          title: "Avoid 50 kg CO2 this week",
          category: "general",
          targetValue: 50,
          currentValue: 12.5,
          unit: "kg CO2",
          status: "active",
          deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        },
        {
          goalId: "g_default_2",
          userId: "local_user",
          title: "Log 5 Sustainable Habits",
          category: "transport",
          targetValue: 5,
          currentValue: 0,
          unit: "habits",
          status: "active",
          deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        }
      ];
      setGoals(loadedGoals);
      
      // Save default structured seed if it was completely blank
      if (!pStr) localStorage.setItem(`${LOCAL_STORAGE_PREFIX}profile`, JSON.stringify(loadedProfile));
      if (!gStr) localStorage.setItem(`${LOCAL_STORAGE_PREFIX}goals`, JSON.stringify(loadedGoals));
    } catch (e) {
      console.error("Local storage decoding failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Sync state cleanly with Firestore
  const syncWithFirestore = async (fbUser: FirebaseUser) => {
    setLoading(true);
    const userDocRef = doc(db, "users", fbUser.uid);
    try {
      const userSnap = await getDoc(userDocRef);
      let profile: UserProfile;

      if (userSnap.exists()) {
        profile = userSnap.data() as UserProfile;
      } else {
        // Create a pristine user profile
        profile = {
          userId: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Eco Companion",
          email: fbUser.email || "",
          avatarUrl: fbUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          points: 100,
          level: 1,
          totalOffset: 15.0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profile);
      }
      setUserProfile(profile);

      // Listen to habitLogs collection real-time
      const habitsCol = collection(db, "users", fbUser.uid, "habitLogs");
      const unsubscribeHabits = onSnapshot(habitsCol, (snap) => {
        const hLogs: HabitLog[] = [];
        snap.forEach((doc) => hLogs.push(doc.data() as HabitLog));
        setHabitLogs(hLogs);
      }, (error) => handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}/habitLogs`));

      // Listen to impactLogs collection real-time
      const impactsCol = collection(db, "users", fbUser.uid, "impactLogs");
      const unsubscribeImpacts = onSnapshot(impactsCol, (snap) => {
        const iLogs: ImpactLog[] = [];
        snap.forEach((doc) => iLogs.push(doc.data() as ImpactLog));
        setImpactLogs(iLogs);
      }, (error) => handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}/impactLogs`));

      // Listen to goals collection real-time
      const goalsCol = collection(db, "users", fbUser.uid, "goals");
      const unsubscribeGoals = onSnapshot(goalsCol, (snap) => {
        const gList: Goal[] = [];
        snap.forEach((doc) => gList.push(doc.data() as Goal));
        // If goals is empty, we seed the defaults
        if (gList.length === 0) {
          seedDefaultGoals(fbUser.uid);
        } else {
          setGoals(gList);
        }
      }, (error) => handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}/goals`));

      return () => {
        unsubscribeHabits();
        unsubscribeImpacts();
        unsubscribeGoals();
      };
    } catch (error) {
      console.error("Firestore sync error:", error);
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultGoals = async (uid: string) => {
    const defaultGoals: Goal[] = [
      {
        goalId: "g_fire_1",
        userId: uid,
        title: "Divert CO2 by 50 kg CO2",
        category: "general",
        targetValue: 50,
        currentValue: 15.0,
        unit: "kg CO2",
        status: "active",
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date().toISOString()
      },
      {
        goalId: "g_fire_2",
        userId: uid,
        title: "Track 5 Organic Habits",
        category: "transport",
        targetValue: 5,
        currentValue: 0,
        unit: "habits",
        status: "active",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date().toISOString()
      }
    ];

    setGoals(defaultGoals);
    if (isFirebaseConfigured && db) {
      for (const goal of defaultGoals) {
        try {
          await setDoc(doc(db, "users", uid, "goals", goal.goalId), goal);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${uid}/goals/${goal.goalId}`);
        }
      }
    }
  };

  // Update Display Name directly without prompts
  const updateDisplayName = async (newName: string) => {
    if (!userProfile) return;
    const cleanName = newName.trim();
    if (!cleanName) return;

    const updated = {
      ...userProfile,
      displayName: cleanName,
      updatedAt: new Date().toISOString()
    };
    setUserProfile(updated);

    if (isFirebaseConfigured && db && currentUser) {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          displayName: cleanName,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    } else {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}profile`, JSON.stringify(updated));
    }
    showToast("👤 Avatar identity name updated!");
  };

  // Sign In Trigger
  const handleSignIn = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("OAuth Sign In Failed:", error);
      }
    } else {
      showToast("💡 You can edit your displayName directly inside the Guest Account section anytime!");
    }
  };

  // Sign Out Trigger
  const handleSignOut = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      // Local reset without block confirm
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}profile`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}habitLogs`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}impactLogs`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}goals`);
      loadLocalFallbackState();
      showToast("🧹 Local progress and logs successfully reset!");
    }
  };

  // 3. Complete Daily Habit and Calculate Updates
  const completeHabit = async (habitId: string) => {
    if (!userProfile) return;
    const today = getTodayString();
    const habit = PREDEFINED_HABITS.find((h) => h.id === habitId);
    if (!habit) return;

    const logId = `${userProfile.userId}_${habitId}_${today}`;
    const logExists = habitLogs.some((l) => l.logId === logId);

    let updatedHabitLogs = [...habitLogs];
    let pointsDiff = 0;
    let offsetDiff = 0;

    if (logExists) {
      // Toggle off / remove log
      updatedHabitLogs = updatedHabitLogs.filter((l) => l.logId !== logId);
      pointsDiff = -habit.points;
      offsetDiff = -habit.co2Saved;

      if (isFirebaseConfigured && db && currentUser) {
        try {
          const { deleteDoc } = require("firebase/firestore");
          await deleteDoc(doc(db, "users", currentUser.uid, "habitLogs", logId));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `users/${currentUser.uid}/habitLogs/${logId}`);
        }
      }
    } else {
      // Add log
      const newLog: HabitLog = {
        logId,
        userId: userProfile.userId,
        habitId,
        habitTitle: habit.title,
        category: habit.category,
        pointsEarned: habit.points,
        carbonSaved: habit.co2Saved,
        date: today,
        loggedAt: new Date().toISOString()
      };
      updatedHabitLogs.push(newLog);
      pointsDiff = habit.points;
      offsetDiff = habit.co2Saved;

      if (isFirebaseConfigured && db && currentUser) {
        try {
          await setDoc(doc(db, "users", currentUser.uid, "habitLogs", logId), newLog);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}/habitLogs/${logId}`);
        }
      }
    }

    // Reflect stats inside the profile
    const newPoints = Math.max(0, userProfile.points + pointsDiff);
    const newOffset = Math.max(0, userProfile.totalOffset + offsetDiff);
    // 1 Level earned for every 250 points
    const newLevel = Math.max(1, Math.floor(newPoints / 250) + 1);

    const updatedProfile: UserProfile = {
      ...userProfile,
      points: newPoints,
      level: newLevel,
      totalOffset: Number(newOffset.toFixed(2)),
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile);
    setHabitLogs(updatedHabitLogs);

    // Dynamic Goals Checklist updates
    updateGoalProgress(pointsDiff, offsetDiff, 1 * (logExists ? -1 : 1));

    if (isFirebaseConfigured && db && currentUser) {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          points: newPoints,
          level: newLevel,
          totalOffset: Number(newOffset.toFixed(2)),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    } else {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}profile`, JSON.stringify(updatedProfile));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}habitLogs`, JSON.stringify(updatedHabitLogs));
    }
  };

  // 4. Log custom Environmental Impact Metrics
  const addImpactLog = async (activityType: ActivityType, quantity: number, notes: string = "") => {
    if (!userProfile) return;
    const factor = EMISSION_CONVERSIONS[activityType];
    const co2Saved = Number((quantity * factor.co2PerUnit).toFixed(2));
    const pointsEarned = Math.round(quantity * factor.pointsPerUnit);

    const logId = `impact_${Date.now()}`;
    const newLog: ImpactLog = {
      logId,
      userId: userProfile.userId,
      activityType,
      quantity,
      unit: factor.unit,
      carbonSaved: co2Saved,
      pointsEarned,
      notes: notes || `Logged ${quantity} ${factor.unit} of ${activityType}`,
      loggedAt: new Date().toISOString()
    };

    const updatedImpacts = [newLog, ...impactLogs];
    const newPoints = userProfile.points + pointsEarned;
    const newOffset = userProfile.totalOffset + co2Saved;
    const newLevel = Math.max(1, Math.floor(newPoints / 250) + 1);

    const updatedProfile: UserProfile = {
      ...userProfile,
      points: newPoints,
      level: newLevel,
      totalOffset: Number(newOffset.toFixed(2)),
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile);
    setImpactLogs(updatedImpacts);

    // Update goals progress
    updateGoalProgress(pointsEarned, co2Saved, 0);

    if (isFirebaseConfigured && db && currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "impactLogs", logId), newLog);
        await updateDoc(doc(db, "users", currentUser.uid), {
          points: newPoints,
          level: newLevel,
          totalOffset: Number(newOffset.toFixed(2)),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}/impactLogs/${logId}`);
      }
    } else {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}profile`, JSON.stringify(updatedProfile));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}impactLogs`, JSON.stringify(updatedImpacts));
    }
  };

  // Create personalized custom target goal
  const createGoal = async (title: string, category: string, targetValue: number, unit: "kg CO2" | "habits", deadline: string) => {
    if (!userProfile) return;

    const goalId = `goal_${Date.now()}`;
    // Calculate initial current progress based on current profile metrics
    let currentValue = 0;
    if (unit === "kg CO2") {
      currentValue = Number((userProfile.totalOffset % targetValue).toFixed(2)); // start with some offset fraction or 0
    }

    const newGoal: Goal = {
      goalId,
      userId: userProfile.userId,
      title,
      category: category as any,
      targetValue,
      currentValue,
      unit,
      status: "active",
      deadline,
      createdAt: new Date().toISOString()
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);

    if (isFirebaseConfigured && db && currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "goals", goalId), newGoal);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}/goals/${goalId}`);
      }
    } else {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}goals`, JSON.stringify(updatedGoals));
    }
  };

  // Helper: Increments goal value dynamically when users complete habits or log carbon activities
  const updateGoalProgress = async (pts: number, co2: number, habitCount: number) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.status === "completed") return goal;

      let inc = 0;
      if (goal.unit === "kg CO2") {
        inc = co2;
      } else if (goal.unit === "habits") {
        inc = habitCount;
      }

      const newVal = Math.max(0, Number((goal.currentValue + inc).toFixed(2)));
      const isCompleted = newVal >= goal.targetValue;

      const updated = {
        ...goal,
        currentValue: newVal,
        status: (isCompleted ? "completed" : "active") as "completed" | "active"
      };

      // If just completed, user receives an extra bonus of 100 points!
      if (isCompleted && goal.status === "active" && userProfile) {
        setTimeout(() => {
          grantCompletedGoalBonus(goal.title);
        }, 300);
      }

      // Sync specific goal document changes.
      if (isFirebaseConfigured && db && currentUser) {
        updateDoc(doc(db, "users", currentUser.uid, "goals", goal.goalId), {
          currentValue: newVal,
          status: updated.status
        }).catch((e) => console.error("Goal progress synch error:", e));
      }

      return updated;
    });

    setGoals(updatedGoals);
    if (!isFirebaseConfigured || !currentUser) {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}goals`, JSON.stringify(updatedGoals));
    }
  };

  const grantCompletedGoalBonus = async (goalTitle: string) => {
    if (!userProfile) return;
    const bonus = 100;
    const newPoints = userProfile.points + bonus;
    const newLevel = Math.max(1, Math.floor(newPoints / 250) + 1);

    const updatedProfile = {
      ...userProfile,
      points: newPoints,
      level: newLevel,
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile);
    showToast(`🎉 Goal Accomplished: "${goalTitle}"! +100 XP Bonus!`);

    if (isFirebaseConfigured && db && currentUser) {
      updateDoc(doc(db, "users", currentUser.uid), {
        points: newPoints,
        level: newLevel,
        updatedAt: new Date().toISOString()
      }).catch((e) => console.error("Sync bonus failed", e));
    } else {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}profile`, JSON.stringify(updatedProfile));
    }
  };

  // 5. Fetch personalized automated AI suggestions from Gemini through our Server API Proxy
  const getAISuggestions = async () => {
    if (!userProfile) return;
    setAiLoading(true);
    setAiError(null);

    // Gather user stats to formulate personalized recommendations
    const activeGoals = goals.filter((g) => g.status === "active");
    const completedToday = habitLogs.filter((l) => l.date === getTodayString());

    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile,
          activeGoals,
          completedHabits: completedToday,
          impactLogs: impactLogs.slice(0, 10)
        })
      });

      if (!response.ok) {
        throw new Error("Server suggestions endpoint responded with an error");
      }

      const data: AISuggestions = await response.json();
      setAiSuggestions(data);
    } catch (e: any) {
      console.error("Failed to query automated suggestions:", e);
      setAiError(e?.message || "Internal Service Error");
    } finally {
      setAiLoading(false);
    }
  };

  // Autoload automated recommendations on start
  useEffect(() => {
    if (userProfile && !aiSuggestions && !aiLoading) {
      getAISuggestions();
    }
  }, [userProfile]);

  return {
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
    toastMessage,
    showToast,
    updateDisplayName,
    completeHabit,
    addImpactLog,
    createGoal,
    getAISuggestions,
    handleSignIn,
    handleSignOut,
    todayString: getTodayString()
  };
}
