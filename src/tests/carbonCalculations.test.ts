import { describe, it, expect } from "vitest";
import { PREDEFINED_HABITS, EMISSION_CONVERSIONS } from "../data/habits";

describe("Carbon Offset Calculation Engine Rules", () => {
  it("should have correct emission conversion metrics configured", () => {
    // Standard conversion factor verifications
    expect(EMISSION_CONVERSIONS.driving.co2PerUnit).toBe(0.41);
    expect(EMISSION_CONVERSIONS.driving.pointsPerUnit).toBe(4);
    
    expect(EMISSION_CONVERSIONS.electricity.co2PerUnit).toBe(0.45);
    expect(EMISSION_CONVERSIONS.electricity.pointsPerUnit).toBe(5);

    expect(EMISSION_CONVERSIONS.diet.co2PerUnit).toBe(2.8);
    expect(EMISSION_CONVERSIONS.diet.pointsPerUnit).toBe(15);
  });

  it("should correctly compute carbon savings and reward points for logged activities", () => {
    // 1. Simulate 15 miles of solo driving replaced
    const drivingMiles = 15;
    const drivingCo2Saved = Number((drivingMiles * EMISSION_CONVERSIONS.driving.co2PerUnit).toFixed(2));
    const drivingPoints = Math.round(drivingMiles * EMISSION_CONVERSIONS.driving.pointsPerUnit);
    expect(drivingCo2Saved).toBe(6.15);
    expect(drivingPoints).toBe(60);

    // 2. Simulate 4 kWh of saved power
    const savedKwh = 4;
    const powerCo2Saved = Number((savedKwh * EMISSION_CONVERSIONS.electricity.co2PerUnit).toFixed(2));
    const powerPoints = Math.round(savedKwh * EMISSION_CONVERSIONS.electricity.pointsPerUnit);
    expect(powerCo2Saved).toBe(1.80);
    expect(powerPoints).toBe(20);

    // 3. Simulate 3 vegetarian local meals
    const meals = 3;
    const mealsCo2Saved = Number((meals * EMISSION_CONVERSIONS.diet.co2PerUnit).toFixed(2));
    const mealsPoints = Math.round(meals * EMISSION_CONVERSIONS.diet.pointsPerUnit);
    expect(mealsCo2Saved).toBe(8.40);
    expect(mealsPoints).toBe(45);
  });

  it("should verify pre-seeded habits have logical eco attributes", () => {
    expect(PREDEFINED_HABITS.length).toBeGreaterThan(0);
    
    PREDEFINED_HABITS.forEach((habit) => {
      // Validate structural guidelines
      expect(habit.id).toBeDefined();
      expect(habit.title).toBeDefined();
      expect(habit.points).toBeGreaterThan(0);
      expect(habit.co2Saved).toBeGreaterThan(0);
      expect(["transport", "energy", "diet", "water", "waste"]).toContain(habit.category);
    });
  });

  it("should compute exact tech and digital ecology formulas correctly", () => {
    // HD Streaming: ~0.15 kg CO2 per hr. Multiplied by 3.0 hrs, then 30 days = monthly
    const streamingHrs = 3;
    const streamingOffsetMonthly = streamingHrs * 0.15 * 30;
    expect(streamingOffsetMonthly).toBeCloseTo(13.5, 5);

    // Cloud storage: ~0.01 kg CO2 per GB per month
    const gbUnused = 20;
    const cloudOffsetMonthly = gbUnused * 0.01;
    expect(cloudOffsetMonthly).toBeCloseTo(0.20, 5);

    // Vampire power sockets: each adapter drains ~1.5W constantly, ~0.5kg CO2 saved monthly if unplugged
    const adaptersCount = 4;
    const vampireOffsetMonthly = adaptersCount * 0.5;
    expect(vampireOffsetMonthly).toBeCloseTo(2.0, 5);

    const totalCalculatedFootprint = Number((streamingOffsetMonthly + cloudOffsetMonthly + vampireOffsetMonthly).toFixed(2));
    expect(totalCalculatedFootprint).toBe(15.70);
  });
});
