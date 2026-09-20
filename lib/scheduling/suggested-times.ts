export type SuggestedTime = { day: number; time: string; reason: string };

/**
 * Heuristic posting slots until real Meta data replaces them (Phase 6).
 * day: 0 = Sunday … 6 = Saturday. Times are local to the owner.
 */
export function suggestPostingTimes(input: {
  ageGroups: string[];
  category: string;
  weeklyHours: number | null;
}): SuggestedTime[] {
  const postsPerWeek = Math.min(7, Math.max(2, Math.round(input.weeklyHours ?? 3)));

  const students = input.ageGroups.some((a) => a.startsWith("18"));
  const families = input.ageGroups.some((a) => a.toLowerCase().includes("famil"));
  const office = input.ageGroups.some((a) => a.startsWith("25") || a.startsWith("35"));

  let time = "19:00";
  let reason = "Evening scroll — most people check Instagram after 7 PM";
  if (students) {
    time = "20:30";
    reason = "Students are most active 8–10 PM";
  } else if (office) {
    time = "19:30";
    reason = "Office crowd scrolls on the commute home";
  } else if (families) {
    time = "10:00";
    reason = "Parents browse mid-morning once the house is quiet";
  }

  // Spread posts across the week; food businesses lean into weekends.
  const foodish = ["cafe", "restaurant", "bakery"].includes(input.category);
  const dayOrder = foodish ? [5, 2, 6, 4, 0, 1, 3] : [2, 4, 6, 1, 5, 0, 3];
  const days = dayOrder.slice(0, postsPerWeek).sort();

  return days.map((day) => {
    const weekend = day === 0 || day === 6;
    return {
      day,
      time: weekend && foodish ? "11:00" : time,
      reason: weekend && foodish ? "Weekend brunch planning happens late morning" : reason,
    };
  });
}

export function postsPerWeekLabel(weeklyHours: number) {
  const n = Math.min(7, Math.max(2, Math.round(weeklyHours)));
  return `≈ ${n} posts/week is realistic. Let's plan for that.`;
}
