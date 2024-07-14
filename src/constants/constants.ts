export const stripSpecialCharacters = (str: any) =>
  str.replace(/[^a-z0-9]+/gi, "-");
