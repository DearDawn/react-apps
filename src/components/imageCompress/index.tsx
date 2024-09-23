import {
  Button,
  compressImage,
  convertFileSize,
  Image,
  Slider,
  Space,
  Switch,
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
  const defaultScale = 50;
  const defaultQuality = 50;
  const [scale, setScale] = useState(defaultScale);
  const [quality, setQuality] = useState(defaultQuality);
  const [keepOpacity, setKeepOpacity] = useState(false);
  const timer = useRef(null);

  const compress = useCallback(
    (scaleRatio, qualityRatio) => {
      startLoading();
      timer.current = setTimeout(() => {
        compressImage({
          imgUrl: initUrl,
          outputFileName: imgFile.name || imgUrl,
          scaleRatio: scaleRatio / 100,
          quality: keepOpacity ? 1 : qualityRatio / 100,
          targetType: keepOpacity ? 'png' : 'jpeg',
        })
          .then((res) => {
            setResUrl(res.url);
            setResFile(res.file || imgFile);
          })
          .finally(endLoading);
      }, 500);
    },
    [endLoading, imgFile, imgUrl, initUrl, keepOpacity, startLoading]
  );

  const handleQualityChange = useCallback((value) => {
    setQuality(value);
  }, []);

  const handleScaleChange = useCallback((value) => {
    setScale(value);
  }, []);

  const handleSwitchChange = useCallback((value) => {
    setKeepOpacity(value);
  }, []);

  const handleSubmit = useCallback(() => {
    onClose?.({ file: resFile, url: resUrl });
  }, [onClose, resFile, resUrl]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    compress(scale, quality);

    return () => {
      endLoading();
      clearTimeout(timer.current);
    };
  }, [compress, endLoading, quality, scale]);

  return (
    <div className={styles.card}>
      <Image className={styles.codeImg} src={resUrl} />
      <Space padding='10px'>
        <div>压缩比：{Number(resFile?.size / imgFile?.size).toFixed(2)}</div>
        <div>
          图片大小：{convertFileSize(resFile?.size || imgFile?.size || 0)}
        </div>
      </Space>
      <Space className={styles.sliderWrap} padding='10px'>
        压缩:
        {keepOpacity ? (
          <Slider
            className={styles.slider}
            min={100}
            max={100}
            step={1}
            defaultValue={100}
          />
        ) : (
          <Slider
            className={styles.slider}
            min={10}
            max={100}
            step={5}
            defaultValue={defaultQuality}
            onValueChange={handleQualityChange}
          />
        )}
      </Space>
      <Space className={styles.sliderWrap} padding='10px'>
        缩放:
        <Slider
          className={styles.slider}
          min={10}
          max={100}
          step={5}
          defaultValue={defaultScale}
          onValueChange={handleScaleChange}
        />
      </Space>
      <Space>
        保留透明度: <Switch onValueChange={handleSwitchChange} />
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
