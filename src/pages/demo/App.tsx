import * as styles from './App.module.less';
import { Page, Header, Modal, Button, Icon, ICON } from 'sweet-me';
import Comps from './components';
import React from 'react';
import { useCardDetailModal } from '@/utils/hooks';

export const App = () => {
  const { handleClickCard, closeModal, detail, modalVisible } = useCardDetailModal();

  const TargetCompo = React.useMemo(() => {
    if (!Comps[detail]) return '';

    return Comps[detail];
  }, [detail]);

  return (
    <Page maxWidth='100vw' minWidth='300px' className={styles.app}>
      <Header title="小玩意儿~" isSticky />

      <div className={styles.list}>
        {Object.entries(Comps).map(([key, Component]) => (
          <div className={styles.item} key={key}>
            <div
              className={styles.itemCell}
              style={{ transform: `scale(${(Component as any).scale})` }}
            >
              <Component />
              <Icon
                className={styles.detail}
                type={ICON.magicBar}
                onClick={handleClickCard(key)}
              />
            </div>
          </div>
        ))}
      </div>
      <Modal
        className={styles.modal}
        visible={modalVisible}
        maskClosable
        onClose={closeModal}
        footer={<Button onClick={closeModal}>关闭</Button>}
      >
        <div className={styles.bigItem}>
          <TargetCompo />
        </div>
      </Modal>
    </Page >
  );
};
