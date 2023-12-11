import { useCallback, useEffect, useRef, useState } from 'react';
import * as styles from './App.module.less';
import { socket } from './socket';
import clsx from 'clsx';

interface IProps {
  talk: (text: string) => void;
  onTyping: () => void;
}

export const App = (props: IProps) => {
  const { talk, onTyping } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [onlineUserCount, setOnlineUserCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<
    { timestamp: string; sender: string; text: string }[]
  >([]);

  const handleTalkClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleHistoryClick = useCallback(() => {
    if (showHistory) {
      setShowHistory(false);
    } else {
      setShowHistory(true);
    }
  }, [showHistory]);

  const handleType = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      talk(text.trim());
      setText('');
    },
    [text]
  );

  useEffect(() => {
    if (!showHistory) return;

    setTimeout(() => {
      if (showHistory) {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 300);
  }, [historyList.length, showHistory]);

  useEffect(() => {
    const listener = (data) => {
      const { list } = data;
      setHistoryList(list);
    };
    // 监听更新精灵的消息
    socket.on('history', listener);

    return () => {
      socket.removeListener('history', listener);
    };
  }, []);

  useEffect(() => {
    const listener = (userCount) => {
      setOnlineUserCount(userCount);
    };
    // 监听更新精灵的消息
    socket.on('userCount', listener);

    return () => {
      socket.removeListener('userCount', listener);
    };
  }, []);

  useEffect(() => {
    const getList = () => {
      socket.emit('history');
    }

    const timer = setInterval(getList, 15000)

    getList();
    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className={styles.app}>
      {!!historyList.length && (
        <button id='history' onClick={handleHistoryClick}>
          历史记录
        </button>
      )}
      <button id='talk' onClick={handleTalkClick}>
        聊天
      </button>
      <div className={styles.onlineCount}>在线人数：{onlineUserCount || '加载中...'}</div>
      <form className={styles.talkInputWrap} onSubmit={handleSubmit}>
        <input
          className={styles.talkInput}
          id='talk-input'
          placeholder='输入内容...'
          maxLength={24}
          ref={inputRef}
          value={text}
          onChange={handleType}
          autoComplete='off'
          autoSave='false'
        />
        <button type='submit' disabled={!text.trim()} className={styles.submit}>
          发送
        </button>
      </form>
      <div
        className={clsx(styles.historyListWrap, {
          [styles.visible]: showHistory,
        })}
      >
        <div className={styles.historyList} ref={listRef}>
          {historyList.map((it, idx) => (
            <div key={it.timestamp + idx} className={styles.historyItem}>
              <div className={styles.timestamp}>{it.timestamp}</div>
              <div className={styles.content}>
                <span className={styles.sender}>{it.sender}</span>
                <span className={styles.text}>: {it.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
