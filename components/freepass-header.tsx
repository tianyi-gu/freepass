import { DrawerActions } from '@react-navigation/native';
import { router, useNavigation } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

type FreepassHeaderProps = {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showMenu?: boolean;
  rightElement?: React.ReactNode;
  onBack?: () => void;
};

export function FreepassHeader({
  title,
  showBack = false,
  showLogo = true,
  showMenu = false,
  rightElement,
  onBack,
}: FreepassHeaderProps) {
  const navigation = useNavigation();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showMenu && (
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.menuButton}
            hitSlop={8}>
            <IconSymbol name="line.3.horizontal" size={24} color={FreepassColors.white} />
          </Pressable>
        )}
        {showBack && !showMenu && (
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
            <IconSymbol name="chevron.left" size={20} color={FreepassColors.white} />
          </Pressable>
        )}
      </View>
      <View style={styles.titleContainer}>
        {showLogo && !title ? <FreepassLogo size={28} /> : null}
        {title ? <Text style={styles.titleText}>{title}</Text> : null}
      </View>
      <View style={styles.right}>{rightElement}</View>
    </View>
  );
}

export function FreepassHeaderWithTitle({
  title,
  showBack = false,
  rightElement,
  onBack,
}: FreepassHeaderProps) {
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.headerBar}>
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={handleBack} style={styles.backButtonAlt} hitSlop={8}>
            <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          </Pressable>
        )}
      </View>
      <View style={styles.titleCenter}>
        <FreepassLogo size={24} />
      </View>
      <View style={styles.right}>{rightElement}</View>
    </View>
  );
}

export function FreepassHeaderSimple({
  title,
  showBack = false,
  rightElement,
  onBack,
}: FreepassHeaderProps) {
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.headerBar}>
      {showBack && (
        <Pressable onPress={handleBack} style={styles.backText} hitSlop={8}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
        </Pressable>
      )}
      <View style={styles.flex} />
      {rightElement}
    </View>
  );
}

export function FreepassLogo({ size = 32 }: { size?: number }) {
  return (
    <View style={[styles.logo, { height: size }]}>
      <Text style={[styles.logoText, { fontSize: size * 0.6 }]}>
        <Text style={{ color: '#F4D03F' }}>f</Text>
        <Text style={{ color: FreepassColors.accent }}>p</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  left: { flexDirection: 'row', alignItems: 'center', minWidth: 60 },
  right: { flexDirection: 'row', alignItems: 'center', minWidth: 60 },
  titleContainer: { flex: 1, alignItems: 'center' },
  titleCenter: { flex: 1, alignItems: 'center' },
  menuButton: {
    padding: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: FreepassColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonAlt: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  titleText: {
    color: FreepassColors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
