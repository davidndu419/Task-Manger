import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTasks } from "@/context/TaskContext";
import { useReminders } from "@/context/ReminderContext";
import { useColors } from "@/hooks/useColors";

type ConfirmAction = "clearCompleted" | "clearAll" | "loadDemo" | null;

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, clearCompletedTasks, clearAllTasks, loadDemoTasks } = useTasks();
  const { cancelAllReminders, requestPermissions } = useReminders();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      setNotificationsEnabled(granted);
    } else {
      setNotificationsEnabled(false);
      await cancelAllReminders();
    }
  };

  const handleConfirm = async () => {
    if (confirmAction === "clearCompleted") {
      await clearCompletedTasks();
    } else if (confirmAction === "clearAll") {
      await cancelAllReminders();
      await clearAllTasks();
    } else if (confirmAction === "loadDemo") {
      await loadDemoTasks();
    }
    setConfirmAction(null);
  };

  const confirmConfig = {
    clearCompleted: {
      icon: "check-square" as const,
      iconColor: colors.warning,
      title: "Clear Completed Tasks",
      message: `This will permanently remove ${completedCount} completed ${completedCount === 1 ? "task" : "tasks"}. This cannot be undone.`,
      confirmLabel: "Yes, Clear Them",
      warning: true,
    },
    clearAll: {
      icon: "trash-2" as const,
      iconColor: colors.destructive,
      title: "Delete All Tasks",
      message: `This will permanently delete all ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}, including pending and overdue ones. This cannot be undone.`,
      confirmLabel: "Yes, Delete Everything",
      warning: true,
    },
    loadDemo: {
      icon: "play-circle" as const,
      iconColor: colors.primary,
      title: "Load Demo Tasks",
      message: "This will add 7 sample tasks to your list so you can explore all the app's features.",
      confirmLabel: "Load Demo Tasks",
      warning: false,
    },
  };

  const active = confirmAction ? confirmConfig[confirmAction] : null;

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          paddingTop: (Platform.OS === "web" ? webTopPadding : insets.top) + 12,
          paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84,
        }}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Notifications</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="bell" size={18} color={colors.primary} />
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Enable Reminders</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.muted, true: colors.primary + "60" }}
              thumbColor={notificationsEnabled ? colors.primary : colors.mutedForeground}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Data</Text>

          <Pressable
            onPress={() => {
              if (completedCount === 0) return;
              setConfirmAction("clearCompleted");
            }}
            style={({ pressed }) => [
              styles.actionRow,
              { opacity: pressed ? 0.7 : completedCount === 0 ? 0.4 : 1 },
            ]}
          >
            <Feather name="check-square" size={18} color={colors.warning} />
            <View style={styles.actionTextBlock}>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Clear Completed Tasks</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                {completedCount} completed {completedCount === 1 ? "task" : "tasks"}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

          <Pressable
            onPress={() => {
              if (tasks.length === 0) return;
              setConfirmAction("clearAll");
            }}
            style={({ pressed }) => [
              styles.actionRow,
              { opacity: pressed ? 0.7 : tasks.length === 0 ? 0.4 : 1 },
            ]}
          >
            <Feather name="trash-2" size={18} color={colors.destructive} />
            <View style={styles.actionTextBlock}>
              <Text style={[styles.rowLabel, { color: colors.destructive }]}>Delete All Tasks</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

          <Pressable
            onPress={() => setConfirmAction("loadDemo")}
            style={({ pressed }) => [styles.actionRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="play-circle" size={18} color={colors.primary} />
            <View style={styles.actionTextBlock}>
              <Text style={[styles.rowLabel, { color: colors.primary }]}>Load Demo Tasks</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                Add 7 sample tasks for demonstration
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>About</Text>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.foreground }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: colors.mutedForeground }]}>1.0.0</Text>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.foreground }]}>Total Tasks</Text>
            <Text style={[styles.aboutValue, { color: colors.mutedForeground }]}>{tasks.length}</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={confirmAction !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmAction(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setConfirmAction(null)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {}}
          >
            {active && (
              <>
                <View style={[styles.modalIconWrap, { backgroundColor: active.iconColor + "15" }]}>
                  <Feather name={active.icon} size={28} color={active.iconColor} />
                </View>

                <Text style={[styles.modalTitle, { color: colors.foreground }]}>{active.title}</Text>
                <Text style={[styles.modalMessage, { color: colors.mutedForeground }]}>{active.message}</Text>

                {active.warning && (
                  <View style={[styles.warningBanner, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "30" }]}>
                    <Feather name="alert-triangle" size={14} color={colors.destructive} />
                    <Text style={[styles.warningText, { color: colors.destructive }]}>
                      This action is irreversible
                    </Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <Pressable
                    onPress={() => setConfirmAction(null)}
                    style={({ pressed }) => [
                      styles.modalCancelBtn,
                      { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleConfirm}
                    style={({ pressed }) => [
                      styles.modalConfirmBtn,
                      { backgroundColor: active.iconColor, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Feather name="check" size={16} color="#fff" />
                    <Text style={styles.modalConfirmText}>{active.confirmLabel}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  rowSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  actionTextBlock: {
    flex: 1,
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aboutLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  aboutValue: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "stretch",
  },
  warningText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    alignSelf: "stretch",
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  modalConfirmBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 10,
    gap: 6,
  },
  modalConfirmText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
