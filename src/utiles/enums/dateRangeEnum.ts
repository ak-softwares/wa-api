export enum DateRangeEnum {
  TODAY = "today",
  YESTERDAY = "yesterday",
  LAST_7_DAYS = "last7days",
  LAST_30_DAYS = "last30days",
  THIS_MONTH = "thisMonth",
  LAST_MONTH = "lastMonth",
  THIS_YEAR = "thisYear",
}

export const DateRangeLabels: Record<DateRangeEnum, string> = {
  [DateRangeEnum.TODAY]: "Today",
  [DateRangeEnum.YESTERDAY]: "Yesterday",
  [DateRangeEnum.LAST_7_DAYS]: "Last 7 Days",
  [DateRangeEnum.LAST_30_DAYS]: "Last 30 Days",
  [DateRangeEnum.THIS_MONTH]: "This Month",
  [DateRangeEnum.LAST_MONTH]: "Last Month",
  [DateRangeEnum.THIS_YEAR]: "This Year",
};
