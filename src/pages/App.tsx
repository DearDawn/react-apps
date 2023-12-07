import * as React from 'react'
import * as styles from './App.module.less'

interface IProps { }

export const App = (props: IProps) => {
  React.useEffect(() => {
    console.log('[dodo] ', 'hello react multi page app!')
  }, [])

  return (
    <div className={styles.app}>
      <textarea name="" id="" cols={30} rows={10}></textarea>
    </div>
  )
}
