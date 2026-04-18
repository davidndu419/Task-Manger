import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Task } from "@/types/task";

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  work: "briefcase",
  personal: "user",
  health: "heart",
  shopping: "shopping-cart",
  finance: "dollar-sign",
  education: "book",
  other: "tag",
};

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onDelete }: Props) {
  const colors = useColors();
  const isCompleted = task.status === "completed";
  const isOverdue = task.status === "overdue";

  const priorityColor =
    task.priority === "high" ? colors.priorityHigh : task.priority === "medium" ? colors.priorityMedium : colors.priorityLow;

  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let timeLabel = "";
  if (isCompleted) {
    timeLabel = "Done";
  } else if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    timeLabel = overdueDays === 0 ? "Overdue today" : `${overdueDays}d overdue`;
  } else if (diffHours < 1) {
    timeLabel = "Due soon";
  } else if (diffHours < 24) {
    timeLabel = `${diffHours}h left`;
  } else {
    timeLabel = `${diffDays}d left`;
  }

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(task.id);
  };

  const handlePress = () => {
    router.push({ pathname: "/task/[id]", params: { id: task.id } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: isOverdue ? colors.destructive + "40" : colors.border,
          opacity: pressed ? 0.92 : 1,
          borderLeftColor: priorityColor,
        },
      ]}
    >
      <Pressable onPress={handleToggle} style={styles.checkArea} hitSlop={12}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: isCompleted ? colors.success : colors.mutedForeground,
              backgroundColor: isCompleted ? colors.success : "transparent",
            },
          ]}
        >
          {isCompleted && <Feather name="check" size={12} color={colors.successForeground} />}
        </View>
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: isCompleted ? colors.mutedForeground : colors.foreground,
              textDecorationLine: isCompleted ? "line-through" : "none",
            },
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        {task.description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
            <Feather name={CATEGORY_ICONS[task.category] || "tag"} size={10} color={colors.secondaryForeground} />
            <Text style={[styles.categoryText, { color: colors.secondaryForeground }]}>{task.category}</Text>
          </View>
          <View style={[styles.timeBadge, { backgroundColor: isOverdue ? colors.destructive + "15" : colors.muted }]}>
            <Feather
              name="clock"
              size={10}
              color={isOverdue ? colors.destructive : colors.mutedForeground}
            />
            <Text
              style={[styles.timeText, { color: isOverdue ? colors.destructive : colors.mutedForeground }]}
            >
              {timeLabel}
            </Text>
          </View>
          {task.reminderEnabled && (
            <Feather name="bell" size={12} color={colors.accent} style={{ marginLeft: 4 }} />
          )}
        </View>
      </View>

      <Pressable onPress={() => onDelete(task.id)} hitSlop={12} style={styles.deleteBtn}>
        <Feather name="trash-2" size={16} color={colors.mutedForeground} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  checkArea: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "capitalize",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  timeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 8,
  },
});
