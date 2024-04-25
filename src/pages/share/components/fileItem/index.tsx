import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as styles from './index.module.less';
import { FileT, ImgT, PageContext } from '../../constants';
import { convertFileSize, downloadFile, getBlob } from '../../utils';
import { ICON, Icon, Image, toast } from 'sweet-me';
import { socket } from '../../socket';
import clsx from 'clsx';
import { copyImgToClipboard } from '@/utils/text';

interface IProps {
  fileInfo: FileT | ImgT;
  className?: string;
}

export const FileItem = (props: IProps) => {
  const { fileInfo, className } = props;
  const { fileMap, progressMap, socketID } = useContext(PageContext);
  const { fileID, fileName, type } = fileInfo || {};
  const [url, setUrl] = useState('');
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

    // safari 需要通过传入 promise 实现，不可先获取结果
    const getImgBold = async (): Promise<Blob> => {
      return file.type === 'image/png' ? file : await getBlob(url);
    };

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

    downloadFile(url, fileName);
  }, [fileName, loading, url]);

  useEffect(() => {
    if (!loading) return;

    socket.emit('fileContent', fileID, 0);
  }, [fileID, loading, socketID]);

  useEffect(() => {
    if (fileMap.has(fileID)) {
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
  }, [fileMap, fileName, fileID, type]);

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
        <Icon
          className={styles.copyIcon}
          type={ICON.copy}
          title='复制'
          onClick={handleCopyImage}
        />
        <Icon
          className={styles.saveIcon}
          type={ICON.download}
          title='下载'
          onClick={handleDownloadFile}
        />
      </div>
    );
  }

  return (
    <div className={clsx(styles.fileItem, className)}>
      <Icon className={styles.fileIcon} type={ICON.file} size={40} />
      {loading ? `加载中...(${progress}% 约 ${fileSize})` : fileName}
      <Icon
        className={styles.saveIcon}
        type={ICON.download}
        title='下载'
        onClick={handleDownloadFile}
      />
    </div>
  );
};
