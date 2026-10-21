import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
export default function PreviewLink({
  href,
  children,
  title,
  description,
  image,
  previewContent,
  variant,
}: {
  href: string;
  children: ReactNode;
  title: string;
  description: string;
  image?: string;
  previewContent?: ReactNode;
  variant?: "dmoj";
}) {
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const id = useId();
  const anchor = useRef<HTMLAnchorElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const close = () => {
    clearTimeout(timer.current);
    setPosition(null);
  };
  const show = () => {
    clearTimeout(timer.current);
    const rect = anchor.current?.getBoundingClientRect();
    if (rect)
      setPosition({
        left: Math.max(
          16,
          Math.min(rect.left, window.innerWidth - (variant === "dmoj" ? 328 : 276)),
        ),
        top:
          variant === "dmoj"
            ? Math.max(16, Math.min(rect.bottom + 10, window.innerHeight - 456))
            : rect.bottom + 10,
      });
  };
  useEffect(() => {
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);
  return (
    <span
      className="preview-link"
      onMouseEnter={show}
      onMouseLeave={() => {
        timer.current = setTimeout(close, 150);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      <Link
        ref={anchor}
        href={href}
        onFocus={show}
        onBlur={close}
        aria-describedby={position ? id : undefined}
      >
        {children}
      </Link>
      {position && (
        <span
          className={`link-preview${variant ? ` link-preview-${variant}` : ""}`}
          style={position}
          id={id}
          role="tooltip"
          onMouseEnter={() => clearTimeout(timer.current)}
        >
          {previewContent || (
            <>
              {image && <Image src={image} alt="" width={280} height={160} />}
              <strong>{title}</strong>
              <span>{description}</span>
            </>
          )}
        </span>
      )}
    </span>
  );
}
