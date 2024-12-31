import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as styles from './index.module.less';
import { convertFileSize, ICON, Icon, Image, toast } from 'sweet-me';
import clsx from 'clsx';
import { copyImgToClipboard } from '@/utils/text';
import { downloadFile, FileT, getFileFromUrl, ImgT } from '../../..';
import { ChatContext } from '@/components/chatSDK/context';

interface IProps {
  info: FileT | ImgT;
  className?: string;
  enableCopy?: boolean;
  enableDownload?: boolean;
}

export const FileItem = (props: IProps) => {
  const { info, className, enableCopy, enableDownload } = props;
  const { fileMap, progressMap, getFileInfo } = useContext(ChatContext);
  const { fileID, fileName, type, url: sourceUrl } = info || {};
  const [url, setUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [file, setFile] = useState<File>();
  const [imgReady, setImgReady] = useState(type !== 'img');
  const loading = !url || !file || !imgReady;
  const { progress = 0, total = 0 } = progressMap.get(fileID) || {};
  const fileSize = convertFileSize(total);
  const imgRef = useRef(null);
  const handleCopyImage = async () => {
    if (loading) {
      toast('加载中，请稍后...');
      return;
    }

    copyImgToClipboard(file, imgRef.current)
      .then(function () {
        toast('图片已复制到剪贴板');
      })
      .catch(function (error) {
        toast('复制失败');
        console.error('Failed to copy image data:', error);
      });
  };

  const handleDownloadFile = useCallback(() => {
    if (loading) {
      toast('加载中，请稍后...');
      return;
    }

    downloadFile(downloadUrl, fileName);
  }, [fileName, loading, downloadUrl]);

  useEffect(() => {
    if (!loading || sourceUrl) return;
    getFileInfo(fileID);
  }, [fileID, getFileInfo, sourceUrl, loading]);

  useEffect(() => {
    if (sourceUrl) {
      setUrl(sourceUrl);

      if (type === 'img') {
        const image = new window.Image();
        image.onload = () => {
          setImgReady(true);
        };
        image.src = sourceUrl;

        getFileFromUrl(sourceUrl, fileName).then((file) => {
          setFile(file);
        });
      }
    }
  }, [type, sourceUrl, fileName]);

  useEffect(() => {
    if (!sourceUrl && fileMap.has(fileID)) {
      const blob = fileMap.get(fileID);
      const file = new File([blob], fileName, { type: blob.type });
      const fileUrl = URL.createObjectURL(file);
      setFile(file);
      setUrl(fileUrl);

      if (type === 'img') {
        const image = new window.Image();
        image.onload = () => {
          setImgReady(true);
        };
        image.src = fileUrl;
      }
    }
  }, [fileMap, fileName, fileID, type, sourceUrl]);

  useEffect(() => {
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setDownloadUrl(fileUrl);
    }
  }, [file]);

  if (type === 'img') {
    return (
      <div className={clsx(styles.imgItem, className)}>
        {loading ? (
          <div className={styles.loadingHolder}>
            {`加载中...(${progress}%)\n约 ${fileSize}`}
          </div>
        ) : (
          <Image imgRef={imgRef} src={url} alt={fileName} />
        )}
        {(enableCopy || !enableDownload) && (
          <Icon
            className={styles.copyIcon}
            type={ICON.copy}
            title='复制'
            onClick={handleCopyImage}
          />
        )}
        {!enableDownload && (
          <Icon
            className={styles.saveIcon}
            type={ICON.download}
            title='下载'
            onClick={handleDownloadFile}
          />
        )}
      </div>
    );
  }

  return (
    <div className={clsx(styles.fileItem, className)}>
      <Icon className={styles.fileIcon} type={ICON.file} size={40} />
      {loading ? `加载中...(${progress}% 约 ${fileSize})` : fileName}
      {enableDownload && (
        <Icon
          className={styles.saveIcon}
          type={ICON.download}
          title='下载'
          onClick={handleDownloadFile}
        />
      )}
    </div>
  );
};
