import { useEffect, useState } from "react";

export function useTypingText(phrases, options = {}) {
  const {
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseTime = 2000
  } = options;

  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!phrases || phrases.length === 0) return;

    const current = phrases[index];
    let timeoutId;

    if (!isDeleting && text === current) {
      // Finished typing current phrase – pause before deleting
      timeoutId = setTimeout(() => setIsDeleting(true), pauseTime);
    } else {
      const delay = isDeleting ? deletingSpeed : typingSpeed;
      timeoutId = setTimeout(() => {
        const next = isDeleting
          ? current.slice(0, text.length - 1)
          : current.slice(0, text.length + 1);

        setText(next);

        if (isDeleting && next === "") {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % phrases.length);
        }
      }, delay);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [phrases, index, text, isDeleting, typingSpeed, deletingSpeed, pauseTime]);

  return text;
}
