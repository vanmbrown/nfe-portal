/**
 * Week Calculation Utility for Focus Group
 * Calculates week number based on profile creation date
 */

/**
 * Calculate the current week number based on profile creation date
 * @param profileCreatedAt - ISO date string of when the profile was created
 * @param currentDate - Optional current date (defaults to now)
 * @returns Week number (1-12, max)
 */
export function calculateWeekNumber(
  profileCreatedAt: string,
  currentDate: Date = new Date()
): number {
  try {
    const startDate = new Date(profileCreatedAt);
    const now = currentDate;

    // Handle edge cases
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid profile creation date');
    }

    if (now < startDate) {
      // Future date - return week 1
      return 1;
    }

    // Calculate difference in milliseconds
    const diffInMs = now.getTime() - startDate.getTime();
    
    // Convert to days
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    
    // Calculate week number (1-based, so add 1)
    const weekNumber = Math.floor(diffInDays / 7) + 1;
    
    // Cap at 12 weeks maximum
    return Math.min(weekNumber, 12);
  } catch (error) {
    console.error('Error calculating week number:', error);
    // Return week 1 as fallback
    return 1;
  }
}

/**
 * Get week number options for dropdown (1-12)
 */
export function getWeekNumberOptions(): { value: number; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Week ${i + 1}`,
  }));
}








