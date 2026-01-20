import { createInstance } from "./custom-instance-base";

export const customInstance = <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  return createInstance(url, options);
};
