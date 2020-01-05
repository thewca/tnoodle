/**
 * Decide if a string is digit only, i.e., 0-9 based (not `e` or some ackward numbers.)
 * @param {*} str
 */
export const isDigit = str => /^[0-9]*$/.test(str);
