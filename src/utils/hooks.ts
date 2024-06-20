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
  const [detailIndex, setDetailIndex] = useState(-1);
  const detailIndexRef = useRef(detailIndex);

  const handleClickCard = React.useCallback(
    (idx = -1, data?: T) =>
      () => {
        setDetail(listData[idx] || data);
        setDetailIndex(idx);
        detailIndexRef.current = idx;
        showModal();
      },
    [listData, showModal]
  );

  useEffect(() => {
    if (modalVisible) return;

    setDetail(defaultDetail);
  }, [defaultDetail, modalVisible]);

  useEffect(() => {
    if (detailIndexRef.current >= 0) {
      setDetail(listData[detailIndexRef.current]);
    }
  }, [listData]);

  return {
    modalVisible,
    showModal,
    closeModal,
    detail,
    detailIndex,
    handleClickCard,
  };
};
