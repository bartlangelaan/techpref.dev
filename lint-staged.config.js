export default {
  "*": (files) => [
    `pnpm format --no-error-on-unmatched-pattern ${files}`,
    "pnpm lint",
  ],
};
