import { useEffect, useRef, useState, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      // 监听用户滚动事件
      const handleScroll = () => {
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container;
          // 检查滚动位置，如果距离底部超过一定阈值，认为用户已手动滚动
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
          setUserScrolled(!isAtBottom);
        }
      };

      container.addEventListener('scroll', handleScroll);

      const observer = new MutationObserver(() => {
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

          // 只有在用户没有手动滚动或已经在底部时才滚动到底部
          if (!userScrolled || isAtBottom) {
            end.scrollIntoView({ behavior: 'instant', block: 'end' });
          }
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => {
        observer.disconnect();
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [userScrolled]);

  return [containerRef, endRef];
}
