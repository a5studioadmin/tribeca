function toSnakeCase(str) {
  const cleanedString = str.replace(/[^\w\s]|_/g, "").trim();
  return cleanedString.replace(/\s+/g, "_").toLowerCase();
}

function removeSpecialCharacters(str) {
  // Remove surrounding double quotes
  if (str.length >= 2 && str[0] === '"' && str[str.length - 1] === '"') {
    str = str.substring(1, str.length - 1);
  }
  // Remove leading and trailing "**"
  str = str.replace(/^\*\*|\*\*$/g, "");
  return str;
}

function getFormattedDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function formatDay(day) {
  if (day > 3 && day < 21) return day + "th"; // for most numbers
  switch (day % 10) {
    case 1:
      return day + "st";
    case 2:
      return day + "nd";
    case 3:
      return day + "rd";
    default:
      return day + "th";
  }
}

function formatDate(date) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${formatDay(day)}, ${year}`;
}

function generateRandomRecentDate() {
  const now = new Date();
  const threeMonthsAgo = new Date(new Date().setMonth(now.getMonth() - 3));
  const randomTime =
    Math.random() * (now.getTime() - threeMonthsAgo.getTime()) +
    threeMonthsAgo.getTime();
  const randomDate = new Date(randomTime);

  return formatDate(randomDate);
}

function splitTitleAndContent(text) {
  const parts = text.split("\n");
  const title = parts.shift().trim();
  const content = parts.join("\n").trim();
  return { title, content };
}

module.exports = {
  toSnakeCase,
  removeSpecialCharacters,
  getFormattedDate,
  splitTitleAndContent,
  generateRandomRecentDate,
};
