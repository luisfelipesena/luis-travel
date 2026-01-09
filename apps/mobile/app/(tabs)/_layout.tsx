import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { useColorScheme } from "@/components/useColorScheme"
import Colors from "@/constants/Colors"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

function TabBarIcon({ name, color }: { name: IconName; color: string }) {
  return <Ionicons size={24} name={name} color={color} style={{ marginBottom: -3 }} />
}

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trips",
          tabBarIcon: ({ color }) => <TabBarIcon name="airplane-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="person-outline" color={color} />,
        }}
      />
      {/* Hide the old two.tsx from tabs */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  )
}
