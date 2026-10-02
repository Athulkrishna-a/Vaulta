import { format, isToday, isYesterday, parseISO, isSameYear } from 'date-fns';

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Good night';
}

export function formatTransactionDate(isoString: string): string {
  try {
    const date = parseISO(isoString);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    }
    const now = new Date();
    if (isSameYear(date, now)) {
      return format(date, 'MMM d, h:mm a');
    }
    return format(date, 'MMM d, yyyy, h:mm a');
  } catch (e) {
    return isoString;
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const date = parseISO(isoString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  } catch (e) {
    return isoString;
  }
}

export function getCurrentMonthKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM');
}

export function formatMonthHeader(monthKey: string): string {
  try {
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(date, 'MMMM yyyy');
  } catch (e) {
    return monthKey;
  }
}

export function getMonthDateRange(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}
