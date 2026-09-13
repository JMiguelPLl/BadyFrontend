import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { ThemeProvider, useThemeContext } from "../context/ThemeContext";

function RootNavigator() {
  const { isDark } = useThemeContext();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}