import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationChip } from "../ToolInvocationChip";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  done = false
): ToolInvocation {
  if (done) {
    return { toolCallId: "1", toolName, args, state: "result", result: "ok" } as ToolInvocation;
  }
  return { toolCallId: "1", toolName, args, state: "call" } as ToolInvocation;
}

// str_replace_editor labels

test("shows 'Creating' for str_replace_editor create command", () => {
  render(<ToolInvocationChip toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/components/Button.tsx" })} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor str_replace command", () => {
  render(<ToolInvocationChip toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "src/components/Card.tsx" })} />);
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor insert command", () => {
  render(<ToolInvocationChip toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "src/components/Form.tsx" })} />);
  expect(screen.getByText("Editing Form.tsx")).toBeDefined();
});

test("shows 'Reading' for str_replace_editor view command", () => {
  render(<ToolInvocationChip toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "src/components/Header.tsx" })} />);
  expect(screen.getByText("Reading Header.tsx")).toBeDefined();
});

test("shows 'Undoing changes' for str_replace_editor undo_edit command", () => {
  render(<ToolInvocationChip toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "src/components/Nav.tsx" })} />);
  expect(screen.getByText("Undoing changes in Nav.tsx")).toBeDefined();
});

// file_manager labels

test("shows 'Deleting' for file_manager delete command", () => {
  render(<ToolInvocationChip toolInvocation={makeInvocation("file_manager", { command: "delete", path: "src/components/Old.tsx" })} />);
  expect(screen.getByText("Deleting Old.tsx")).toBeDefined();
});

test("shows 'Renaming' for file_manager rename command", () => {
  render(<ToolInvocationChip toolInvocation={makeInvocation("file_manager", { command: "rename", path: "src/components/Foo.tsx", new_path: "src/components/Bar.tsx" })} />);
  expect(screen.getByText("Renaming Foo.tsx")).toBeDefined();
});

// Unknown tool falls back to tool name

test("falls back to tool name for unknown tools", () => {
  render(<ToolInvocationChip toolInvocation={makeInvocation("unknown_tool", {})} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

// State indicators

test("shows spinner when in progress", () => {
  const { container } = render(
    <ToolInvocationChip toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/Button.tsx" }, false)} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("shows green dot when done", () => {
  const { container } = render(
    <ToolInvocationChip toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/Button.tsx" }, true)} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
