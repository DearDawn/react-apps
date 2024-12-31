import * as styles from './index.module.less';
import { ICON, Icon, toast } from 'sweet-me';
import { copyTextToClipboard } from '@/utils/text';
import { TextT } from '@/components/chatSDK';

interface IProps {
  info: TextT;
  className?: string;
  enableCopy?: boolean;
}

export const TextItem = (props: IProps) => {
  const { info, enableCopy } = props;

  const handleCopyText =
    (text = '') =>
    () => {
      copyTextToClipboard(text)
        .then(function () {
          toast('文案已复制到剪贴板');
        })
        .catch(function (error) {
          toast('复制失败');
          console.error('Failed to copy text:', error);
        });
    };

  return (
    <div className={styles.textItem} onClick={handleCopyText(info.content)}>
      {info.content}
      {enableCopy && (
        <Icon className={styles.copyIcon} type={ICON.copy} title='复制' />
      )}
    </div>
  );
};
