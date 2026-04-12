export type LoginPayload = {
  email: string;
  password: string;
  clientId?: string;
};

export type RegisterPayload = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type SessionUser = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  roles: string[];
  profileImageUrl?: string;
};

export type UpdateProfilePayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

const DEFAULT_AUTH_CLIENT_ID =
  process.env.NEXT_PUBLIC_AUTH_CLIENT_ID?.trim() || "Client1";

export async function login(payload: LoginPayload) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      clientId: payload.clientId ?? DEFAULT_AUTH_CLIENT_ID,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) throw new Error(data?.message ?? "Login failed");

  return data;
}

export async function register(payload: RegisterPayload) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message ?? "Registration failed");
  }

  return data;
}

export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }
}

export async function getMe() {
  console.log("🔥 getMe CALLED");

  const res = await fetch("/api/auth/me", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  console.log("🔥 RESPONSE:", res);

  if (!res.ok) throw new Error("Unauthorized");

  const data = await res.json();

  console.log("🔥 USER DATA:", data);

  return data;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const res = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message ?? "Failed to update profile");
  }

  return data as { message: string; user: SessionUser | null };
}

export async function uploadProfilePicture(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/auth/profile-picture", {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message ?? "Failed to upload profile picture");
  }

  return data as {
    message: string;
    profileImageUrl: string;
    user?: SessionUser;
  };
}

export async function removeProfilePicture() {
  const res = await fetch("/api/auth/profile-picture", {
    method: "DELETE",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message ?? "Failed to remove profile picture");
  }

  return data as {
    message: string;
    profileImageUrl: string;
    user?: SessionUser;
  };
}
