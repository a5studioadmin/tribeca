function toSnakeCase(str) {
  const cleanedString = str.replace(/[^\w\s]|_/g, "").trim();
  return cleanedString.replace(/\s+/g, "_").toLowerCase();
}

function removeSurroundingQuotes(str) {
  if (
    str.length >= 2 &&
    ((str[0] === '"' && str[str.length - 1] === '"') ||
      (str[0] === "'" && str[str.length - 1] === "'"))
  ) {
    return str.substring(1, str.length - 1);
  }
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

function splitTitleAndContent(text) {
  const parts = text.split("\n");
  const title = parts.shift().trim();
  const content = parts.join("\n").trim();
  return { title, content };
}

module.exports = {
  toSnakeCase,
  removeSurroundingQuotes,
  getFormattedDate,
  splitTitleAndContent,
};
