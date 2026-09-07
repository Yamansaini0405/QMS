/**
 * Formats a date to the format: "5th-Sep-2026"
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string (e.g., "5th-Sep-2026")
 */
export const formatDateGlobal = (date) => {
  if (!date) return "-";
  
  const d = new Date(date);
  
  // Check if valid date
  if (isNaN(d.getTime())) return "-";
  
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  
  // Get ordinal suffix (1st, 2nd, 3rd, 4th, 5th, etc.)
  const ordinalSuffix = getOrdinalSuffix(day);
  
  return `${day}${ordinalSuffix}-${month}-${year}`;
};

/**
 * Gets the ordinal suffix for a day number
 * @param {number} day - Day of the month (1-31)
 * @returns {string} Ordinal suffix (st, nd, rd, th)
 */
const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

/**
 * Formats a date for backend API (YYYY-MM-DD format)
 * @param {Date|string} dateStr - Date object or date string
 * @returns {string|null} Formatted date string for backend (YYYY-MM-DD) or null
 */
export const formatDateToBackend = (dateStr) => {
  if (!dateStr) return null;

  let d;
  
  // If already Date object
  if (dateStr instanceof Date) {
    d = dateStr;
  } else if (typeof dateStr === "string") {
    d = new Date(dateStr);
  } else {
    return null;
  }

  if (isNaN(d.getTime())) return null;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date with time (e.g., "5th-Sep-2026 02:30 PM")
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date and time string
 */
export const formatDateTimeGlobal = (date) => {
  if (!date) return "-";
  
  const d = new Date(date);
  
  // Check if valid date
  if (isNaN(d.getTime())) return "-";
  
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  const ordinalSuffix = getOrdinalSuffix(day);
  const timeString = d.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  
  return `${day}${ordinalSuffix}-${month}-${year} ${timeString}`;
};

/**
 * Formats simple date format in DD-MM-YYYY
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string (DD-MM-YYYY)
 */
export const formatSimpleDateForDisplay = (date) => {
  if (!date) return "-";
  
  const d = new Date(date);
  
  // Check if valid date
  if (isNaN(d.getTime())) return "-";
  
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
};
