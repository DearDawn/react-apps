import { Button, Image, useBoolean } from 'sweet-me';
import { Comp } from '../type';
import * as styles from './index.module.less';
import { useCallback, useEffect, useState } from 'react';
import { myFetch, myPost } from '@/utils/fetch';

export const Login: Comp = ({ style }) => {
  const [ticket, setTicket] = useState('');
  const [status, setStatus] = useState('请使用微信扫描小程序码登录');
  const [imageSrc, setImageSrc] = useState('');
  const [loading, startLoading, endLoading] = useBoolean();
  const [loop, startLoop, endLoop] = useBoolean();
  const [loopCount, setLoopCount] = useState(0);

  const handleGetLoginInfo = useCallback(() => {
    startLoading();
    myPost<{ ticket: string; code: string }>('/wechat/login_code')
      .then((res) => {
        const { ticket, code } = res || {};
        setTicket(ticket);
        const dataUrl = `data:image/png;base64,${code}`;
        setImageSrc(dataUrl);
        startLoop();
      })
      .finally(endLoading);
  }, [endLoading, startLoading, startLoop]);

  useEffect(() => {
    if (!loop) return;

    if (loopCount > 60) {
      setStatus('已超时');
      return;
    }

    myFetch<{ data: { action: string; userInfo: any } }>(
      '/wechat/login_status',
      {
        ticket,
      }
    )
      .then((res) => {
        const { action, userInfo } = res?.data || {};

        if (action === 'ready') {
          setStatus(
            `已扫描，请在小程序中确认\n【OPEN_ID】\n${userInfo.OPENID}`
          );
        }

        if (action === 'confirm') {
          endLoop();
          setStatus('登录成功');
          return;
        }

        setTimeout(() => {
          setLoopCount(loopCount + 1);
        }, 1000);
      })
      .finally(endLoading);
  }, [endLoading, endLoop, loop, loopCount, ticket]);

  return (
    <div
      className={styles.card}
      style={style}
    >
      {imageSrc ? (
        <>
          <Image
            className={styles.codeImg}
            src={imageSrc}
          />
          <div className={styles.status}>{status}</div>
        </>
      ) : (
        <Button
          loading={loading}
          onClick={handleGetLoginInfo}
        >
          小程序登录
        </Button>
      )}
    </div>
  );
};

Login.scale = 0.5;
