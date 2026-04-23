import React from 'react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  onTouchStart?: React.TouchEventHandler;
  onTouchEnd?: React.TouchEventHandler;
  onDoubleClick?: React.MouseEventHandler;
}


function isVideo(src: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v|avi|wmv)(\?.*)?$/i.test(src);
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, onTouchStart, onTouchEnd, onDoubleClick }) => (
  <div
    className="image-viewer"
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
  >
    {isVideo(src) ? (
      <video
        src={src}
        className="gallery-video"
        controls
        autoPlay
        loop
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        onDoubleClick={onDoubleClick}
      >
        Your browser does not support the video tag.
      </video>
    ) : (
      <img
        src={src}
        alt={alt}
        className="gallery-image"
        onDoubleClick={onDoubleClick}
        style={{ cursor: 'default' }}
      />
    )}
  </div>
);

export default ImageViewer;
