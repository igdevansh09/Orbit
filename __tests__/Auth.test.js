import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import Login from "../app/(auth)/login";

// Mock Clerk
jest.mock("@clerk/clerk-expo", () => ({
  useOAuth: () => ({
    startOAuthFlow: jest.fn(),
  }),
  ClerkProvider: ({ children }) => children,
  ClerkLoaded: ({ children }) => children,
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
}));

// Mock Expo Router
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSegments: () => [],
  Link: ({ children }) => children,
  Stack: ({ children }) => children,
}));

// Mock Expo Web Browser
jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

// Mock custom hooks
jest.mock("../hooks/useWarmUpBrowser", () => ({
  useWarmUpBrowser: jest.fn(),
}));

describe("Login Screen", () => {
  it("renders the Orbit welcome message", () => {
    const { getByText } = render(<Login />);
    expect(getByText("Welcome to Orbit 🪐")).toBeTruthy();
  });

  it("renders the Google OAuth button", () => {
    const { getByText } = render(<Login />);
    expect(getByText("Continue with NSUT ID")).toBeTruthy();
  });

  it("displays NSUT restriction message", () => {
    const { getByText } = render(<Login />);
    expect(getByText("Restricted to @nsut.ac.in emails only")).toBeTruthy();
  });
});
