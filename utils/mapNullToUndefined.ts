/* This utility function maps all null values in an object to undefined */
export const mapNullToUndefined = <T extends object>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ])
  ) as T;
};
