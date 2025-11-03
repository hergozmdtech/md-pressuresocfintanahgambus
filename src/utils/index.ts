export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Ok": return "#28a745";
    case "Over Pressure": return "#dc3545";
    case "Under Pressure": return "#ffc107";
    case "Sensor Error": return "#6c757d";
    default: return "#888";
  }
};

export const roundToNearest = (date: Date, minutes: number): Date => {
  const ms = 1000 * 60 * minutes;
  return new Date(Math.floor(date.getTime() / ms) * ms);
};