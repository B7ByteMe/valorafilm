import {Platform} from 'react-native';
import RNApkInstaller from '@himanshu8443/react-native-apk-installer';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Checks whether the app has permission to install unknown apps (Android 8.0+ / API 26+)
 */
export const hasUnknownAppSourcesPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;
  try {
    const permission = (await RNApkInstaller.haveUnknownAppSourcesPermission()) as unknown;
    if (typeof permission === 'boolean') {
      return permission;
    }
    // API < 26 does not require MANAGE_UNKNOWN_APP_SOURCES per-app
    return typeof permission === 'number' && permission < 26;
  } catch (err) {
    console.warn('[apkInstaller] Error checking unknown app sources permission:', err);
    return false;
  }
};

/**
 * Opens Android system settings for this app to allow "Install Unknown Apps"
 */
export const requestUnknownAppSourcesPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;
  try {
    const packageName = RNApkInstaller.packageName || 'com.valorafilm';
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.MANAGE_UNKNOWN_APP_SOURCES,
      {data: `package:${packageName}`},
    );
    return await hasUnknownAppSourcesPermission();
  } catch (err) {
    console.error('[apkInstaller] Error opening unknown app sources settings:', err);
    return false;
  }
};

/**
 * Launches the Android package installer directly for the downloaded APK file.
 */
export const installApkFile = async (apkPath: string): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;
  try {
    const fileUri = apkPath.startsWith('file://') ? apkPath : `file://${apkPath}`;
    const contentUri = await FileSystem.getContentUriAsync(fileUri);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags: 1, // Intent.FLAG_GRANT_READ_URI_PERMISSION
      type: 'application/vnd.android.package-archive',
    });
    return true;
  } catch (err) {
    console.error('[apkInstaller] Error launching APK installer:', err);
    throw err;
  }
};
