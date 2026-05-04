import type { ExecApprovalCommandHighlight } from "../exec-approvals.js";
import type { CommandExplanation } from "./types.js";

function spanToHighlight(
  span: { startIndex: number; endIndex: number },
  kind: ExecApprovalCommandHighlight["kind"],
  severity: NonNullable<ExecApprovalCommandHighlight["severity"]>,
): ExecApprovalCommandHighlight | null {
  if (!Number.isSafeInteger(span.startIndex) || !Number.isSafeInteger(span.endIndex)) {
    return null;
  }
  if (span.startIndex < 0 || span.endIndex <= span.startIndex) {
    return null;
  }
  return { startIndex: span.startIndex, endIndex: span.endIndex, kind, severity };
}

export function formatCommandExplanationHighlights(
  explanation: CommandExplanation,
): ExecApprovalCommandHighlight[] {
  const highlights: ExecApprovalCommandHighlight[] = [];

  for (const command of [...explanation.topLevelCommands, ...explanation.nestedCommands]) {
    const commandNameLength = command.executable.length;
    const commandHighlight = spanToHighlight(
      {
        startIndex: command.span.startIndex,
        endIndex: command.span.startIndex + commandNameLength,
      },
      "command",
      "info",
    );
    if (commandHighlight) {
      highlights.push(commandHighlight);
    }
  }

  for (const risk of explanation.risks) {
    if (risk.kind === "command-carrier") {
      const riskText = risk.flag ?? risk.command;
      const relativeStart = risk.text.indexOf(riskText);
      const startIndex =
        relativeStart >= 0 ? risk.span.startIndex + relativeStart : risk.span.startIndex;
      const riskHighlight = spanToHighlight(
        { startIndex, endIndex: startIndex + riskText.length },
        "risk",
        "warning",
      );
      if (riskHighlight) {
        highlights.push(riskHighlight);
      }
      continue;
    }
    if (risk.kind === "inline-eval") {
      const riskText = `${risk.command} ${risk.flag}`;
      const relativeStart = risk.text.indexOf(riskText);
      const startIndex =
        relativeStart >= 0 ? risk.span.startIndex + relativeStart : risk.span.startIndex;
      const riskHighlight = spanToHighlight(
        { startIndex, endIndex: startIndex + riskText.length },
        "risk",
        "danger",
      );
      if (riskHighlight) {
        highlights.push(riskHighlight);
      }
    }
  }
  return highlights;
}

export function formatCommandExplanationLines(_explanation: CommandExplanation): string[] {
  return [];
}
