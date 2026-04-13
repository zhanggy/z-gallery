import { useState } from 'react';
import Lightbox from './Lightbox';
import photos from '../data/gallery';
import './Gallery.css';

function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const openLightbox = (index) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goToPrev = () =>
    setSelectedIndex((i) => (i - 1 + photos.length) % photos.length);

  const goToNext = () =>
    setSelectedIndex((i) => (i + 1) % photos.length);

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            className="gallery-card"
            onClick={() => openLightbox(index)}
            aria-label={`Open photo: ${photo.title}`}
          >
            <div className="gallery-card__image-wrapper">
              <img
                src={photo.thumb}
                alt={photo.title}
                className="gallery-card__image"
                loading="lazy"
              />
              <div className="gallery-card__overlay">
                <span className="gallery-card__overlay-text">View</span>
              </div>
            </div>
            <div className="gallery-card__info">
              <h3 className="gallery-card__title">{photo.title}</h3>
            </div>
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <Lightbox
          photo={photos[selectedIndex]}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
          currentIndex={selectedIndex}
          total={photos.length}
        />
      )}
    </>
  );
}

export default Gallery;
