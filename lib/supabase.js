import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ftlvmxyiicjhvcfhnkkp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bHZteHlpaWNqaHZjZmhua2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDc0MzEsImV4cCI6MjA4NjEyMzQzMX0.d4gy6JJM2WmwU3vfVufxGoTzENm14OLGWvychMLFkM8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Adding the Authenticated Client Helper (For secure writes)
export const createAuthenticatedClient = (clerkToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
};