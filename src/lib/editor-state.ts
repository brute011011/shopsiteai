export type EditingStatus = "idle" | "connecting" | "generating" | "saving" | "saved" | "error";
export type AssistantMode = "chat" | "edit";

export function assistantSucceeded(output: string, mode: AssistantMode) {
  return mode === "edit" ? generationSucceeded(output) : Boolean(output.trim()) && !output.includes("<!--SHOPSITE_ERROR-->");
}

export function generationSucceeded(output: string) {
  return /<html[\s>]/i.test(output) && /<\/html>/i.test(output) && !output.includes("<!--SHOPSITE_ERROR-->");
}

export function workspaceDestination(path: string, signedIn: boolean): "/dashboard" | null {
  return signedIn && (path === "/" || path === "/auth") ? "/dashboard" : null;
}