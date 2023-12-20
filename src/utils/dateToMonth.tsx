// Take a Date object and return the month name
function getMonthNameFromDate(date: Date): string {
  // Check if the input date is valid
  if (isNaN(date.getTime())) {
      return 'Invalid Date';
  }

  // Define an array of month names
  const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get the month name using the getMonth() method
  const monthName = monthNames[date.getMonth()];

  return monthName;
}


export default getMonthNameFromDate;
