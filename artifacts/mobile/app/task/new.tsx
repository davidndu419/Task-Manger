import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTasks } from "@/context/TaskContext";
import { useReminders } from "@/context/ReminderContext";
import { useColors } from "@/hooks/useColors";
import { DeadlinePicker } from "@/components/DeadlinePicker";
import type { Category, Priority } from "@/types/task";

const PRIORITIES: { label: string; value: Priority; icon: keyof typeof Feather.glyphMap }[] = [
  { label: "High", value: "high", icon: "arrow-up" },
  { label: "Medium", value: "medium", icon: "minus" },
  { label: "Low", value: "low", icon: "arrow-down" },
];

const CATEGORIES: { label: string; value: Category; icon: keyof typeof Feather.glyphMap }[] = [
  { label: "Work", value: "work", icon: "briefcase" },
  { label: "Personal", value: "personal", icon: "user" },
  { label: "Health", value: "health", icon: "heart" },
  { label: "Shopping", value: "shopping", icon: "shopping-cart" },
  { label: "Finance", value: "finance", icon: "dollar-sign" },
  { label: "Education", value: "education", icon: "book" },
  { label: "Other", value: "other", icon: "tag" },
];

const REMINDER_OPTIONS = [
  { label: "10 min before", value: 10 },
  { label: "30 min before", value: 30 },
  { label: "1 hour before", value: 60 },
  { label: "1 day before", value: 1440 },
];

export default function NewTaskScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTask } = useTasks();
  const { scheduleReminder, requestPermissions } = useReminders();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("personal");
  const [deadline, setDeadline] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(30);

  const priorityColor =
    priority === "high" ? colors.priorityHigh : priority === "medium" ? colors.priorityMedium : colors.priorityLow;

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a task title.");
      return;
    }

    if (reminderEnabled) {
      await requestPermissions();
    }

    const task = await addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      deadline: deadline.toISOString(),
      reminderEnabled,
      reminderMinutesBefore: reminderMinutes,
    });

    if (reminderEnabled) {
      await scheduleReminder(task);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.titleInput, { color: colors.foreground }]}
            placeholder="Task title"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.descInput, { color: colors.foreground }]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>Priority</Text>
        <View style={styles.optionRow}>
          {PRIORITIES.map((p) => {
            const active = priority === p.value;
            const pColor =
              p.value === "high" ? colors.priorityHigh : p.value === "medium" ? colors.priorityMedium : colors.priorityLow;
            return (
              <Pressable
                key={p.value}
                onPress={() => setPriority(p.value)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: active ? pColor + "15" : colors.muted,
                    borderColor: active ? pColor : "transparent",
                    borderWidth: active ? 1.5 : 0,
                  },
                ]}
              >
                <Feather name={p.icon} size={14} color={active ? pColor : colors.mutedForeground} />
                <Text
                  style={[styles.optionText, { color: active ? pColor : colors.mutedForeground }]}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <Pressable
                key={c.value}
                onPress={() => setCategory(c.value)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: active ? colors.primary + "15" : colors.muted,
                    borderColor: active ? colors.primary : "transparent",
                    borderWidth: active ? 1.5 : 0,
                  },
                ]}
              >
                <Feather name={c.icon} size={14} color={active ? colors.primary : colors.mutedForeground} />
                <Text
                  style={[styles.catText, { color: active ? colors.primary : colors.mutedForeground }]}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>Deadline</Text>
        <DeadlinePicker value={deadline} onChange={setDeadline} />

        <View style={[styles.reminderSection, { borderColor: colors.border }]}>
          <View style={styles.reminderHeader}>
            <View style={styles.rowLeft}>
              <Feather name="bell" size={18} color={colors.accent} />
              <Text style={[styles.reminderTitle, { color: colors.foreground }]}>Reminder</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: colors.muted, true: colors.accent + "60" }}
              thumbColor={reminderEnabled ? colors.accent : colors.mutedForeground}
            />
          </View>
          {reminderEnabled && (
            <View style={styles.reminderOptions}>
              {REMINDER_OPTIONS.map((opt) => {
                const active = reminderMinutes === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setReminderMinutes(opt.value)}
                    style={[
                      styles.reminderChip,
                      {
                        backgroundColor: active ? colors.accent + "15" : colors.muted,
                        borderColor: active ? colors.accent : "transparent",
                        borderWidth: active ? 1.5 : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reminderChipText,
                        { color: active ? colors.accent : colors.mutedForeground },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Feather name="check" size={20} color={colors.primaryForeground} />
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Create Task</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 4,
  },
  inputGroup: {
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    paddingVertical: 12,
  },
  descInput: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingVertical: 10,
    minHeight: 60,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    marginTop: 8,
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  optionChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  optionText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  catText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  reminderSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reminderTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  reminderOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  reminderChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reminderChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 20,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
