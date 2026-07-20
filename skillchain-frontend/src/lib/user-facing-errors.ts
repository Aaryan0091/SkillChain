export function getErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error || fallback);
  return friendlyErrorMessage(message, fallback);
}

export function friendlyErrorMessage(message: string, fallback = "Something went wrong.") {
  const lower = message.toLowerCase();

  if (lower.includes("failed to fetch") || lower.includes("connection refused")) {
    return "Could not reach the SkillChain backend. Make sure the dev server is running and try again.";
  }

  if (lower.includes("please sign in") || lower.includes("jwt") || lower.includes("auth")) {
    return "Your sign-in session needs a refresh. Sign in again, then retry this action.";
  }

  if (lower.includes("github api request failed with status 401")) {
    return "GitHub rejected the request. Replace the GitHub token, restart the app, and try again.";
  }

  if (lower.includes("repository owner") || lower.includes("ownership verification")) {
    return message;
  }

  if (lower.includes("blockchain") || lower.includes("contract") || lower.includes("transaction")) {
    return `Blockchain verification could not finish. ${message}`;
  }

  if (lower.includes("does not exist") && lower.includes("column")) {
    return "The live Supabase schema is missing a column that the app expects. Run the latest SQL migrations, then retry.";
  }

  return message || fallback;
}
