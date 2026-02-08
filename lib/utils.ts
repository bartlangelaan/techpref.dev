import { clsx, type ClassValue } from "clsx";
import { access } from "node:fs/promises";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get a sample from an array, wich returns the indexes that are the furthest
 * apart. You will always get the first and the last item from the array.
 *
 * For example:
 *   distributedSample([0,1,2,3,4,5,6], 4) = [0,2,4,6]
 */
export function distributedSample<T>(array: T[], maxSize: number) {
  if (array.length <= maxSize) return array;
  if (maxSize === 1) return [array[0]];

  const step = (array.length - 1) / (maxSize - 1);
  const result: T[] = [];

  for (let i = 0; i < maxSize; i++) {
    result.push(array[Math.round(i * step)]);
  }

  return result;
}

export function pathExists(path: string) {
  return access(path)
    .then(() => true)
    .catch(() => false);
}
