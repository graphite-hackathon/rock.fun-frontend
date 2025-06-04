import { useEffect, useState } from "react";

export const scrollToHash = function (element_id: string) {
  const element = document.getElementById(element_id);
  element?.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
};


export const useActiveHashOnScroll = (ids: string[]) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!ids.length) return;

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // When an element is intersecting, set it as active
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.5, // 50% of the element visible to be considered active
    });

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [ids]);

  return activeId;
};
