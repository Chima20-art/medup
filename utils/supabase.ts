import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iyqmrvqpijtukoorejwm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cW1ydnFwaWp0dWtvb3JlandtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1ODc0MjUsImV4cCI6MjA0OTE2MzQyNX0.K60GYwYImygHBJmNhwHWOAxrXNW384QrRLdF4lxjnC4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
