import * as Notifications from "expo-notifications";
import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { Platform } from "react-native";

import type { Task } from "@/types/task";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface ReminderContextType {
  scheduleReminder: (task: Task) => Promise<void>;
  cancelReminder: (taskId: string) => Promise<void>;
  cancelAllReminders: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

const ReminderContext = createContext<ReminderContextType | null>(null);

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const permissionGranted = useRef(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") return;
      const { status } = await Notifications.getPermissionsAsync();
      if (status === "granted") {
        permissionGranted.current = true;
      }
    })();
  }, []);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === "web") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    permissionGranted.current = status === "granted";
    return status === "granted";
  }, []);

  const scheduleReminder = useCallback(async (task: Task) => {
    if (Platform.OS === "web" || !task.reminderEnabled) return;
    if (!permissionGranted.current) {
      const granted = await Notifications.requestPermissionsAsync();
      if (granted.status !== "granted") return;
      permissionGranted.current = true;
    }

    await Notifications.cancelScheduledNotificationAsync(task.id).catch(() => {});

    const deadlineMs = new Date(task.deadline).getTime();
    const reminderMs = deadlineMs - task.reminderMinutesBefore * 60 * 1000;
    const now = Date.now();

    if (reminderMs > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: task.id,
        content: {
          title: `Reminder: ${task.title}`,
          body: `Due in ${task.reminderMinutesBefore} minutes`,
          data: { taskId: task.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(reminderMs),
        },
      });
    }

    if (deadlineMs > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${task.id}_deadline`,
        content: {
          title: `Deadline: ${task.title}`,
          body: "This task is due now!",
          data: { taskId: task.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(deadlineMs),
        },
      });
    }
  }, []);

  const cancelReminder = useCallback(async (taskId: string) => {
    if (Platform.OS === "web") return;
    await Notifications.cancelScheduledNotificationAsync(taskId).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(`${taskId}_deadline`).catch(() => {});
  }, []);

  const cancelAllReminders = useCallback(async () => {
    if (Platform.OS === "web") return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  return (
    <ReminderContext.Provider value={{ scheduleReminder, cancelReminder, cancelAllReminders, requestPermissions }}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error("useReminders must be used within ReminderProvider");
  return ctx;
}
