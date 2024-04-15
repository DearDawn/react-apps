import { useCallback, useContext, useEffect, useState } from 'react';
import styles from './index.module.less';
import { FileT, ImgT, PageContext } from '../../constants';
import { downloadFile } from '../../utils';
import { ICON, Icon, toast } from 'sweet-me';
import { socket } from '../../socket';
import clsx from 'clsx';

interface IProps {
  fileInfo: FileT;
  className?: string;
}

export const FileItem = (props: IProps) => {
  const { fileInfo, className } = props;
  const { fileMap } = useContext(PageContext);
  const { fileID, fileName } = fileInfo || {};
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File>();
  const loading = !url || !file;

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
    <div className={clsx(styles.fileItem, className)}>
      <Icon className={styles.fileIcon} type={ICON.file} size={40} />
      {fileName}
      <Icon
        className={styles.saveIcon}
        type={ICON.download}
        title='下载'
        onClick={handleDownloadFile}
      />
    </div>
  );
};
