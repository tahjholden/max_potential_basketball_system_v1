import { format, formatDistanceToNow, parseISO } from "date-fns";

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Format a date string to a readable format
 */
export function formatDate(date: string | Date, formatString: string = "MMM dd, yyyy"): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.warn("Invalid date format:", date);
    return "Invalid date";
  }
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.warn("Invalid date format:", date);
    return "Unknown time";
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const today = new Date();
    return format(dateObj, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
  } catch (error) {
    return false;
  }
}

/**
 * Check if a date is this week
 */
export function isThisWeek(date: string | Date): boolean {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return dateObj >= weekStart && dateObj <= weekEnd;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number, suffix: string = "..."): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Format name consistently
 */
export function formatName(firstName?: string, lastName?: string): string {
  const first = firstName?.trim() || "";
  const last = lastName?.trim() || "";
  return `${first} ${last}`.trim() || "Unknown";
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Sort array by date field
 */
export function sortByDate<T>(
  array: T[],
  dateField: keyof T,
  order: "asc" | "desc" = "desc"
): T[] {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateField] as any).getTime();
    const dateB = new Date(b[dateField] as any).getTime();
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Sort array by string field
 */
export function sortByString<T>(
  array: T[],
  stringField: keyof T,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const stringA = String(a[stringField]).toLowerCase();
    const stringB = String(b[stringField]).toLowerCase();
    return order === "asc" 
      ? stringA.localeCompare(stringB)
      : stringB.localeCompare(stringA);
  });
}

/**
 * Filter array by search term
 */
export function filterBySearch<T>(
  array: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item =>
    searchFields.some(field => {
      const value = String(item[field]).toLowerCase();
      return value.includes(term);
    })
  );
}

/**
 * Group array by field
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Validate minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength;
}

/**
 * Validate maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.trim().length <= maxLength;
}

// ============================================================================
// UI STATE UTILITIES
// ============================================================================

/**
 * Generate loading state object
 */
export function createLoadingState(): { loading: boolean; error: string | null } {
  return { loading: false, error: null };
}

/**
 * Generate async state object
 */
export function createAsyncState<T>(): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  return { data: null, loading: false, error: null };
}

/**
 * Handle async operation with loading state
 */
export async function withLoading<T>(
  operation: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<T | null> {
  setLoading(true);
  setError(null);
  
  try {
    const result = await operation();
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    setError(errorMessage);
    return null;
  } finally {
    setLoading(false);
  }
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Get status color based on status string
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: "text-green-400",
    inactive: "text-red-400",
    pending: "text-yellow-400",
    archived: "text-gray-400",
    deleted: "text-red-500",
    expired: "text-orange-400",
    draft: "text-blue-400",
    published: "text-green-400",
  };
  
  return statusColors[status.toLowerCase()] || "text-gray-400";
}

/**
 * Get status background color
 */
export function getStatusBgColor(status: string): string {
  const statusBgColors: Record<string, string> = {
    active: "bg-green-900/20",
    inactive: "bg-red-900/20",
    pending: "bg-yellow-900/20",
    archived: "bg-gray-900/20",
    deleted: "bg-red-900/20",
    expired: "bg-orange-900/20",
    draft: "bg-blue-900/20",
    published: "bg-green-900/20",
  };
  
  return statusBgColors[status.toLowerCase()] || "bg-gray-900/20";
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format duration in seconds to readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

// ============================================================================
// DEBOUNCE UTILITIES
// ============================================================================

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Safe localStorage getter
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn("Error reading from localStorage:", error);
    return defaultValue;
  }
}

/**
 * Safe localStorage setter
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Error writing to localStorage:", error);
  }
}

/**
 * Safe localStorage remover
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Error removing from localStorage:", error);
  }
}

// ============================================================================
// URL UTILITIES
// ============================================================================

/**
 * Get URL parameters
 */
export function getUrlParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  Array.from(params.entries()).forEach(([key, value]) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Set URL parameter
 */
export function setUrlParam(key: string, value: string): void {
  if (typeof window === "undefined") return;
  
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState({}, "", url.toString());
}

/**
 * Remove URL parameter
 */
export function removeUrlParam(key: string): void {
  if (typeof window === "undefined") return;
  
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState({}, "", url.toString());
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  
  return "An unexpected error occurred";
}

/**
 * Log error with context
 */
export function logError(error: unknown, context?: string): void {
  const message = formatErrorMessage(error);
  const prefix = context ? `[${context}]` : "";
  console.error(`${prefix} ${message}`, error);
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if value is a valid date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if value is a valid date string
 */
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Check if value is a valid email
 */
export function isValidEmailString(value: unknown): value is string {
  return typeof value === "string" && isValidEmail(value);
}

/**
 * Check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
} 