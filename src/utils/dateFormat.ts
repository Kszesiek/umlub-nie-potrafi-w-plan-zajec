export function formatDateWithAddedDays(date: Date, daysToAdd: number) {
  // Create a new date object to avoid mutating the original date
  const newDate = new Date(date);

  // Add days
  newDate.setDate(newDate.getDate() + daysToAdd);

  // Extract day and month, and format as "DD.MM"
  const day = String(newDate.getDate());
  const month = String(newDate.getMonth() + 1).padStart(2, '0');

  return `${day}.${month}`;
}