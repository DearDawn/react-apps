import * as React from 'react'
import * as styles from './App.module.less'

interface IProps { }

export const App = (props: IProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const handleTalkClick = React.useCallback(() => {
    console.log('[dodo] ', '111', 111)
    inputRef.current?.focus();
  }, [])
  React.useEffect(() => {
    console.log('[dodo] ', 'hello react multi page app!')
  }, [])

  return (
    <div className={styles.app}>
      <button id='talk' onClick={handleTalkClick}>聊天</button>
      <input
        className={styles.talkInput}
        id="talk-input"
        placeholder='输入内容...'
        maxLength={24}
        ref={inputRef}
      ></input>
    </div>
  )
}
