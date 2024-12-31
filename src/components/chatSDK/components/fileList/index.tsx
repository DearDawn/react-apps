import React, { useContext } from 'react';
import * as styles from './index.module.less';
import { FormContext, ICON, Icon } from 'sweet-me';
import clsx from 'clsx';

export const FileList = ({
  className = '',
  onDelete,
}: {
  className: string;
  onDelete?: VoidFunction;
}) => {
  const { state } = useContext(FormContext);
  const { value: file } = state?.file || {};

  if (!file) {
    return null;
  }

  return (
    <div className={clsx(styles.fileList, className)}>
      <div className={styles.fileItem}>
        <Icon className={styles.fileIcon} type={ICON.file} size={40} />
        {file?.name}
        <Icon
          className={styles.closeIcon}
          onClick={onDelete}
          type={ICON.close}
          size={24}
        />
      </div>
    </div>
  );
};
