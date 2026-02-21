export function generateCronFromPreset(preset: string) {
  switch (preset) {
    case "every-5-min":
      return "*/5 * * * *";
    case "hourly":
      return "0 * * * *";
    case "daily-9am":
      return "0 9 * * *";
    case "weekly-monday":
      return "0 9 * * 1";
    case "monthly-1st":
      return "0 9 1 * *";
    default:
      return "0 9 * * *";
  }
}