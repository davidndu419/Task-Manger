import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { FilterBar } from "@/components/FilterBar";
import { TaskCard } from "@/components/TaskCard";
import { useTasks } from "@/context/TaskContext";
import { useColors } from "@/hooks/useColors";

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { filteredTasks, filter, setFilter, toggleComplete, deleteTask, stats } = useTasks();

  const handleDelete = useCallback(
    (id: string) => {
      if (Platform.OS === "web") {
        deleteTask(id);
        return;
      }
      Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTask(id),
        },
      ]);
    },
    [deleteTask]
  );

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/task/new");
  };

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: (Platform.OS === "web" ? webTopPadding : insets.top) + 12 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {stats.pending + stats.overdue} tasks remaining
          </Text>
        </View>
        <Pressable
          onPress={handleAdd}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={22} color={colors.primaryForeground} />
        </Pressable>
      </View>

      {stats.overdue > 0 && (
        <View style={[styles.alertBanner, { backgroundColor: colors.destructive + "12" }]}>
          <Feather name="alert-circle" size={14} color={colors.destructive} />
          <Text style={[styles.alertText, { color: colors.destructive }]}>
            {stats.overdue} overdue {stats.overdue === 1 ? "task" : "tasks"}
          </Text>
        </View>
      )}

      <FilterBar filter={filter} onFilterChange={setFilter} />

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onToggle={toggleComplete} onDelete={handleDelete} />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="check-circle"
            title="No tasks found"
            message={
              filter.status !== "all" || filter.priority !== "all" || filter.search
                ? "Try adjusting your filters"
                : "Tap + to add your first task"
            }
          />
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={filteredTasks.length > 0}
      />
    </View>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  alertText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 16,
  },
});
