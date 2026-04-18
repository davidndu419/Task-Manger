import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export function DeadlinePicker({ value, onChange }: Props) {
  const colors = useColors();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const timeInputRef = useRef<HTMLInputElement | null>(null);

  const dateString = value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeString = value.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (Platform.OS === "web") {
    const localDateStr = [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");

    const localTimeStr = [
      String(value.getHours()).padStart(2, "0"),
      String(value.getMinutes()).padStart(2, "0"),
    ].join(":");

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) return;
      const [year, month, day] = val.split("-").map(Number);
      const updated = new Date(value);
      updated.setFullYear(year, month - 1, day);
      onChange(updated);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) return;
      const [hours, minutes] = val.split(":").map(Number);
      const updated = new Date(value);
      updated.setHours(hours, minutes);
      onChange(updated);
    };

    return (
      <View style={styles.dateRow}>
        <View style={[styles.dateBtn, { backgroundColor: colors.muted }]}>
          <Feather name="calendar" size={16} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.foreground }]}>{dateString}</Text>
          <input
            ref={dateInputRef}
            type="date"
            value={localDateStr}
            onChange={handleDateChange}
            style={webInputStyle}
          />
        </View>
        <View style={[styles.dateBtn, { backgroundColor: colors.muted }]}>
          <Feather name="clock" size={16} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.foreground }]}>{timeString}</Text>
          <input
            ref={timeInputRef}
            type="time"
            value={localTimeStr}
            onChange={handleTimeChange}
            style={webInputStyle}
          />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.dateRow}>
        <Pressable
          onPress={() => {
            setShowTimePicker(false);
            setShowDatePicker(true);
          }}
          style={[styles.dateBtn, { backgroundColor: colors.muted }]}
        >
          <Feather name="calendar" size={16} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.foreground }]}>{dateString}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setShowDatePicker(false);
            setShowTimePicker(true);
          }}
          style={[styles.dateBtn, { backgroundColor: colors.muted }]}
        >
          <Feather name="clock" size={16} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.foreground }]}>{timeString}</Text>
        </Pressable>
      </View>

      {(showDatePicker || showTimePicker) && (
        <DateTimePicker
          value={value}
          mode={showDatePicker ? "date" : "time"}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={showDatePicker ? new Date() : undefined}
          onChange={(_, date) => {
            setShowDatePicker(false);
            setShowTimePicker(false);
            if (date) onChange(date);
          }}
        />
      )}
    </>
  );
}

const webInputStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  opacity: 0,
  cursor: "pointer",
  width: "100%",
  height: "100%",
};

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  dateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
    overflow: "hidden",
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
