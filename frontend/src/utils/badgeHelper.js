// frontend/src/utils/badgeHelper.js
export const getBadge = (points = 0) => {
  if (points >= 2000)
    return {
      level: "Gold",
      emoji: "🥇",
      color: "#FFD700",
      bgColor: "rgba(255,215,0,0.12)",
      borderColor: "rgba(255,215,0,0.3)",
    };
  if (points >= 500)
    return {
      level: "Silver",
      emoji: "🥈",
      color: "#C0C0C0",
      bgColor: "rgba(192,192,192,0.12)",
      borderColor: "rgba(192,192,192,0.3)",
    };
  return {
    level: "Bronze",
    emoji: "🥉",
    color: "#CD7F32",
    bgColor: "rgba(205,127,50,0.12)",
    borderColor: "rgba(205,127,50,0.3)",
  };
};

export const getNextBadge = (points = 0) => {
  if (points >= 2000) return null; // sudah max
  if (points >= 500)
    return { level: "Gold", emoji: "🥇", needed: 2000 - points, target: 2000 };
  return { level: "Silver", emoji: "🥈", needed: 500 - points, target: 500 };
};
