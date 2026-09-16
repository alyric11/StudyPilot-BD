export const formatTime12Hour = (value: string): string => {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return value;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )} ${period}`;
};

export const formatTimeRange = (startTime: string, endTime: string): string =>
  `${formatTime12Hour(startTime)} – ${formatTime12Hour(endTime)}`;

const getCompactTimeParts = (value: string) => {
  const formattedTime = formatTime12Hour(value);
  const [clock, period] = formattedTime.split(" ");

  return {
    clock: clock.replace(/^0/, ""),
    period,
  };
};

// Narrow routine cards need a shorter label while still keeping the 12-hour format.
export const formatCompactTimeRange = (
  startTime: string,
  endTime: string
): string => {
  const start = getCompactTimeParts(startTime);
  const end = getCompactTimeParts(endTime);

  if (start.period === end.period) {
    return `${start.clock}–${end.clock} ${end.period}`;
  }

  return `${start.clock} ${start.period}–${end.clock} ${end.period}`;
};
