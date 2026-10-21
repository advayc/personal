import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
export default function ProjectImage({
  src,
  alt,
  sizes,
  width,
  height,
  className,
  lightboxClassName,
}: {
  src: string;
  alt: string;
  sizes: string;
  width: number;
  height: number;
  className?: string;
  lightboxClassName?: string;
}) {
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = (event?: MouseEvent<HTMLDialogElement>) => {
    if (event && event.target !== event.currentTarget) return;
    dialog.current?.close();
  };
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClose = () => opener.current?.focus();
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, []);
  return (
    <>
      <button
        className={`project-image-zoom ${className || ""}`}
        ref={opener}
        type="button"
        aria-label={`View larger image: ${alt}`}
        onClick={() => dialog.current?.showModal()}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
        />
        <span className="zoom-hint" aria-hidden="true">
          view image ↗
        </span>
      </button>
      <dialog
        className={`image-lightbox ${lightboxClassName || ""}`}
        ref={dialog}
        aria-label={`Image preview: ${alt}`}
        onClick={close}
      >
        <button
          className="lightbox-close"
          type="button"
          aria-label="Close image preview"
          onClick={() => close()}
        >
          close <kbd>esc</kbd>
        </button>
        <div className="lightbox-image-wrap">
          <Image src={src} alt={alt} fill sizes="96vw" priority />
        </div>
        <p>{alt}</p>
      </dialog>
    </>
  );
}
