import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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
  { label: "10 min", value: 10 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1 day", value: 1440 },
];

export default function TaskDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTaskById, updateTask, deleteTask, toggleComplete } = useTasks();
  const { scheduleReminder, cancelReminder } = useReminders();

  const task = getTaskById(id);

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [category, setCategory] = useState<Category>(task?.category ?? "personal");
  const [deadline, setDeadline] = useState(task ? new Date(task.deadline) : new Date());
  const [reminderEnabled, setReminderEnabled] = useState(task?.reminderEnabled ?? true);
  const [reminderMinutes, setReminderMinutes] = useState(task?.reminderMinutesBefore ?? 30);
  const [editing, setEditing] = useState(false);

  if (!task) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Task not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isCompleted = task.status === "completed";

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a task title.");
      return;
    }

    await updateTask(id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      deadline: deadline.toISOString(),
      reminderEnabled,
      reminderMinutesBefore: reminderMinutes,
    });

    if (reminderEnabled) {
      await scheduleReminder({ ...task, deadline: deadline.toISOString(), reminderEnabled, reminderMinutesBefore: reminderMinutes });
    } else {
      await cancelReminder(id);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await cancelReminder(id);
          await deleteTask(id);
          router.back();
        },
      },
    ]);
  };

  const handleToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleComplete(id);
  };

  if (!editing) {
    const deadlineDate = new Date(task.deadline);
    return (
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
      >
        <View style={[styles.statusBanner, { backgroundColor: isCompleted ? colors.success + "12" : task.status === "overdue" ? colors.destructive + "12" : colors.primary + "08" }]}>
          <Feather
            name={isCompleted ? "check-circle" : task.status === "overdue" ? "alert-triangle" : "clock"}
            size={16}
            color={isCompleted ? colors.success : task.status === "overdue" ? colors.destructive : colors.primary}
          />
          <Text
            style={[styles.statusText, { color: isCompleted ? colors.success : task.status === "overdue" ? colors.destructive : colors.primary }]}
          >
            {isCompleted ? "Completed" : task.status === "overdue" ? "Overdue" : "Pending"}
          </Text>
        </View>

        <View style={styles.detailContent}>
          <Text style={[styles.detailTitle, { color: colors.foreground, textDecorationLine: isCompleted ? "line-through" : "none" }]}>
            {task.title}
          </Text>
          {task.description ? (
            <Text style={[styles.detailDesc, { color: colors.mutedForeground }]}>{task.description}</Text>
          ) : null}

          <View style={styles.metaGrid}>
            <View style={[styles.metaItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="flag" size={16} color={
                task.priority === "high" ? colors.priorityHigh : task.priority === "medium" ? colors.priorityMedium : colors.priorityLow
              } />
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Priority</Text>
              <Text style={[styles.metaValue, { color: colors.foreground, textTransform: "capitalize" }]}>{task.priority}</Text>
            </View>
            <View style={[styles.metaItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="tag" size={16} color={colors.primary} />
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Category</Text>
              <Text style={[styles.metaValue, { color: colors.foreground, textTransform: "capitalize" }]}>{task.category}</Text>
            </View>
            <View style={[styles.metaItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="calendar" size={16} color={colors.accent} />
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Due Date</Text>
              <Text style={[styles.metaValue, { color: colors.foreground }]}>
                {deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
            </View>
            <View style={[styles.metaItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="clock" size={16} color={colors.accent} />
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Time</Text>
              <Text style={[styles.metaValue, { color: colors.foreground }]}>
                {deadlineDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </Text>
            </View>
          </View>

          {task.reminderEnabled && (
            <View style={[styles.reminderBadge, { backgroundColor: colors.accent + "12" }]}>
              <Feather name="bell" size={14} color={colors.accent} />
              <Text style={[styles.reminderBadgeText, { color: colors.accent }]}>
                Reminder: {task.reminderMinutesBefore >= 60 ? `${task.reminderMinutesBefore / 60}h` : `${task.reminderMinutesBefore}m`} before
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <Pressable
              onPress={handleToggle}
              style={[styles.actionBtn, { backgroundColor: isCompleted ? colors.muted : colors.success }]}
            >
              <Feather name={isCompleted ? "rotate-ccw" : "check"} size={18} color={isCompleted ? colors.foreground : colors.successForeground} />
              <Text style={[styles.actionBtnText, { color: isCompleted ? colors.foreground : colors.successForeground }]}>
                {isCompleted ? "Reopen" : "Complete"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setEditing(true)}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="edit-2" size={18} color={colors.primaryForeground} />
              <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              style={[styles.iconBtn, { backgroundColor: colors.destructive + "12" }]}
            >
              <Feather name="trash-2" size={18} color={colors.destructive} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={[styles.editContent, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.titleInput, { color: colors.foreground }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.descInput, { color: colors.foreground }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>Priority</Text>
        <View style={styles.chipRow}>
          {PRIORITIES.map((p) => {
            const active = priority === p.value;
            const pColor = p.value === "high" ? colors.priorityHigh : p.value === "medium" ? colors.priorityMedium : colors.priorityLow;
            return (
              <Pressable key={p.value} onPress={() => setPriority(p.value)} style={[styles.chip, { backgroundColor: active ? pColor + "15" : colors.muted, borderColor: active ? pColor : "transparent", borderWidth: active ? 1.5 : 0 }]}>
                <Feather name={p.icon} size={14} color={active ? pColor : colors.mutedForeground} />
                <Text style={[styles.chipText, { color: active ? pColor : colors.mutedForeground }]}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <Pressable key={c.value} onPress={() => setCategory(c.value)} style={[styles.catChip, { backgroundColor: active ? colors.primary + "15" : colors.muted, borderColor: active ? colors.primary : "transparent", borderWidth: active ? 1.5 : 0 }]}>
                <Feather name={c.icon} size={14} color={active ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.chipText, { color: active ? colors.primary : colors.mutedForeground }]}>{c.label}</Text>
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
            <View style={styles.reminderChips}>
              {REMINDER_OPTIONS.map((opt) => {
                const active = reminderMinutes === opt.value;
                return (
                  <Pressable key={opt.value} onPress={() => setReminderMinutes(opt.value)} style={[styles.reminderChip, { backgroundColor: active ? colors.accent + "15" : colors.muted, borderColor: active ? colors.accent : "transparent", borderWidth: active ? 1.5 : 0 }]}>
                    <Text style={[styles.chipText, { color: active ? colors.accent : colors.mutedForeground }]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.editActions}>
          <Pressable onPress={() => setEditing(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
            <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Cancel</Text>
          </Pressable>
          <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Feather name="check" size={18} color={colors.primaryForeground} />
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  backLink: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, marginHorizontal: 16, marginTop: 16, borderRadius: 10 },
  statusText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  detailContent: { padding: 20 },
  detailTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 6 },
  detailDesc: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 16 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  metaItem: { width: "47%", padding: 12, borderRadius: 10, borderWidth: 1, gap: 4 },
  metaLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  metaValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reminderBadge: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, gap: 8, marginBottom: 20 },
  reminderBadgeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 6 },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  iconBtn: { width: 50, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  editContent: { padding: 20, gap: 4 },
  inputGroup: { borderBottomWidth: 1, marginBottom: 16 },
  titleInput: { fontSize: 20, fontFamily: "Inter_600SemiBold", paddingVertical: 12 },
  descInput: { fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 10, minHeight: 60, textAlignVertical: "top" },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 8, marginTop: 8 },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  chip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, gap: 6 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  catChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 6 },
  reminderSection: { borderTopWidth: 1, paddingTop: 16, marginTop: 8 },
  reminderHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  reminderTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  reminderChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  reminderChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  editActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  cancelBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  saveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 6 },
  saveBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
