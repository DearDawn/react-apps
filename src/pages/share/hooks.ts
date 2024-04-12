import React, { useCallback, useEffect, useState } from "react";
import { isInputDom } from "./utils";

export const useAutoScrollToBottom = ({ listRef, force = false }: {
  listRef: React.MutableRefObject<HTMLDivElement>,
  force: boolean
},
  deps: React.DependencyList = []) => {
  const scrollToBottom = useCallback(() => {
    const container = listRef.current;
    const scrollHeight = container.scrollHeight;
    container.scrollTo({ top: scrollHeight, behavior: 'smooth' });
  }, [listRef]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const container = listRef.current;
      const scrollHeight = container.scrollHeight;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 300;

      if (isAtBottom || force) {
        scrollToBottom();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRef, scrollToBottom, force, ...deps]);

  return { scrollToBottom };
};

export const useShowBackToBottom = ({ bottomHolderRef, listRef }: {
  listRef: React.MutableRefObject<HTMLDivElement>,
  bottomHolderRef: React.MutableRefObject<HTMLDivElement>
}) => {
  const [showBack, setShowBack] = useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio > 0) {
          setShowBack(false);
        } else {
          setShowBack(true);
        }
      });
    }, { root: listRef.current, rootMargin: '0px 0px 200px 0px' });

    observer.observe(bottomHolderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [bottomHolderRef, listRef]);

  return { showBack };
};


/** 当前网页是否获得焦点 */
export const usePageFocus = () => {
  const [isPageFocused, setIsPageFocused] = useState(false);

  useEffect(() => {
    // 检查当前文档是否具有焦点
    function checkWindowFocus () {
      setIsPageFocused(document.hasFocus());
    }

    // 监听窗口焦点变化事件
    window.addEventListener('focus', checkWindowFocus);
    window.addEventListener('blur', checkWindowFocus);

    // 页面加载时进行一次初始检查
    checkWindowFocus();

    return () => {
      window.removeEventListener('focus', checkWindowFocus);
      window.removeEventListener('blur', checkWindowFocus);
    };
  }, []);

  return { isPageFocused };
};

export const usePasteEvent = (handler: (event: DataTransfer) => void, root = document) => {
  const pasteHandler = useCallback((event: ClipboardEvent) => {
    const clipboardData = event.clipboardData;

    if (isInputDom(event.target) && clipboardData.types.includes('text/plain')) {
      return;
    }

    handler(clipboardData);
  }, [handler]);

  React.useEffect(() => {
    root.addEventListener('paste', pasteHandler);
    return () => {
      root.removeEventListener('paste', pasteHandler);
    };
  }, [handler, pasteHandler, root]);
};

export const useDragEvent = (handler: (event: DataTransfer) => void, root = document) => {
  const [isDragging, setIsDragging] = useState(false);

  const dropHandler = useCallback((event: DragEvent) => {
    event.preventDefault();

    setIsDragging(false);
    const clipboardData = event.dataTransfer;
    handler(clipboardData);
  }, [handler]);

  const dragover = function (event) {
    setIsDragging(true);
    event.preventDefault();
  };

  const dragend = function () {
    setIsDragging(false);
  };

  React.useEffect(() => {
    root.addEventListener('drop', dropHandler);
    root.addEventListener('dragover', dragover);
    // 拖动页面中的东西会触发 dragend
    root.addEventListener('dragend', dragend);
    root.addEventListener('dragleave', dragend);
    return () => {
      root.removeEventListener('drop', dropHandler);
      root.removeEventListener('dragover', dragover);
      root.removeEventListener('dragend', dragend);
      root.removeEventListener('dragleave', dragend);
    };
  }, [handler, dropHandler, root]);

  return { isDragging };
};

export const useEnterKeyDown = (handler: () => void) => {

  useEffect(() => {
    const handleEnterDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isBody = activeElement instanceof HTMLBodyElement;

      if (event.code === 'Enter' && !event.shiftKey && isBody) {
        if (!event.repeat) {
          handler();
        }
      }
    };

    window.addEventListener('keydown', handleEnterDown);

    return () => {
      window.removeEventListener("keydown", handleEnterDown);
    };
  }, [handler]);
};