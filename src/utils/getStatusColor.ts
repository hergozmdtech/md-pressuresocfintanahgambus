export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Ok":
      return "#28a745"; // green
    case "Over Pressure":
      return "#dc3545"; // red
    case "Under Pressure":
      return "#ffc107"; // yellow
    case "Sensor Error":
      return "#6c757d"; // gray
    default:
      return "#888"; // fallback gray
  }
};