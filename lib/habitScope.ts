/** Profile activeHabitId when showing combined data for every habit */
export const ALL_HABITS_ID = '__all__';

export function isAllHabitsView(activeId: string | undefined): boolean {
  return activeId === ALL_HABITS_ID;
}
