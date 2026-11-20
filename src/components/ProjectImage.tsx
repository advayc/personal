import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
export default function ProjectImage({
  src,
  alt,
  sizes,
  width,
  height,
  className,
  lightboxClassName,
  priority = false,
  animated = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  width: number;
  height: number;
  className?: string;
  lightboxClassName?: string;
  priority?: boolean;
  animated?: boolean;
}) {
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const direct = animated || src.toLowerCase().endsWith(".gif");
  const close = (event?: MouseEvent<HTMLDialogElement>) => {
    if (event && event.target !== event.currentTarget) return;
    dialog.current?.close();
  };
  useEffect(() => {
    if (lightboxOpen) dialog.current?.showModal();
  }, [lightboxOpen]);
  return (
    <>
      <button
        className={`project-image-zoom ${className || ""}`}
        ref={opener}
        type="button"
        aria-label={`View larger image: ${alt}`}
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          unoptimized={direct}
        />
        <span className="zoom-hint" aria-hidden="true">
          view image ↗
        </span>
      </button>
      {lightboxOpen && createPortal(
        <dialog
          className={`image-lightbox ${lightboxClassName || ""}`}
          ref={dialog}
          aria-label={`Image preview: ${alt}`}
          onClose={() => {
            setLightboxOpen(false);
            opener.current?.focus();
          }}
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
            <Image src={src} alt={alt} fill sizes="96vw" unoptimized={direct} />
          </div>
          <p>{alt}</p>
        </dialog>,
        document.body,
      )}
    </>
  );
}
