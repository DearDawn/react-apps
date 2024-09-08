import {
  Button,
  compressImage,
  convertFileSize,
  Image,
  Slider,
  Space,
  useBoolean,
} from 'sweet-me';
import * as styles from './index.module.less';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

export const ImageCompress: FC<
  {
    onClose?: (data?: { file: File; url: string }) => void;
  } & ({ imgUrl: string; imgFile?: File } | { imgUrl?: string; imgFile: File })
> = (props) => {
  const { onClose, imgFile, imgUrl } = props || {};
  const [initUrl] = useState(imgUrl || URL.createObjectURL(imgFile));
  const [resUrl, setResUrl] = useState(initUrl);
  const [resFile, setResFile] = useState(imgFile);
  const [loading, startLoading, endLoading] = useBoolean(false);
  const timer = useRef(null);
  const defaultValue = 50;

  const handleQualityChange = useCallback(
    (value) => {
      clearTimeout(timer.current);
      endLoading();

      timer.current = setTimeout(() => {
        startLoading();
        compressImage({
          imgUrl: initUrl,
          outputFileName: imgFile.name || imgUrl,
          scaleRatio: value / 100,
        })
          .then((res) => {
            setResUrl(res.url);
            setResFile(res.file || imgFile);
          })
          .finally(endLoading);
      }, 300);
    },
    [endLoading, imgFile, imgUrl, initUrl, startLoading]
  );

  const handleSubmit = useCallback(() => {
    onClose?.({ file: resFile, url: resUrl });
  }, [onClose, resFile, resUrl]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    handleQualityChange(defaultValue);
  }, [handleQualityChange]);

  return (
    <div className={styles.card}>
      <Image className={styles.codeImg} src={resUrl} />
      <Space className={styles.imgInfo} padding='10px'>
        <div>
          图片大小：{convertFileSize(resFile?.size || imgFile?.size || 0)}
        </div>
        <div>压缩比：{Number(resFile?.size / imgFile?.size).toFixed(2)}</div>
      </Space>
      <Space className={styles.sliderWrap} padding='10px'>
        <Slider
          className={styles.slider}
          min={10}
          max={100}
          step={5}
          defaultValue={defaultValue}
          onValueChange={handleQualityChange}
        />
      </Space>
      <Space className={styles.sliderWrap} padding='10px 0 0' isColumn>
        <Button
          status='success'
          size='long'
          loading={loading}
          onClick={handleSubmit}
        >
          发送
        </Button>
        <Button size='long' onClick={handleClose}>
          关闭
        </Button>
      </Space>
    </div>
  );
};
