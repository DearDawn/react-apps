import React, { useEffect, useRef, useState } from 'react';
import { useBoolean } from 'sweet-me';

interface ICardDetailModalProps<T> {
  defaultDetail?: T;
  defaultVisible?: boolean;
  listData?: T[];
}

/** 点击卡片和新弹出弹窗联动 */
export const useCardDetailModal = <T = any>(
  config: ICardDetailModalProps<T> = {
    defaultVisible: false,
    listData: [],
  }
) => {
  const { defaultDetail, defaultVisible = false, listData = [] } = config || {};
  const [modalVisible, showModal, closeModal] = useBoolean(defaultVisible);
  const [detail, setDetail] = useState<T>(defaultDetail);
  const detailId = useRef('');

  const handleClickCard = React.useCallback(
    (data?: T) => () => {
      setDetail(data);
      detailId.current = data['_id'];
      showModal();
    },
    [showModal]
  );

  useEffect(() => {
    if (modalVisible) return;

    setDetail(defaultDetail);
    detailId.current = '';
  }, [defaultDetail, modalVisible]);

  useEffect(() => {
    const item = listData.find((it) => it['_id'] === detailId.current);

    if (item) {
      setDetail(item);
    }
  }, [listData]);

  return {
    modalVisible,
    showModal,
    closeModal,
    detail,
    handleClickCard,
  };
};
