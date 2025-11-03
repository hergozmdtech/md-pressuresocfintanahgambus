export const roundToNearest = (date: Date, minutes: number): Date => {
  const ms = 1000 * 60 * minutes;
  return new Date(Math.floor(date.getTime() / ms) * ms);
};