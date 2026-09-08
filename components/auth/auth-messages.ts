export function authErrorMessage(message?: string) {
  const value = (message ?? "").toLowerCase();

  if (!value) {
    return "Something went wrong. Please try again.";
  }

  if (value.includes("invalid login") || value.includes("invalid credentials")) {
    return "Invalid email or password.";
  }

  if (value.includes("email not confirmed") || value.includes("not confirmed")) {
    return "Please verify your email before signing in.";
  }

  if (value.includes("already registered") || value.includes("already been registered") || value.includes("user already")) {
    return "This email is already registered.";
  }

  if (value.includes("failed to fetch") || value.includes("network")) {
    return "Unable to connect. Please try again.";
  }

  if (value.includes("duplicate") || value.includes("unique")) {
    return "This lorry registration number is already registered.";
  }

  return "Unable to complete the request. Please try again.";
}

