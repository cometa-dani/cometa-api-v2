/**
 *
 * @param {String} date
 */
const parseDate = (date) => {
  const dateString = date;
  const parts = dateString.split(' '); // Split date and time
  const dateParts = parts[0].split('/'); // Split date into day, month, year
  const timeParts = parts[1].split(':'); // Split time into hours, minutes, seconds

  const year = parseInt(dateParts[2]);
  const month = parseInt(dateParts[1]) - 1; // Months are zero-based (January is 0)
  const day = parseInt(dateParts[0]);
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = parseInt(timeParts[2]);

  return new Date(year, month, day, hours, minutes, seconds);
};

exports.parseDate = parseDate;
