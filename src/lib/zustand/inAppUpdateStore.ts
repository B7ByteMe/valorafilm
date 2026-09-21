import {create} from 'zustand';
import * as RNFS from '@dr.pogodin/react-native-fs';
import notificationService from '../services/Notification';
import {
  hasUnknownAppSourcesPermission,
  installApkFile,
  requestUnknownAppSourcesPermission,
} from '../services/apkInstaller';
import {ToastAndroid} from 'react-native';

export type UpdateModalStatus =
  | 'available'
  | 'downloading'
  | 'completed'
  | 'permission_required'
  | 'error';

export interface UpdateReleaseInfo {
  currentVersion: string;
  newVersion: string;
  releaseNotes: string;
  apkUrl: string;
  apkName: string;
}

interface InAppUpdateState {
  visible: boolean;
  status: UpdateModalStatus;
  updateInfo: UpdateReleaseInfo | null;
  bytesWritten: number;
  contentLength: number;
  progressPercent: number;
  downloadJobId: number | null;
  downloadedFilePath: string | null;
  errorMessage: string | null;

  promptUpdate: (info: UpdateReleaseInfo) => void;
  startDownload: () => Promise<void>;
  cancelDownload: () => Promise<void>;
  triggerInstall: () => Promise<void>;
  openPermissionSettings: () => Promise<void>;
  dismiss: () => void;
}

const deletePartialFile = async (filePath: string) => {
  try {
    if (await RNFS.exists(filePath)) {
      await RNFS.unlink(filePath);
    }
  } catch {}
};

export const useInAppUpdateStore = create<InAppUpdateState>((set, get) => ({
  visible: false,
  status: 'available',
  updateInfo: null,
  bytesWritten: 0,
  contentLength: 0,
  progressPercent: 0,
  downloadJobId: null,
  downloadedFilePath: null,
  errorMessage: null,

  promptUpdate: (info: UpdateReleaseInfo) => {
    set({
      visible: true,
      status: 'available',
      updateInfo: info,
      bytesWritten: 0,
      contentLength: 0,
      progressPercent: 0,
      downloadJobId: null,
      downloadedFilePath: null,
      errorMessage: null,
    });
  },

  startDownload: async () => {
    const {updateInfo} = get();
    if (!updateInfo || !updateInfo.apkUrl) {
      set({status: 'error', errorMessage: 'Link unduhan tidak valid.'});
      return;
    }

    try {
      await notificationService.requestPermission();
    } catch {}

    const sanitizedName = updateInfo.apkName.endsWith('.apk')
      ? updateInfo.apkName
      : `ValoraFilm-${updateInfo.newVersion}.apk`;
    const filePath = `${RNFS.CachesDirectoryPath}/${sanitizedName}`;

    // Clean up if a previous file exists
    await deletePartialFile(filePath);

    set({
      status: 'downloading',
      bytesWritten: 0,
      contentLength: 0,
      progressPercent: 0,
      errorMessage: null,
    });

    let expectedSize = 0;

    const downloadResult = RNFS.downloadFile({
      fromUrl: updateInfo.apkUrl,
      toFile: filePath,
      background: true,
      progressInterval: 250,
      progressDivider: 1,
      begin: res => {
        expectedSize = res.contentLength;
        set({contentLength: res.contentLength, downloadJobId: res.jobId});
      },
      progress: res => {
        const percent =
          res.contentLength > 0
            ? Math.min(100, Math.round((res.bytesWritten / res.contentLength) * 100))
            : 0;
        set({
          bytesWritten: res.bytesWritten,
          contentLength: res.contentLength,
          progressPercent: percent,
        });

        notificationService.showUpdateProgress(
          'Mengunduh Pembaruan',
          `Versi ${updateInfo.currentVersion} -> ${updateInfo.newVersion} (${percent}%)`,
          {
            current: res.bytesWritten,
            max: res.contentLength,
            indeterminate: res.contentLength <= 0,
          },
        );
      },
    });

    set({downloadJobId: downloadResult.jobId});

    try {
      const res = await downloadResult.promise;
      await notificationService.cancelNotification('updateProgress');

      if (res.statusCode !== 200 || (expectedSize > 0 && res.bytesWritten < expectedSize)) {
        await deletePartialFile(filePath);
        set({
          status: 'error',
          errorMessage: 'Unduhan gagal atau tidak lengkap. Silakan coba lagi.',
          downloadJobId: null,
        });
        return;
      }

      set({
        status: 'completed',
        progressPercent: 100,
        downloadedFilePath: filePath,
        downloadJobId: null,
      });

      // Show completion notification as fallback
      await notificationService.displayUpdateNotification({
        id: 'downloadComplete',
        title: 'Unduhan Selesai',
        body: 'Ketuk untuk memasang pembaruan',
        data: {filePath, action: 'install'},
      });

      // Automatically launch the APK installer!
      await get().triggerInstall();
    } catch (err: any) {
      console.error('[inAppUpdateStore] Download error:', err);
      await notificationService.cancelNotification('updateProgress');
      await deletePartialFile(filePath);
      set({
        status: 'error',
        errorMessage: err?.message || 'Terjadi kesalahan saat mengunduh pembaruan.',
        downloadJobId: null,
      });
    }
  },

  cancelDownload: async () => {
    const {downloadJobId, downloadedFilePath, updateInfo} = get();
    if (downloadJobId !== null) {
      try {
        RNFS.stopDownload(downloadJobId);
      } catch {}
    }
    await notificationService.cancelNotification('updateProgress');

    const fileName = updateInfo?.apkName || 'update.apk';
    const fallbackPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    await deletePartialFile(downloadedFilePath || fallbackPath);

    set({
      visible: false,
      status: 'available',
      downloadJobId: null,
      bytesWritten: 0,
      contentLength: 0,
      progressPercent: 0,
    });
    ToastAndroid.show('Unduhan dibatalkan', ToastAndroid.SHORT);
  },

  triggerInstall: async () => {
    const {downloadedFilePath} = get();
    if (!downloadedFilePath) return;

    try {
      const hasPermission = await hasUnknownAppSourcesPermission();
      if (!hasPermission) {
        set({status: 'permission_required'});
        const granted = await requestUnknownAppSourcesPermission();
        if (!granted) {
          ToastAndroid.show(
            'Izinkan penginstalan aplikasi dari sumber ini untuk melanjutkan',
            ToastAndroid.LONG,
          );
          return;
        }
      }

      await installApkFile(downloadedFilePath);
    } catch (err: any) {
      console.error('[inAppUpdateStore] Install error:', err);
      set({
        status: 'error',
        errorMessage: 'Gagal membuka penginstal APK. Silakan periksa izin perangkat Anda.',
      });
    }
  },

  openPermissionSettings: async () => {
    const granted = await requestUnknownAppSourcesPermission();
    if (granted) {
      set({status: 'completed'});
      await get().triggerInstall();
    }
  },

  dismiss: () => {
    const {status} = get();
    if (status === 'downloading') {
      // Don't accidentally dismiss while downloading without prompt
      return;
    }
    set({visible: false});
  },
}));
