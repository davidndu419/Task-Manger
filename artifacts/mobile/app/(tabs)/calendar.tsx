import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { TaskCard } from "@/components/TaskCard";
import { useTasks } from "@/context/TaskContext";
import { useColors } from "@/hooks/useColors";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, toggleComplete, deleteTask } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tasks) {
      if (t.status !== "completed") {
        const key = toLocalDateStr(new Date(t.deadline));
        map[key] = (map[key] || 0) + 1;
      }
    }
    return map;
  }, [tasks]);

  const selectedDateStr = toLocalDateStr(selectedDate);
  const selectedTasks = useMemo(
    () => tasks.filter((t) => toLocalDateStr(new Date(t.deadline)) === selectedDateStr),
    [tasks, selectedDateStr]
  );

  const todayStr = toLocalDateStr(new Date());

  const goToPrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: (Platform.OS === "web" ? webTopPadding : insets.top) + 12 }}>
        <View style={styles.monthHeader}>
          <Pressable onPress={goToPrevMonth} hitSlop={12}>
            <Feather name="chevron-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.monthTitle, { color: colors.foreground }]}>
            {MONTHS[month]} {year}
          </Text>
          <Pressable onPress={goToNextMonth} hitSlop={12}>
            <Feather name="chevron-right" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={styles.daysHeader}>
          {DAYS.map((d) => (
            <Text key={d} style={[styles.dayLabel, { color: colors.mutedForeground }]}>
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {calendarDays.map((day, idx) => {
            if (day === null) return <View key={`e-${idx}`} style={styles.dayCell} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === todayStr;
            const count = tasksByDate[dateStr] || 0;

            return (
              <Pressable
                key={dateStr}
                onPress={() => setSelectedDate(new Date(year, month, day))}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: colors.primary, borderRadius: 10 },
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    {
                      color: isSelected
                        ? colors.primaryForeground
                        : isToday
                          ? colors.primary
                          : colors.foreground,
                      fontFamily: isToday || isSelected ? "Inter_700Bold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {day}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isSelected ? colors.primaryForeground : colors.accent,
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.separator}>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dateLabel, { color: colors.foreground }]}>
          {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </Text>
        <Text style={[styles.countLabel, { color: colors.mutedForeground }]}>
          {selectedTasks.length} {selectedTasks.length === 1 ? "task" : "tasks"}
        </Text>
      </View>

      <FlatList
        data={selectedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onToggle={toggleComplete} onDelete={deleteTask} />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 },
        ]}
        ListEmptyComponent={
          <EmptyState icon="calendar" title="No tasks" message="No tasks scheduled for this date" />
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={selectedTasks.length > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  daysHeader: {
    flexDirection: "row",
    paddingHorizontal: 12,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    paddingBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: 14,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  separator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  separatorLine: {
    height: 1,
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  countLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
  },
});
