export function formatDate(dateInput) {
  const formattedDate = new Date(dateInput);
  const dayOfMonth = formattedDate.getDate().toString().padStart(2, "0");
  const monthOfYear = (formattedDate.getMonth() + 1)
    .toString()
    .padStart(2, "0");
  const yearValue = formattedDate.getFullYear();
  return `${dayOfMonth}-${monthOfYear}-${yearValue}`;
}
