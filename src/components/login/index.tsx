import { Button, Image, useBoolean, usePageVisible } from 'sweet-me';
import * as styles from './index.module.less';
import { FC, useCallback, useEffect, useState } from 'react';
import { myFetch, myPost } from '@/utils/fetch';

export const LoginModal: FC<{ onClose?: VoidFunction }> = (props) => {
  const { onClose } = props || {};
  const [ticket, setTicket] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [status, setStatus] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [loading, startLoading, endLoading] = useBoolean();
  const [loop, startLoop, endLoop] = useBoolean();
  const [loopCount, setLoopCount] = useState(0);
  const { pageVisible } = usePageVisible();

  const handleLogout = useCallback(() => {
    myFetch<{ data: boolean }>('/wechat/logout').then((res) => {
      setIsLogin(false);
    });
  }, []);

  const handleGetLoginInfo = useCallback(() => {
    startLoading();
    myPost<{ ticket: string; code: string }>('/wechat/login_code')
      .then((res) => {
        const { ticket, code } = res || {};
        setTicket(ticket);
        const dataUrl = `data:image/png;base64,${code}`;
        setImageSrc(dataUrl);
        setStatus('请使用微信扫描小程序码登录');
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
          setIsLogin(true);
          setStatus('登录成功');
          setTimeout(() => {
            onClose?.();
          }, 1000);
          return;
        }

        setTimeout(() => {
          setLoopCount(loopCount + 1);
        }, 1000);
      })
      .finally(endLoading);
  }, [endLoading, endLoop, loop, loopCount, onClose, ticket]);

  useEffect(() => {
    if (!pageVisible) return;

    myFetch<{ data: boolean }>('/wechat/check_login').then((res) => {
      if (res.data) {
        setIsLogin(true);
        setStatus('已登录');
      } else {
        setIsLogin(false);
        setStatus('');
        setImageSrc('');
      }
    });
  }, [pageVisible]);

  if (isLogin) {
    return (
      <div className={styles.card}>
        <div className={styles.status2}>{status}</div>
        <Button loading={loading} onClick={handleLogout}>
          退出登录
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {imageSrc ? (
        <>
          <Image className={styles.codeImg} src={imageSrc} />
          <div className={styles.status}>{status}</div>
        </>
      ) : (
        <Button loading={loading} onClick={handleGetLoginInfo}>
          小程序登录
        </Button>
      )}
    </div>
  );
};
