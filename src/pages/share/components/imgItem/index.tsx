import React, { useCallback, useContext, useEffect, useState } from 'react';
import styles from './index.module.less';
import { ImgT, PageContext } from '../../constants';
import { downloadFile, getBlob } from '../../utils';
import { ICON, Icon, toast } from 'sweet-me';
import { socket } from '../../socket';
import clsx from 'clsx';

interface IProps {
  imgInfo: ImgT;
  className?: string;
}

export const ImgItem = (props: IProps) => {
  const { imgInfo, className } = props;
  const { fileMap } = useContext(PageContext);
  const { fileID, fileName } = imgInfo || {};
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File>();
  const loading = !url || !file;

  const handleCopyImage = async () => {
    if (loading) {
      toast('加载中，请稍后...');
      return;
    }

    // safari 需要通过传入 promise 实现，不可先获取结果
    const getImgBold = async (): Promise<Blob> => {
      return file.type === 'image/png' ? file : await getBlob(url);
    };

    navigator.clipboard
      .write([new ClipboardItem({ 'image/png': getImgBold() })])
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
    socket.emit('fileContent', fileID);
  }, [fileID]);

  useEffect(() => {
    if (fileMap.has(fileID)) {
      const blob = fileMap.get(fileID);
      const file = new File([blob], fileName, { type: blob.type });
      const fileUrl = URL.createObjectURL(file);
      setFile(file);
      setUrl(fileUrl);
    }
  }, [fileMap, fileName, fileID]);

  return (
    <div className={clsx(styles.imgItem, className)}>
      <img src={url} alt={fileName} onClick={handleCopyImage} />
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
};
