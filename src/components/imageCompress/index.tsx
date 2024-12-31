import {
  Button,
  compressImage,
  convertFileSize,
  Image,
  showModal,
  Slider,
  Space,
  Switch,
  toast,
  useBoolean,
} from 'sweet-me';
import * as styles from './index.module.less';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

export const ImageCompress: FC<
  {
    uploader?: (file: File) => Promise<string>;
    maxSize?: number;
    onClose?: (data?: { file: File; url: string }) => void;
  } & ({ imgUrl: string; imgFile?: File } | { imgUrl?: string; imgFile: File })
> = (props) => {
  const { onClose, imgFile, imgUrl, uploader, maxSize } = props || {};
  const [initUrl] = useState(imgUrl || URL.createObjectURL(imgFile));
  const isPngImg = imgFile?.type === 'image/png';
  const [resUrl, setResUrl] = useState(initUrl);
  const [resFile, setResFile] = useState(imgFile);
  const [size, setSize] = useState([0, 0]);
  const [loading, startLoading, endLoading] = useBoolean(false);
  const defaultScale = 70;
  const defaultQuality = isPngImg ? 100 : 70;
  const [scale, setScale] = useState(defaultScale);
  const [quality, setQuality] = useState(defaultQuality);
  const [noCompress, setNoCompress] = useState(false);
  const timer = useRef(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);

  const compress = useCallback(
    (scaleRatio = defaultScale, qualityRatio = defaultQuality) => {
      startLoading();
      timer.current = setTimeout(() => {
        compressImage({
          imgUrl: initUrl,
          outputFileName: imgFile.name || imgUrl,
          scaleRatio: scaleRatio / 100,
          quality: isPngImg ? 1 : qualityRatio / 100,
          targetType: isPngImg
            ? 'png'
            : (imgFile?.type?.slice(6) as any) || 'jpeg',
        })
          .then((res) => {
            setResUrl(res.url);
            setResFile(res.file || imgFile);
          })
          .finally(endLoading);
      }, 500);
    },
    [
      defaultQuality,
      endLoading,
      imgFile,
      imgUrl,
      initUrl,
      isPngImg,
      startLoading,
    ]
  );

  const handleQualityChange = useCallback((value) => {
    setQuality(value);
  }, []);

  const handleScaleChange = useCallback((value) => {
    setScale(value);
  }, []);

  const handleSwitchChange = useCallback(
    (value) => {
      setNoCompress(value);
      if (value) {
        setScale(100);
        setQuality(100);
      } else {
        setScale(defaultScale);
        setQuality(defaultQuality);
      }
    },
    [defaultQuality]
  );

  const handleSubmit = useCallback(async () => {
    if (maxSize && resFile.size >= maxSize) {
      toast(`文件过大，最大 ${convertFileSize(maxSize)}`);
      return;
    }

    if (uploader) {
      uploader(resFile).then((res) => {
        onClose?.({ file: resFile, url: res });
      });
    } else {
      onClose?.({ file: resFile, url: resUrl });
    }
  }, [maxSize, onClose, resFile, resUrl, uploader]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const onImageLoad = useCallback(() => {
    if (imageWrapRef.current) {
      const { clientWidth, clientHeight } = imageWrapRef.current;
      imageWrapRef.current.style.width = `${clientWidth}px`;
      imageWrapRef.current.style.height = `${clientHeight}px`;
    }
  }, []);

  useEffect(() => {
    compress(scale, quality);

    return () => {
      endLoading();
      clearTimeout(timer.current);
    };
  }, [compress, endLoading, quality, scale]);

  useEffect(() => {
    const img = new window.Image();

    img.src = URL.createObjectURL(resFile);
    img.onload = () => {
      URL.revokeObjectURL(img.src); // 释放内存
      setSize([img.width, img.height]);
    };
  }, [resFile, resUrl]);

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap} ref={imageWrapRef}>
        <Image className={styles.codeImg} src={resUrl} onLoad={onImageLoad} />
      </div>
      <Space padding='10px' className={styles.desc}>
        <div>压缩比: {Number(resFile?.size / imgFile?.size).toFixed(2)}</div>
        <div>{`尺寸: ${size[0]} x ${size[1]} `}</div>
        <div>
          {`大小: ${convertFileSize(resFile?.size || imgFile?.size || 0)}`}
        </div>
      </Space>

      <Space>
        原图: <Switch onValueChange={handleSwitchChange} checked={noCompress} />
      </Space>
      {!isPngImg && !noCompress && (
        <Space className={styles.sliderWrap} padding='10px'>
          质量:
          <Slider
            className={styles.slider}
            min={10}
            max={100}
            step={5}
            defaultValue={defaultQuality}
            onValueChange={handleQualityChange}
          />
        </Space>
      )}
      {!noCompress && (
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
      )}

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

export const showImageCompress = (props: {
  imgFile: File;
  maxSize?: number;
  uploader?: (file: File) => Promise<string>;
  onClose?: (data?: { file: File; url: string }) => void | Promise<void>;
  modalProps?: Parameters<typeof showModal>[1];
}) => {
  const {
    onClose: _onClose,
    uploader,
    maxSize,
    imgFile,
    modalProps,
  } = props || {};

  return showModal(
    ({ onClose }) => (
      <ImageCompress
        imgFile={imgFile}
        uploader={uploader}
        maxSize={maxSize}
        onClose={async (res) => {
          await _onClose(res);
          onClose();
        }}
      />
    ),
    {
      maskClosable: false,
      ...modalProps,
    }
  );
};
