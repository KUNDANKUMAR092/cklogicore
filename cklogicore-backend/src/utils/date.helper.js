// src/utils/date.helper.js
export const getDateRange = (from, to) => {
  return {
    $gte: new Date(from),
    $lte: new Date(to)
  };
};
