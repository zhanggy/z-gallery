import { useEffect, useCallback } from 'react';
import './Lightbox.css';

function Lightbox({ photo, onClose, onPrev, onNext, currentIndex, total }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={photo.title} onClick={handleBackdropClick}>
      <button className="lightbox__close" onClick={onClose} aria-label="Close lightbox">
        &#x2715;
      </button>

      <button className="lightbox__nav lightbox__nav--prev" onClick={onPrev} aria-label="Previous photo">
        &#8249;
      </button>

      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.src}
          alt={photo.title}
          className="lightbox__image"
        />
        <div className="lightbox__caption">
          <h2 className="lightbox__title">{photo.title}</h2>
          <p className="lightbox__description">{photo.description}</p>
          <span className="lightbox__counter">{currentIndex + 1} / {total}</span>
        </div>
      </div>

      <button className="lightbox__nav lightbox__nav--next" onClick={onNext} aria-label="Next photo">
        &#8250;
      </button>
    </div>
  );
}

export default Lightbox;
