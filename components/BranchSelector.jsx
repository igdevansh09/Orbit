import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";

const BRANCHES = [
  "CSAI",
  "CSE",
  "CSDS",
  "IT",
  "ITNS",
  "MAC",
  "ECE",
  "EVDT",
  "EIOT",
  "EE",
  "ICE",
  "ME",
  "BT",
  "CSDA",
  "CIOT",
  "ECAM",
  "MEEV",
  "CE",
  "GI",
];

export default function BranchSelector({ value, onChange }) {
  const [isVisible, setIsVisible] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selector,
          { backgroundColor: theme.inputBackground, borderColor: theme.border },
        ]}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        <Text
          style={{
            color: value ? theme.textDark : theme.placeholderText,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {value || "Select Branch"}
        </Text>
        <Ionicons name="chevron-down" size={22} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal visible={isVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}
            >
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Select Your Branch
              </Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close-circle"
                  size={26}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={BRANCHES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.branchItem,
                      { borderBottomColor: theme.border },
                      isSelected && { backgroundColor: theme.cardBackground },
                    ]}
                    onPress={() => {
                      onChange(item);
                      setIsVisible(false);
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? theme.primary : theme.textPrimary,
                        fontWeight: isSelected ? "800" : "500",
                        fontSize: 16,
                      }}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64, // Matched with auth inputs
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Softer overlay
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "65%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  branchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
