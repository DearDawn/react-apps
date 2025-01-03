/** 检查是否是可输入的 DOM 元素 */
export const isInputDom = (target: EventTarget | null) => {
  if (target instanceof HTMLElement) {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    );
  }

  return false;
};
