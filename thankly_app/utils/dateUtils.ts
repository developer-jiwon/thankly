export function getDaysInMonth(year: number, month: number): Date[] {
  // Get the first day of the month
  const date = new Date(year, month, 1);
  const days = [];
  
  // Add all days in the month
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  
  return days;
}

// Function to get the day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function formatDate(date: Date | null): string {
  if (!date) return ''
  return date.toISOString().split('T')[0]
}

