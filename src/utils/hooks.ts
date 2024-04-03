import React from "react";
import { useBoolean } from "sweet-me";

interface ICardDetailModalProps<T> { defaultDetail?: T, defaultVisible: boolean }

/** 点击卡片和新弹出弹窗联动 */
export const useCardDetailModal = <T = any> (config: ICardDetailModalProps<T> = {
  defaultVisible: false
}) => {
  const { defaultDetail, defaultVisible } = config || {};
  const [modalVisible, showModal, closeModal] = useBoolean(defaultVisible);
  const [detail, setDetail] = React.useState<T>(defaultDetail);

  const handleClickCard = React.useCallback((key: T) => () => {
    setDetail(key);
    showModal();
  }, [showModal]);

  return { modalVisible, showModal, closeModal, detail, handleClickCard };
};