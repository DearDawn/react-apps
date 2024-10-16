import { HOST, myFetch } from '@/utils/fetch';
import { compressImage } from '@/utils/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Image, InputImage, loading, toast } from 'sweet-me';
import * as styles from './index.module.less';

interface IProps {
  onClose: (src?: string) => void;
  onSelect: (item: ConfigItem) => void;
}

type ConfigItem = {
  id: number;
  avatar: string;
};

export const UploadImage = (props: IProps) => {
  const [url, setUrl] = useState('');
  const [historyList, setHistoryList] = useState<ConfigItem[]>([]);
  const fileRef = useRef<File>();
  const { onClose, onSelect } = props;

  useEffect(() => {
    const close = loading('加载中', 30000, false, 300);

    myFetch('/pet/config_list')
      .then((res: { data: ConfigItem[] }) => {
        setHistoryList(res.data);
      })
      .catch(() => toast('网络错误'))
      .finally(close);
  }, []);

  const handleFileChange = useCallback((file) => {
    fileRef.current = file;

    if (!file) {
      setUrl('');
    } else {
      compressImage({
        file: fileRef.current,
        outputFileName: fileRef.current.name,
        quality: 0.1,
        callback: function (compressedFile) {
          fileRef.current = compressedFile;
          const fileURL = URL.createObjectURL(fileRef.current);
          setUrl(fileURL);
        },
      });
    }
  }, []);

  const handleChangeAvatar = useCallback(
    (it: ConfigItem) => () => {
      onSelect(it);
    },
    []
  );

  const handleUpload = useCallback(() => {
    const formData = new FormData();

    formData.append('file', fileRef.current);
    formData.append('upload_key', 'dododawn');
    formData.append('file_name', fileRef.current.name);

    const close = loading('上传中', undefined, false, 300);
    fetch(`${HOST}/upload/cdn?dodokey=123`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        onClose(res.imageUrl || '');
        close();
      })
      .catch(() => {
        close();
        onClose(url || '');
      });
  }, [url]);

  return (
    <div className={styles.uploadWrap}>
      <div className={styles.listTitle}>点击头像或新增</div>
      <div className={styles.avatarList}>
        {historyList.map((it) => (
          <Image
            className={styles.avatar}
            src={it.avatar}
            lazyLoad={false}
            onClick={handleChangeAvatar(it)}
            draggable={false}
            withPreview={false}
          />
        ))}
      </div>
      <InputImage onValueChange={handleFileChange} />
      {url && (
        <Button className={styles.submit} onClick={handleUpload}>
          上传
        </Button>
      )}
    </div>
  );
};
