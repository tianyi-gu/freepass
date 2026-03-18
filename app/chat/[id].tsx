import { DrawerActions } from '@react-navigation/native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [message, setMessage] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Full Name</Text>
          <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.profileBtn}>
            <IconSymbol name="person.fill" size={22} color={FreepassColors.white} />
          </Pressable>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerBtn}
            onPress={() => router.push('/modal/recent-messages' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="rectangle.grid.2x2.fill" size={14} color={FreepassColors.white} />
            <Text style={styles.headerBtnText}>VIEW CHANNELS</Text>
          </Pressable>
          <Pressable
            style={styles.headerBtn}
            onPress={() => router.replace('/(drawer)/account' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="person.fill" size={14} color={FreepassColors.white} />
            <Text style={styles.headerBtnText}>ACCOUNT</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No messages yet</Text>
          <Text style={styles.placeholderSub}>Start the conversation by typing below</Text>
        </View>
      </ScrollView>
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Enter message..."
          placeholderTextColor={FreepassColors.textSecondary}
          value={message}
          onChangeText={setMessage}
        />
        <Pressable style={styles.sendBtn} android_ripple={{ color: FreepassColors.accent }}>
          <IconSymbol name="paperplane.fill" size={24} color={FreepassColors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { flex: 1, padding: 20, justifyContent: 'center' },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: FreepassColors.textSecondary,
  },
  placeholderSub: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginTop: 4,
  },
  headerBar: {
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
    textAlign: 'center',
  },
  profileBtn: { padding: 4 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: FreepassColors.primaryDark,
    borderRadius: 8,
  },
  headerBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: FreepassColors.lightGray,
    backgroundColor: FreepassColors.offWhite,
  },
  input: {
    flex: 1,
    backgroundColor: FreepassColors.white,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: FreepassColors.text,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FreepassColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
