import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
  Linking,
  ToastAndroid,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppText from '../../components/ui/Text';
import AmbientBackground from '../../components/ui/AmbientBackground';
import {useM3Colors} from '../../theme/M3PaletteContext';

const InfoRow = ({label, value}: {label: string; value: string}) => {
  const colors = useM3Colors();
  return (
    <View style={styles.infoRow}>
      <AppText style={[styles.infoLabel, {color: colors.onSurfaceVariant}]}>
        {label}
      </AppText>
      <AppText style={[styles.infoValue, {color: colors.onSurface}]}>
        {value}
      </AppText>
    </View>
  );
};

const LinkRow = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => {
  const colors = useM3Colors();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.linkRow}>
      <View style={styles.linkLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.primaryContainer,
              borderColor: `${colors.primary}40`,
            },
          ]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <AppText style={[styles.linkLabel, {color: colors.onSurface}]}>
          {label}
        </AppText>
      </View>
      <Ionicons name="arrow-forward" size={18} color={colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
};

const Divider = () => {
  const colors = useM3Colors();
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colors.outlineVariant
            ? `${colors.outlineVariant}50`
            : 'rgba(255,255,255,0.08)',
        },
      ]}
    />
  );
};

const About = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useM3Colors();
  const [logoTapCount, setLogoTapCount] = useState(0);

  const appVersion =
    Application.nativeApplicationVersion ||
    Constants.expoConfig?.version ||
    '1.0.0';
  const packageName =
    Application.applicationId ||
    Constants.expoConfig?.android?.package ||
    'com.valorafilm';
  const buildType = __DEV__ ? 'Debug' : 'Release';

  const handleLogoTap = () => {
    const next = logoTapCount + 1;
    setLogoTapCount(next);
    if (next >= 7) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Built with ❤️ by Valora Team', ToastAndroid.SHORT);
      }
      setLogoTapCount(0);
    }
  };

  return (
    <AmbientBackground>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Top App Bar */}
        <View
          style={[
            styles.header,
            {
              paddingTop:
                Platform.OS === 'android'
                  ? (StatusBar.currentHeight || 20) + 10
                  : insets.top + 10,
            },
          ]}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={({pressed}) => [
              styles.backButton,
              {opacity: pressed ? 0.6 : 1},
            ]}>
            <Ionicons name="arrow-back" size={26} color={colors.onSurface} />
          </Pressable>
          <AppText style={[styles.headerTitle, {color: colors.onSurface}]}>
            About
          </AppText>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* App Hero Section */}
          <View style={styles.heroSection}>
            <Pressable
              onPress={handleLogoTap}
              style={[
                styles.logoWrapper,
                {
                  backgroundColor: colors.surfaceContainer,
                  borderColor: `${colors.primary}35`,
                },
              ]}>
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Pressable>

            <AppText style={[styles.appName, {color: colors.onSurface}]}>
              Valora Film
            </AppText>
            <AppText
              style={[styles.appTagline, {color: colors.onSurfaceVariant}]}>
              Advanced Media Streaming Client
            </AppText>

            <View
              style={[
                styles.versionBadge,
                {
                  backgroundColor: colors.primaryContainer,
                  borderColor: `${colors.primary}60`,
                },
              ]}>
              <AppText
                style={[styles.versionBadgeText, {color: colors.primary}]}>
                v{appVersion}
              </AppText>
            </View>
          </View>

          {/* Info Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceContainer,
                borderColor: `${colors.outlineVariant}60`,
              },
            ]}>
            <InfoRow label="Developer" value="Valora · Zyxone" />
            <Divider />
            <InfoRow label="Version" value={appVersion} />
            <Divider />
            <InfoRow label="Build" value={buildType} />
            <Divider />
            <InfoRow label="Package" value={packageName} />
          </View>

          {/* Section Label: LINKS */}
          <AppText style={[styles.sectionHeader, {color: colors.primary}]}>
            LINKS
          </AppText>

          {/* Links Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceContainer,
                borderColor: `${colors.outlineVariant}60`,
              },
            ]}>
            <LinkRow
              icon="globe-outline"
              label="Website"
              onPress={() => Linking.openURL('https://valorafilm.pages.dev')}
            />
            <Divider />
            <LinkRow
              icon="paper-plane-outline"
              label="Telegram"
              onPress={() => Linking.openURL('https://t.me/riz_BuyX')}
            />
            <Divider />
            <LinkRow
              icon="logo-instagram"
              label="Instagram"
              onPress={() =>
                Linking.openURL('https://www.instagram.com/official.valora.group')
              }
            />
            <Divider />
            <LinkRow
              icon="heart-outline"
              label="Donasi (Saweria)"
              onPress={() => Linking.openURL('https://saweria.co/valoranime')}
            />
          </View>

          <View style={{height: 40}} />
        </ScrollView>
      </View>
    </AmbientBackground>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoWrapper: {
    width: 104,
    height: 104,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  appTagline: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  versionBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 14,
  },
  versionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
