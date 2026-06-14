import { Habit } from "../types";

export const PREDEFINED_HABITS: Habit[] = [
  {
    id: "h_transit",
    title: "Eco Commuting",
    description: "Take public transit relative to solo driving for your journey.",
    category: "transport",
    points: 30,
    co2Saved: 4.5
  },
  {
    id: "h_bike",
    title: "Active Travel",
    description: "Walk, bike, or use an electric scooter rather than a motor vehicle.",
    category: "transport",
    points: 50,
    co2Saved: 5.6
  },
  {
    id: "h_carpool",
    title: "Carpooling Option",
    description: "Share a vehicle trip with school peers, family, or work buddies.",
    category: "transport",
    points: 20,
    co2Saved: 2.1
  },
  {
    id: "h_vampire",
    title: "Vampire Power Shutdown",
    description: "Unplug standby screens, adapters, and power strips overnight.",
    category: "energy",
    points: 15,
    co2Saved: 1.2
  },
  {
    id: "h_cold_wash",
    title: "Cold Laundry wash",
    description: "Wash clothing sheets in cold water instead of a hot water setting.",
    category: "energy",
    points: 20,
    co2Saved: 0.9
  },
  {
    id: "h_turn_off",
    title: "Unoccupied Light Off",
    description: "Switch off ventilation fans and light fixtures in unoccupied areas.",
    category: "energy",
    points: 10,
    co2Saved: 0.4
  },
  {
    id: "h_veggie",
    title: "Plant-Powered Meals",
    description: "Consume entirely plant-based meals (no beef, pork, or dairy).",
    category: "diet",
    points: 40,
    co2Saved: 3.8
  },
  {
    id: "h_leftovers",
    title: "Zero Waste Cooking",
    description: "Meal plan or eat leftovers to prevent organic food wastage.",
    category: "diet",
    points: 25,
    co2Saved: 1.8
  },
  {
    id: "h_reusable",
    title: "Reusable Ware Duty",
    description: "Decline plastic cups, paper bags, or straws; use personal containers.",
    category: "diet",
    points: 15,
    co2Saved: 0.5
  },
  {
    id: "h_shower",
    title: "Shower Under 5m",
    description: "Shorten your daily shower to under five minutes to reduce water heating CO2.",
    category: "water",
    points: 25,
    co2Saved: 0.8
  },
  {
    id: "h_compost",
    title: "Composting Duty",
    description: "Compost kitchen scraps and sort cardboard, metal, and plastic waste.",
    category: "waste",
    points: 20,
    co2Saved: 1.4
  }
];

// Conversions in carbon reduction kg CO2 saved per unit logged:
export const EMISSION_CONVERSIONS = {
  driving: {
    label: "Vehicle Miles Switched to Walking/Cycling",
    unit: "miles",
    co2PerUnit: 0.41, // kg CO2 saved per mile avoided
    pointsPerUnit: 4,
    placeholder: "e.g., 5 miles"
  },
  transport: {
    label: "Public Bus/Train Travel Miles Took",
    unit: "miles",
    co2PerUnit: 0.28, // transit is cleaner, saves 0.28kg CO2 per mile compared to driving solo
    pointsPerUnit: 3,
    placeholder: "e.g., 10 miles"
  },
  electricity: {
    label: "Electrical Power Saved (Turned off A/C, etc.)",
    unit: "kWh",
    co2PerUnit: 0.45, // kg CO2 saved per kWh
    pointsPerUnit: 5,
    placeholder: "e.g., 4 kWh"
  },
  diet: {
    label: "Avoided Meat/Dairy Meals Sourced Locally",
    unit: "meals",
    co2PerUnit: 2.8, // kg CO2 saved per beef meal avoided
    pointsPerUnit: 15,
    placeholder: "e.g., 2 meals"
  },
  waste: {
    label: "Diverted Composted Organic Waste",
    unit: "lbs",
    co2PerUnit: 0.6, // kg CO2 saved per lb composted
    pointsPerUnit: 2,
    placeholder: "e.g., 3 lbs"
  }
};
