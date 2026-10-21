import { useEffect, useRef, useState, type MouseEvent } from "react";

export default function ProjectVideo({
  src,
  poster,
  alt,
}: {
  src: string;
  poster: string;
  alt: string;
}) {
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const preview = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = preview.current;
    const button = opener.current;
    if (!video || !button) return;
    let visible = false;
    const sync = () => {
      if (motionAllowed && !open && visible && !document.hidden) void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.1 });
    observer.observe(button);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [motionAllowed, open]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const onClose = () => {
      setOpen(false);
      opener.current?.focus();
    };
    element.addEventListener("close", onClose);
    return () => element.removeEventListener("close", onClose);
  }, []);

  const close = (event?: MouseEvent<HTMLDialogElement>) => {
    if (event && event.target !== event.currentTarget) return;
    dialog.current?.close();
  };

  return (
    <>
      <button
        className="project-image-zoom project-video-zoom"
        type="button"
        ref={opener}
        aria-label={`View larger demo: ${alt}`}
        onClick={() => {
          setOpen(true);
          dialog.current?.showModal();
        }}
      >
        <video ref={preview} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" />
        <span className="zoom-hint" aria-hidden="true">view demo ↗</span>
      </button>
      <dialog className="image-lightbox project-video-lightbox" ref={dialog} aria-label={`Demo preview: ${alt}`} onClick={close}>
        <button className="lightbox-close" type="button" aria-label="Close demo preview" onClick={() => close()}>
          close <kbd>esc</kbd>
        </button>
        <div className="lightbox-image-wrap">
          {open && <video src={src} poster={poster} controls autoPlay={motionAllowed} loop playsInline muted />}
        </div>
        <p>{alt}</p>
      </dialog>
    </>
  );
}
