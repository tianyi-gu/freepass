import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function StreetViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        <View style={styles.tealBorder}>
          <IconSymbol name="map.fill" size={64} color={FreepassColors.lightGray} />
          <Text style={styles.placeholderText}>360° Street View</Text>
          <Text style={styles.placeholderSub}>Embedded view will appear here</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
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
  content: {
    flex: 1,
    padding: 16,
  },
  tealBorder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FreepassColors.white,
    borderWidth: 3,
    borderColor: '#2dd4bf',
    borderRadius: 12,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: FreepassColors.textSecondary,
  },
  placeholderSub: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
  },
});
