import { HOST, myPost } from '@/utils/fetch';
import { useCallback, useRef, useState } from 'react';
import { Button, InputFile } from 'sweet-me';

interface IProps {
  onClose: (src?: string) => void;
}

export const UploadAvatar = (props: IProps) => {
  const [url, setUrl] = useState('');
  const fileRef = useRef<File>();
  const { onClose } = props;

  const handleFileChange = useCallback((file) => {
    fileRef.current = file;

    if (!file) {
      setUrl('');
    } else {
      const fileURL = URL.createObjectURL(file);
      setUrl(fileURL);
    }
  }, []);

  const handleUpload = useCallback(() => {
    const formData = new FormData();

    formData.append('file', fileRef.current);
    formData.append('upload_key', 'dododawn');
    formData.append('file_name', fileRef.current.name);

    fetch(`${HOST}/upload/cdn?dodokey=123`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        onClose(res.imageUrl || '');
      });
  }, []);

  return (
    <div
      style={{
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <InputFile
        onValueChange={handleFileChange}
        accept='image/*'
        multiple={false}
      />
      {url && (
        <>
          <img
            style={{
              width: 120,
              height: 120,
              display: 'block',
              marginTop: 10,
              boxSizing: 'border-box',
              border: '2px solid #eee',
            }}
            src={url}
            alt='头像'
          />
          <Button style={{ marginTop: 10, width: 120 }} onClick={handleUpload}>
            上传
          </Button>
        </>
      )}
    </div>
  );
};
