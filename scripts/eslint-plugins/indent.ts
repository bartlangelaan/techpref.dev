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

            // Space mode: indentation should only contain spaces and be a multiple of expectedSpaceCount
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
                return;
              } else if (indent.length % expectedSpaceCount !== 0) {
                context.report({
                  loc: {
                    start: { line: lineNumber, column: 0 },
                    end: { line: lineNumber, column: indent.length },
                  },
                  messageId: "wrongIndentSize",
                  data: {
                    expected: String(expectedSpaceCount),
                    actual: String(indent.length),
                  },
                });
                return;
              }
            }
          },
        };
      },
    },
  },
});

export default plugin;
