import { Tabs } from "expo-router";
import { Home, Settings } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { t } from "@/lib/i18n";

/**
 * Bottom tabs layout.
 *
 * Pattern for the agent: each <Tabs.Screen> declares its `tabBarIcon` via the
 * `tabIcon(...)` helper below — pass any lucide-react-native icon component.
 *
 * Example (filled in by the codegen agent for a fitness app):
 *
 *   import { Dumbbell, Calendar } from "lucide-react-native";
 *
 *   <Tabs.Screen
 *     name="programs"
 *     options={{
 *       title: t("tabs.programs"),
 *       tabBarIcon: tabIcon(Dumbbell),
 *     }}
 *   />
 *   <Tabs.Screen
 *     name="schedule"
 *     options={{
 *       title: t("tabs.schedule"),
 *       tabBarIcon: tabIcon(Calendar),
 *     }}
 *   />
 *
 * Keep tabs to 3-5 max (mobile UX rule). Index = home.
 */
function tabIcon(Icon: LucideIcon) {
  return ({ color, size }: { color: string; size: number }) => (
    <Icon color={color} size={size} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "rgb(var(--color-primary))",
        tabBarInactiveTintColor: "rgb(var(--color-muted-foreground))",
        tabBarStyle: {
          backgroundColor: "rgb(var(--color-background))",
          borderTopColor: "rgb(var(--color-border))",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 16,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: tabIcon(Home),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: tabIcon(Settings),
        }}
      />
    </Tabs>
  );
}
