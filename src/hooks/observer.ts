import { useEffect, useRef } from 'react';

interface IObserver {
  threshold?: number;
  delay?: number;
  rootMargin?: string;
}

export const useObserver = (
  postId: string,
  onView: (postId: string) => Promise<void>,
  options: IObserver = {},
  enabled: boolean = true
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const {
    threshold = 0.5, 
    delay = 1000,
    rootMargin = '0px'
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timeoutRef.current = setTimeout(async () => {
              try {
                await onView(postId);
              } catch (error) {
                console.error('Error recording view:', error);
              }
            }, delay);
          } else if (!entry.isIntersecting && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [postId, onView, threshold, delay, rootMargin, enabled]);

  return { elementRef };
};