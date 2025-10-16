export const formatTime = (date?: Date) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();

  // Check if it's the same day
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    // Format as time (e.g., "3:45 PM")
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  } else {
    // Format as date (e.g., "12 Oct")
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  }
};
