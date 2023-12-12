import React, { useState, useEffect } from 'react';
import * as styles from './App.module.less';
import { isDev } from '@/utils';

export const App = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [links, setLinks] = useState([]);
  const host = isDev
    ? 'http://localhost:3000'
    : 'https://www.dododawn.com:3000';

  const fetchLinkList = async () => {
    fetch(`${host}/link/list`)
      .then((res) => res.json())
      .then((data) => {
        setLinks(data);
      })
      .catch((error) => {
        console.error('获取链接列表时出错:', error);
      });
  };

  const handleInputChange = (event) => {
    setLongUrl(event.target.value);
  };

  const generateShortLink = async (e: Event) => {
    e.preventDefault();

    try {
      const response = await fetch(`${host}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: longUrl.trim() }),
      });

      const data = await response.json();
      setShortUrl(data.url);

      if (links.find((it) => it.code === data.code)) return;

      setLinks((prevLinks) => [
        ...prevLinks,
        {
          code: data.code,
          longUrl,
          shortUrl: data.url,
          expirationDate: data.expirationDate,
        },
      ]);
    } catch (error) {
      console.error('生成短链接时出错:', error);
    }
  };

  const deleteLink = async (code) => {
    try {
      const response = await fetch(`${host}/link/${code}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.message === 'success') {
        setLinks((prevLinks) => prevLinks.filter((link) => link.code !== code));
      }
    } catch (error) {
      console.error('删除链接时出错:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopySuccess(true);
  };

  useEffect(() => {
    fetchLinkList();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>短链接生成器</h1>
      <form className={styles.form} onSubmit={generateShortLink}>
        <input
          type='text'
          value={longUrl}
          onChange={handleInputChange}
          placeholder='请输入长链接'
          className={styles.input}
        />
        <button
          className={styles.button}
          disabled={!longUrl.trim()}
          type='submit'
        >
          生成
        </button>
      </form>
      {shortUrl && (
        <div className={styles.result}>
          <p className={styles['result-label']}>短链接:</p>
          <div className={styles['copy-container']}>
            <input
              type='text'
              value={shortUrl}
              readOnly
              className={styles['result-input']}
            />
            <button
              className={`${styles.button} ${styles['copy-button']}`}
              onClick={copyToClipboard}
            >
              {copySuccess ? '已复制!' : '复制到剪贴板'}
            </button>
          </div>
        </div>
      )}

      {/* 生成链接的表格 */}
      <table className={styles['link-table']}>
        <thead>
          <tr>
            <th>长链接</th>
            <th>短链接</th>
            <th>删除</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.code}>
              <td>{link.longUrl}</td>
              <td>{link.shortUrl}</td>
              <td>
                <button
                  className={`${styles.button} ${styles['delete-button']}`}
                  onClick={() => deleteLink(link.code)}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
