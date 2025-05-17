import React, { useEffect, useRef } from "react";
import "./Highlight.css";

type Props = {
  children: React.ReactNode;
};

const Highlight: React.FC<Props> = ({ children }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.add("highlight-animate");
        } else {
          el.classList.remove("highlight-animate");
        }
      });
    };
    const observer = new window.IntersectionObserver(handleIntersect, {
      threshold: 0.5,
      rootMargin: "0px 0px -10% 0px"
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="highlight" style={{ display: 'inline' }}>{children}</span>
  );
};

export default Highlight; 