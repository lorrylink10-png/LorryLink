type AuthErrorProps = {
  message: string | null;
};

export function AuthError({ message }: AuthErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-semibold leading-6 text-[var(--danger)]">
      {message}
    </div>
  );
}

