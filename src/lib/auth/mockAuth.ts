import type { User } from "./types";

const STORAGE_KEY = "mockUser";

export async function mockLogin(
  email: string,
  password: string
): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // For frontend-only: accept any credentials
  // In real implementation, this would validate against backend
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Create mock user from email
  const user: User = {
    id: crypto.randomUUID(),
    email: email,
    name: email.split("@")[0], // Use email prefix as name
    createdAt: new Date().toISOString(),
  };

  return user;
}

export async function mockSignup(
  name: string,
  email: string,
  password: string
): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Basic validation
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // Create mock user
  const user: User = {
    id: crypto.randomUUID(),
    email: email,
    name: name,
    createdAt: new Date().toISOString(),
  };

  return user;
}

export function mockLogout(): void {
  // Clear stored user data
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function saveMockUserToStorage(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}

export function getMockUserFromStorage(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const user = JSON.parse(stored);
    return user;
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return null;
  }
}

export async function mockForgotPassword(email: string): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!email) {
    throw new Error("Email is required");
  }

  // In real implementation, this would send a password reset email
  console.log(`Password reset link sent to: ${email}`);
}
