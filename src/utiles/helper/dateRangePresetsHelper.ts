// components/analytics/dateRanges.ts

export const dateRanges = {
  today: () => {
    const now = new Date();
    return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() };
  },

  yesterday: () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  },

  last7days: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return { start, end };
  },

  last30days: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { start, end };
  },

  thisMonth: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: new Date() };
  },

  thisYear: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return { start, end: new Date() };
  },
};
