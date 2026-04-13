import React from 'react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  onTouchStart?: React.TouchEventHandler;
  onTouchEnd?: React.TouchEventHandler;
  onDoubleClick?: React.MouseEventHandler;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, onTouchStart, onTouchEnd, onDoubleClick }) => (
  <div
    className="image-viewer"
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
  >
    <img
      src={src}
      alt={alt}
      className="gallery-image"
      onDoubleClick={onDoubleClick}
      style={{ cursor: 'default' }}
    />
  </div>
);

export default ImageViewer;
