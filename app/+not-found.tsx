import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops" }} />
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text className="mb-2 text-xl font-bold text-foreground">404</Text>
        <Text className="mb-6 text-muted-foreground">This screen does not exist.</Text>
        <Link href="/" className="text-primary">
          Go home
        </Link>
      </View>
    </>
  );
}
