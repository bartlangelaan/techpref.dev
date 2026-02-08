import { access } from "node:fs/promises";

export function pathExists(path: string) {
  return access(path)
    .then(() => true)
    .catch(() => false);
}
