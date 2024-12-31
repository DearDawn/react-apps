import * as styles from './App.module.less';
import { Page, Header, Modal, Button, Icon, ICON } from 'sweet-me';
import Comps from './components';
import React, { useRef } from 'react';
import { useCardDetailModal } from '@/utils/hooks';
import clsx from 'clsx';

const Item = ({ Component, single, onClick, modalVisible }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.item}>
      <div className={styles.itemCell} ref={parentRef}>
        <Component
          style={{ transform: `scale(${(Component as any).scale})` }}
          visible={!modalVisible}
          parent={parentRef}
        />
        {!single && (
          <Icon
            className={styles.detail}
            type={ICON.magicBar}
            onClick={onClick}
          />
        )}
      </div>
    </div>
  );
};

export const App = () => {
  const { handleClickCard, closeModal, detail, modalVisible } =
    useCardDetailModal();
  const parentRef = useRef<HTMLDivElement>(null);

  const TargetCompo = React.useMemo(() => {
    if (!Comps[detail]) return '';

    return Comps[detail];
  }, [detail]);

  return (
    <Page maxWidth='100vw' minWidth='300px' className={styles.app}>
      <Header title='小玩意儿~' isSticky />

      <div className={styles.list}>
        {Object.entries(Comps).map(([key, Component]) => (
          <Item
            key={key}
            Component={Component}
            single={Component.single}
            onClick={handleClickCard(key)}
            modalVisible={modalVisible}
          />
        ))}
      </div>
      <Modal
        className={styles.modal}
        visible={modalVisible}
        maskClosable
        onClose={closeModal}
        footer={<Button onClick={closeModal}>关闭</Button>}
      >
        <div
          className={clsx(styles.bigItem, {
            [styles.fitHeight]: TargetCompo.fitHeight,
          })}
          ref={parentRef}
        >
          <TargetCompo visible parent={parentRef} />
        </div>
      </Modal>
    </Page>
  );
};
