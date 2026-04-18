import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { TaskFilter } from "@/types/task";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
] as const;

const PRIORITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
] as const;

interface Props {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

export function FilterBar({ filter, onFilterChange }: Props) {
  const colors = useColors();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {STATUS_OPTIONS.map((opt) => {
          const active = (filter.status || "all") === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onFilterChange({ ...filter, status: opt.value })}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.primary : colors.muted },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? colors.primaryForeground : colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => setShowSearch(!showSearch)}
          style={[styles.searchBtn, { backgroundColor: showSearch ? colors.primary + "18" : colors.muted }]}
        >
          <Feather
            name="search"
            size={15}
            color={showSearch ? colors.primary : colors.mutedForeground}
          />
        </Pressable>
      </View>

      <View style={styles.row}>
        {PRIORITY_OPTIONS.map((opt) => {
          const active = (filter.priority || "all") === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onFilterChange({ ...filter, priority: opt.value })}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.primary : colors.muted },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? colors.primaryForeground : colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => {
            onFilterChange({ ...filter, status: "all", priority: "all", search: "" });
            setShowSearch(false);
          }}
          style={[styles.searchBtn, { backgroundColor: colors.muted }]}
        >
          <Feather name="x" size={15} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {showSearch && (
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search tasks..."
            placeholderTextColor={colors.mutedForeground}
            value={filter.search || ""}
            onChangeText={(text) => onFilterChange({ ...filter, search: text })}
            autoFocus
          />
          {filter.search ? (
            <Pressable onPress={() => onFilterChange({ ...filter, search: "" })}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  searchBtn: {
    width: 34,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
});
