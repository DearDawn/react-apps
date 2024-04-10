import React, { useCallback, useState } from "react";

export const useAutoScrollToBottom = ({ listRef }: { listRef: React.MutableRefObject<HTMLDivElement> }, deps = []) => {
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

      if (isAtBottom) {
        scrollToBottom();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [deps, listRef, scrollToBottom]);

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