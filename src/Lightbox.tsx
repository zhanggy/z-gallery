import { useCallback, useEffect, useRef } from 'react';
import './Lightbox.css';

interface LightboxProps {
  src: string;
  alt?: string;
  initialFocusPoint?: {
    xRatio: number;
    yRatio: number;
  } | null;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ src, alt, initialFocusPoint, onClose }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const centerOnFocusPoint = useCallback(() => {
    if (!initialFocusPoint || !scrollRef.current || !imageRef.current) return;

    const container = scrollRef.current;
    const image = imageRef.current;

    const targetLeft = image.offsetWidth * initialFocusPoint.xRatio - container.clientWidth / 2;
    const targetTop = image.offsetHeight * initialFocusPoint.yRatio - container.clientHeight / 2;

    const maxLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);

    container.scrollLeft = Math.min(maxLeft, Math.max(0, targetLeft));
    container.scrollTop = Math.min(maxTop, Math.max(0, targetTop));
  }, [initialFocusPoint]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    if (image.complete) {
      centerOnFocusPoint();
      return;
    }

    image.addEventListener('load', centerOnFocusPoint);
    return () => image.removeEventListener('load', centerOnFocusPoint);
  }, [src, centerOnFocusPoint]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      <div ref={scrollRef} className="lightbox-scroll" onClick={(e) => e.stopPropagation()}>
        <img ref={imageRef} src={src} alt={alt} className="lightbox-image" />
      </div>
    </div>
  );
};

export default Lightbox;
