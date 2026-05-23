export const syncSessionCookie = async (idToken: string | null): Promise<void> => {
  if (idToken) {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ idToken }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Could not create session");
    }
    return;
  }

  await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "same-origin",
  });
};
