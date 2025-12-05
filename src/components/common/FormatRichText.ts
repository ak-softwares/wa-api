// utils/formatRichText.ts

export const formatRichText = (text: string = "") => {
  // Match URLs
  const urlRegex = /(https?:\/\/[^\s"']+)/g;
  const phoneRegex = /(\+?\d[\d\s-]{8,}\d)/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const boldRegex = /\*([^*]+)\*/g;

  let formatted = text.replace(
    urlRegex,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="dark:text-[#21C063] text-blue-600 underline break-all">${url}</a>`
  );

  // Process only non-link text
  formatted = formatted.replace(/(<a[^>]*>.*?<\/a>)|([^<]+)/g, (match, link, textPart) => {
    if (link) return link; // Don't modify <a> links

    return textPart
      .replace(phoneRegex, (num: string) => {
        const clean = num.replace(/\D/g, "");
        return `<b class="chat-number text-walink" data-phone="${clean}" style="cursor:pointer">${num}</b>`;
      })
      .replace(emailRegex, (email: string) =>
        `<a href="mailto:${email}" class="dark:text-[#21C063] text-blue-600">${email}</a>`
      )
      .replace(boldRegex, "<b>$1</b>");
  });

  return formatted;
};
