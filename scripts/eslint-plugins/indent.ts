import { eslintCompatPlugin } from "@oxlint/plugins";

const plugin = eslintCompatPlugin({
  meta: {
    name: "techpref",
  },
  rules: {
    indent: {
      meta: {
        type: "layout",
        docs: {
          description:
            "Enforce consistent indentation character style (tabs or space multiples)",
        },
        schema: [{ enum: ["tab", 2, 4] }],
        messages: {
          expectedTabs: "Expected tabs for indentation, but found spaces.",
          expectedSpaces: "Expected spaces for indentation, but found tabs.",
          wrongIndentSize:
            "Expected {{expected}}-space indentation, but file uses {{actual}}-space indentation.",
        },
      },
      createOnce(context) {
        return {
          Program() {
            const option = context.options[0];
            const useTabs = option === "tab";
            const expectedSpaceCount = typeof option === "number" ? option : 2;

            const sourceCode = context.sourceCode ?? context.getSourceCode();

            // Build a set of line numbers that are part of comments
            const commentLines = new Set<number>();
            for (const comment of sourceCode.getAllComments()) {
              for (
                let line = comment.loc.start.line;
                line <= comment.loc.end.line;
                line++
              ) {
                commentLines.add(line);
              }
            }

            const lines = sourceCode.lines;

            if (useTabs) {
              // Tab mode: indentation should only contain tabs
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;

                // Skip comment lines
                if (commentLines.has(lineNumber)) continue;

                const match = line.match(/^(\s*)/);
                if (!match) continue;

                const indent = match[1];
                if (indent.length === 0) continue;

                if (indent.includes(" ")) {
                  context.report({
                    loc: {
                      start: { line: lineNumber, column: 0 },
                      end: { line: lineNumber, column: indent.length },
                    },
                    messageId: "expectedTabs",
                  });
                  return; // Report only the first occurrence
                }
              }
              return;
            }

            // Space mode: detect the base indent unit of the file (minimum
            // even-length indentation) and compare it to the expected size.
            // Odd-length indents are skipped because they indicate alignment-
            // based continuation lines, not real indentation levels.
            let minEvenIndent: number | null = null;
            let minEvenIndentLine = -1;

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const lineNumber = i + 1;

              // Skip comment lines
              if (commentLines.has(lineNumber)) continue;

              const match = line.match(/^(\s*)/);
              if (!match) continue;

              const indent = match[1];
              if (indent.length === 0) continue;

              if (indent.includes("\t")) {
                context.report({
                  loc: {
                    start: { line: lineNumber, column: 0 },
                    end: { line: lineNumber, column: indent.length },
                  },
                  messageId: "expectedSpaces",
                });
                return; // Report only the first occurrence
              }

              // Track minimum even-length indentation to detect the file's
              // base indent unit (odd indents are alignment/continuation lines)
              if (
                indent.length % 2 === 0 &&
                (minEvenIndent === null || indent.length < minEvenIndent)
              ) {
                minEvenIndent = indent.length;
                minEvenIndentLine = lineNumber;
              }
            }

            // If no even-length indentation found, can't determine indent style
            if (minEvenIndent === null) return;

            // Report if the detected base indent unit doesn't match expected
            if (minEvenIndent !== expectedSpaceCount) {
              context.report({
                loc: {
                  start: { line: minEvenIndentLine, column: 0 },
                  end: { line: minEvenIndentLine, column: minEvenIndent },
                },
                messageId: "wrongIndentSize",
                data: {
                  expected: String(expectedSpaceCount),
                  actual: String(minEvenIndent),
                },
              });
            }
          },
        };
      },
    },
  },
});

export default plugin;
