import { useEffect, useState } from "react";
import { FlatList, Text, View, Pressable } from "react-native";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { eq } from "drizzle-orm";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/db/client";
import { items, type Item } from "@/lib/db/schema";
import { t } from "@/lib/i18n";
import { track } from "@/lib/analytics/posthog";

export default function Home() {
  const { data } = useLiveQuery(db.select().from(items).where(eq(items.deletedAt, null as unknown as number)));
  const [draft, setDraft] = useState("");

  async function add() {
    if (!draft.trim()) return;
    const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(items).values({ id, title: draft.trim() });
    setDraft("");
    track("feature_used", { feature: "item_added" });
  }

  async function toggle(item: Item) {
    await db
      .update(items)
      .set({ isDone: !item.isDone, updatedAt: Date.now(), dirty: true })
      .where(eq(items.id, item.id));
  }

  return (
    <Screen>
      <View className="flex-1 px-5 pt-4">
        <Text className="mb-4 text-2xl font-bold text-foreground">{t("home.title")}</Text>
        <View className="mb-4 flex-row gap-2">
          <View className="flex-1">
            <Input value={draft} onChangeText={setDraft} placeholder={t("home.addItem")} />
          </View>
          <Button label="+" size="md" onPress={add} />
        </View>
        <FlatList
          data={data ?? []}
          keyExtractor={(it) => it.id}
          ListEmptyComponent={
            <Text className="mt-10 text-center text-muted-foreground">{t("home.empty")}</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggle(item)}
              className="mb-2 flex-row items-center rounded-xl border border-border p-4"
            >
              <View
                className={`mr-3 h-5 w-5 rounded-md border ${item.isDone ? "border-primary bg-primary" : "border-border"}`}
              />
              <Text
                className={`flex-1 text-base text-foreground ${item.isDone ? "line-through opacity-60" : ""}`}
              >
                {item.title}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </Screen>
  );
}
