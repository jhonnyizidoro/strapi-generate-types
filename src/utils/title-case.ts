/**
 * Returns string in TitleCase format
 */
export const titleCase = (str = "") => {
  const words = str.match(/[a-z]+/gi) || [];
  return words
    .map(
      (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
    )
    .join("");
};
