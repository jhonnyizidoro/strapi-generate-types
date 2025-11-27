/**
 * Safe parse JSON string or return `undefined`
 */
export const parseJSON = (string = "") => {
  try {
    const obj = JSON.parse(string);
    if (typeof obj === "object") {
      return obj;
    } else {
      return {};
    }
  } catch {}
};
