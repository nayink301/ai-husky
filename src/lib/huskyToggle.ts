export const isHuskyOn = () =>
    String(import.meta.env.VITE_ENABLE_HUSKY).toLowerCase() === "true";
  