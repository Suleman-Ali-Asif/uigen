"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const filename = (path: unknown) =>
    String(path).split("/").pop() || String(path);

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Creating ${filename(args.path)}`;
      case "str_replace":
      case "insert":
        return `Editing ${filename(args.path)}`;
      case "view":
        return `Reading ${filename(args.path)}`;
      case "undo_edit":
        return `Undoing changes in ${filename(args.path)}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "delete":
        return `Deleting ${filename(args.path)}`;
      case "rename":
        return `Renaming ${filename(args.path)}`;
    }
  }

  return toolName;
}

interface ToolInvocationChipProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationChip({ toolInvocation }: ToolInvocationChipProps) {
  const { toolName, args, state } = toolInvocation;
  const done = state === "result" && (toolInvocation as { result?: unknown }).result != null;
  const label = getLabel(toolName, args as Record<string, unknown>);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
