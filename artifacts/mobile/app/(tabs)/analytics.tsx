import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatCard } from "@/components/StatCard";
import { useTasks } from "@/context/TaskContext";
import { useColors } from "@/hooks/useColors";
import type { Category, Priority } from "@/types/task";

const CATEGORY_LABELS: Record<Category, string> = {
  work: "Work",
  personal: "Personal",
  health: "Health",
  shopping: "Shopping",
  finance: "Finance",
  education: "Education",
  other: "Other",
};

const CATEGORY_COLORS: Record<Category, string> = {
  work: "#3b82f6",
  personal: "#8b5cf6",
  health: "#ef4444",
  shopping: "#f59e0b",
  finance: "#10b981",
  education: "#06b6d4",
  other: "#6b7280",
};

const CATEGORY_ICONS: Record<Category, keyof typeof Feather.glyphMap> = {
  work: "briefcase",
  personal: "user",
  health: "heart",
  shopping: "shopping-cart",
  finance: "dollar-sign",
  education: "book",
  other: "tag",
};

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { stats } = useTasks();

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  const categoriesWithTasks = (Object.entries(stats.byCategory) as [Category, number][]).filter(
    ([, count]) => count > 0
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: (Platform.OS === "web" ? webTopPadding : insets.top) + 12,
        paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Analytics</Text>

      <View style={styles.statRow}>
        <StatCard
          title="Total"
          value={stats.total}
          icon="list"
          color={colors.primary}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon="check-circle"
          color={colors.success}
        />
      </View>
      <View style={styles.statRow}>
        <StatCard
          title="Pending"
          value={stats.pending}
          icon="clock"
          color={colors.warning}
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon="alert-triangle"
          color={colors.destructive}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Completion Rate</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: completionRate >= 75 ? colors.success : completionRate >= 50 ? colors.warning : colors.destructive,
                  width: `${completionRate}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.foreground }]}>{completionRate}%</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Productivity</Text>
        <View style={styles.prodRow}>
          <View style={styles.prodItem}>
            <Text style={[styles.prodValue, { color: colors.primary }]}>{stats.completedToday}</Text>
            <Text style={[styles.prodLabel, { color: colors.mutedForeground }]}>Today</Text>
          </View>
          <View style={[styles.prodDivider, { backgroundColor: colors.border }]} />
          <View style={styles.prodItem}>
            <Text style={[styles.prodValue, { color: colors.primary }]}>{stats.completedThisWeek}</Text>
            <Text style={[styles.prodLabel, { color: colors.mutedForeground }]}>This Week</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>By Category</Text>
        {categoriesWithTasks.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No tasks yet</Text>
        ) : (
          categoriesWithTasks.map(([cat, count]) => (
            <View key={cat} style={styles.catRow}>
              <View style={[styles.catIcon, { backgroundColor: CATEGORY_COLORS[cat] + "15" }]}>
                <Feather name={CATEGORY_ICONS[cat]} size={14} color={CATEGORY_COLORS[cat]} />
              </View>
              <Text style={[styles.catLabel, { color: colors.foreground }]}>{CATEGORY_LABELS[cat]}</Text>
              <View style={styles.catBarWrap}>
                <View style={[styles.catBarBg, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.catBarFill,
                      {
                        backgroundColor: CATEGORY_COLORS[cat],
                        width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.catCount, { color: colors.mutedForeground }]}>{count}</Text>
            </View>
          ))
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>By Priority</Text>
        {(["high", "medium", "low"] as Priority[]).map((p) => {
          const count = stats.byPriority[p];
          const pColor =
            p === "high" ? colors.priorityHigh : p === "medium" ? colors.priorityMedium : colors.priorityLow;
          return (
            <View key={p} style={styles.catRow}>
              <View style={[styles.catIcon, { backgroundColor: pColor + "15" }]}>
                <Feather
                  name={p === "high" ? "arrow-up" : p === "medium" ? "minus" : "arrow-down"}
                  size={14}
                  color={pColor}
                />
              </View>
              <Text style={[styles.catLabel, { color: colors.foreground, textTransform: "capitalize" }]}>
                {p}
              </Text>
              <View style={styles.catBarWrap}>
                <View style={[styles.catBarBg, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.catBarFill,
                      {
                        backgroundColor: pColor,
                        width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.catCount, { color: colors.mutedForeground }]}>{count}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBg: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    width: 45,
    textAlign: "right",
  },
  prodRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  prodItem: {
    flex: 1,
    alignItems: "center",
  },
  prodValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  prodLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  prodDivider: {
    width: 1,
    height: 40,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  catIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  catLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    width: 70,
  },
  catBarWrap: {
    flex: 1,
  },
  catBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  catBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  catCount: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    width: 24,
    textAlign: "right",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 8,
  },
});
