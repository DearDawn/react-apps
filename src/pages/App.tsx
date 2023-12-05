import * as React from 'react'
import * as styles from './App.module.less'

interface IProps {}

export const App = (props: IProps) => {
  React.useEffect(() => {
    console.log('[dodo] ', 'hello react multi page app!')
  }, [])

  return (
    <div className={styles.app}>
      <a href='./home'>Home 1234567</a>
    </div>
  )
}
