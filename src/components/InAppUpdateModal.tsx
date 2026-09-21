import React from 'react';
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Markdown from 'react-native-markdown-display';
import AppText from './ui/Text';
import {useM3Colors} from '../theme/M3PaletteContext';
import {useInAppUpdateStore} from '../lib/zustand/inAppUpdateStore';

const formatBytes = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const InAppUpdateModal = () => {
  const colors = useM3Colors();
  const {
    visible,
    status,
    updateInfo,
    bytesWritten,
    contentLength,
    progressPercent,
    errorMessage,
    startDownload,
    cancelDownload,
    triggerInstall,
    openPermissionSettings,
    dismiss,
  } = useInAppUpdateStore();

  if (!visible || !updateInfo) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        if (status === 'downloading') {
          cancelDownload();
        } else {
          dismiss();
        }
      }}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialogContainer,
            {backgroundColor: colors.surfaceContainerHigh || '#1e1e24'},
          ]}>
          {/* Header Icon & Title */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor:
                    status === 'error'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : status === 'completed'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(220, 38, 38, 0.15)',
                },
              ]}>
              <MaterialCommunityIcons
                name={
                  status === 'error'
                    ? 'alert-circle-outline'
                    : status === 'completed'
                    ? 'check-circle-outline'
                    : status === 'permission_required'
                    ? 'shield-alert-outline'
                    : status === 'downloading'
                    ? 'cloud-download-outline'
                    : 'rocket-launch-outline'
                }
                size={28}
                color={
                  status === 'error'
                    ? '#EF4444'
                    : status === 'completed'
                    ? '#22C55E'
                    : '#E50914'
                }
              />
            </View>

            <View style={styles.headerTextContainer}>
              <AppText role="titleMedium" style={[styles.title, {color: colors.onSurface}]}>
                {status === 'downloading'
                  ? 'Mengunduh Pembaruan'
                  : status === 'completed'
                  ? 'Unduhan Selesai'
                  : status === 'permission_required'
                  ? 'Izin Diperlukan'
                  : status === 'error'
                  ? 'Pembaruan Gagal'
                  : 'Versi Baru Tersedia'}
              </AppText>
              <View style={styles.versionBadge}>
                <AppText role="labelSmall" style={styles.versionBadgeText}>
                  v{updateInfo.currentVersion} ➔ {updateInfo.newVersion}
                </AppText>
              </View>
            </View>
          </View>

          {/* Body Content based on Status */}
          {status === 'available' && (
            <View style={styles.contentArea}>
              <AppText
                role="bodySmall"
                style={[styles.sectionLabel, {color: colors.onSurfaceVariant}]}>
                Catatan Rilis:
              </AppText>
              <ScrollView style={styles.changelogScroll} showsVerticalScrollIndicator={true}>
                {updateInfo.releaseNotes ? (
                  <Markdown
                    style={{
                      body: {color: colors.onSurfaceVariant, fontSize: 13, lineHeight: 19},
                      bullet_list: {marginVertical: 4},
                      heading2: {color: colors.onSurface, fontSize: 14, marginVertical: 4},
                    }}>
                    {updateInfo.releaseNotes}
                  </Markdown>
                ) : (
                  <AppText role="bodyMedium" style={{color: colors.onSurfaceVariant}}>
                    Peningkatan performa, pembaruan engine streaming, dan perbaikan bug.
                  </AppText>
                )}
              </ScrollView>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={dismiss}
                  style={({pressed}) => [
                    styles.button,
                    styles.secondaryButton,
                    {opacity: pressed ? 0.7 : 1},
                  ]}>
                  <AppText role="labelLarge" style={{color: colors.onSurfaceVariant}}>
                    Nanti
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={startDownload}
                  style={({pressed}) => [
                    styles.button,
                    styles.primaryButton,
                    {opacity: pressed ? 0.8 : 1},
                  ]}>
                  <MaterialCommunityIcons
                    name="download"
                    size={18}
                    color="#FFFFFF"
                    style={{marginRight: 6}}
                  />
                  <AppText role="labelLarge" style={styles.primaryButtonText}>
                    Update Sekarang
                  </AppText>
                </Pressable>
              </View>
            </View>
          )}

          {status === 'downloading' && (
            <View style={styles.contentArea}>
              <View style={styles.downloadInfoContainer}>
                <AppText role="bodySmall" style={{color: colors.onSurfaceVariant}}>
                  Mengunduh file paket APK langsung ke HP Anda...
                </AppText>

                {/* Live Progress Bar */}
                <View
                  style={[
                    styles.progressBarTrack,
                    {backgroundColor: colors.surfaceContainerHighest || 'rgba(255,255,255,0.1)'},
                  ]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.max(3, progressPercent)}%`,
                        backgroundColor: '#E50914',
                      },
                    ]}
                  />
                </View>

                {/* Live Metrics */}
                <View style={styles.metricsRow}>
                  <AppText role="labelMedium" style={{color: colors.onSurface, fontWeight: '700'}}>
                    {progressPercent}%
                  </AppText>
                  <AppText role="labelSmall" style={{color: colors.onSurfaceVariant}}>
                    {contentLength > 0
                      ? `${formatBytes(bytesWritten)} / ${formatBytes(contentLength)}`
                      : `${formatBytes(bytesWritten)} terunduh`}
                  </AppText>
                </View>
              </View>

              <View style={styles.actionsRowCenter}>
                <Pressable
                  onPress={cancelDownload}
                  style={({pressed}) => [
                    styles.button,
                    styles.secondaryButton,
                    {opacity: pressed ? 0.7 : 1, width: '100%'},
                  ]}>
                  <AppText role="labelLarge" style={{color: '#EF4444'}}>
                    Batalkan Unduhan
                  </AppText>
                </Pressable>
              </View>
            </View>
          )}

          {status === 'completed' && (
            <View style={styles.contentArea}>
              <AppText
                role="bodyMedium"
                style={{color: colors.onSurfaceVariant, marginBottom: 20, lineHeight: 22}}>
                Pembaruan berhasil diunduh. Jika jendela instalasi Android belum muncul otomatis,
                tekan tombol di bawah.
              </AppText>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={dismiss}
                  style={({pressed}) => [
                    styles.button,
                    styles.secondaryButton,
                    {opacity: pressed ? 0.7 : 1},
                  ]}>
                  <AppText role="labelLarge" style={{color: colors.onSurfaceVariant}}>
                    Tutup
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={triggerInstall}
                  style={({pressed}) => [
                    styles.button,
                    styles.primaryButton,
                    {opacity: pressed ? 0.8 : 1},
                  ]}>
                  <MaterialCommunityIcons
                    name="package-down"
                    size={18}
                    color="#FFFFFF"
                    style={{marginRight: 6}}
                  />
                  <AppText role="labelLarge" style={styles.primaryButtonText}>
                    Pasang Sekarang
                  </AppText>
                </Pressable>
              </View>
            </View>
          )}

          {status === 'permission_required' && (
            <View style={styles.contentArea}>
              <AppText
                role="bodyMedium"
                style={{color: colors.onSurfaceVariant, marginBottom: 20, lineHeight: 22}}>
                Untuk memasang pembaruan secara langsung, aktifkan opsi{' '}
                <AppText role="bodyMedium" style={{fontWeight: 'bold', color: colors.onSurface}}>
                  "Izinkan dari sumber ini"
                </AppText>{' '}
                pada pengaturan sistem Android.
              </AppText>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={dismiss}
                  style={({pressed}) => [
                    styles.button,
                    styles.secondaryButton,
                    {opacity: pressed ? 0.7 : 1},
                  ]}>
                  <AppText role="labelLarge" style={{color: colors.onSurfaceVariant}}>
                    Batal
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={openPermissionSettings}
                  style={({pressed}) => [
                    styles.button,
                    styles.primaryButton,
                    {opacity: pressed ? 0.8 : 1},
                  ]}>
                  <MaterialCommunityIcons
                    name="cog"
                    size={18}
                    color="#FFFFFF"
                    style={{marginRight: 6}}
                  />
                  <AppText role="labelLarge" style={styles.primaryButtonText}>
                    Buka Pengaturan
                  </AppText>
                </Pressable>
              </View>
            </View>
          )}

          {status === 'error' && (
            <View style={styles.contentArea}>
              <AppText
                role="bodyMedium"
                style={{color: '#EF4444', marginBottom: 20, lineHeight: 20}}>
                {errorMessage || 'Terjadi kesalahan saat mengunduh pembaruan.'}
              </AppText>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={dismiss}
                  style={({pressed}) => [
                    styles.button,
                    styles.secondaryButton,
                    {opacity: pressed ? 0.7 : 1},
                  ]}>
                  <AppText role="labelLarge" style={{color: colors.onSurfaceVariant}}>
                    Tutup
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={startDownload}
                  style={({pressed}) => [
                    styles.button,
                    styles.primaryButton,
                    {opacity: pressed ? 0.8 : 1},
                  ]}>
                  <MaterialCommunityIcons
                    name="reload"
                    size={18}
                    color="#FFFFFF"
                    style={{marginRight: 6}}
                  />
                  <AppText role="labelLarge" style={styles.primaryButtonText}>
                    Coba Lagi
                  </AppText>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  versionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  versionBadgeText: {
    color: '#E50914',
    fontWeight: '700',
    fontSize: 12,
  },
  contentArea: {
    marginTop: 4,
  },
  sectionLabel: {
    marginBottom: 6,
    fontWeight: '600',
  },
  changelogScroll: {
    maxHeight: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  downloadInfoContainer: {
    marginVertical: 12,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  actionsRowCenter: {
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#E50914',
    marginLeft: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default InAppUpdateModal;
