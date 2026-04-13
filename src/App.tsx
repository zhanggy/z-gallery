
import { useEffect, useRef, useState } from 'react';
import './App.css';
import ImageViewer from './ImageViewer';
import Lightbox from './Lightbox';
import DirectoryTree from './DirectoryTree';
import type { DirNode } from './DirectoryTree';
import { useImagePreloader } from './hooks/useImagePreloader';

const API_DIRS = '/api/gallery/';
const URL_PREFIX = '/store';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const extractDirNodes = (payload: unknown): DirNode[] => {
  const rawDirs = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.dirs)
      ? payload.dirs
      : [];

  return rawDirs
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => ({
      name: typeof item.name === 'string' ? item.name : '',
      path: typeof item.path === 'string' ? item.path : '',
      hasChildren: true,
    }))
    .filter((item) => item.name.length > 0 && item.path.length > 0);
};

const toImageUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

const joinPath = (basePath: string, fileName: string): string => {
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const file = fileName.startsWith('/') ? fileName.slice(1) : fileName;
  return `${base}/${file}`;
};

const extractImageUrls = (payload: unknown): string[] => {
  const basePath = isRecord(payload) && typeof payload.path === 'string'
    ? URL_PREFIX + payload.path
    : '';

  const rawFiles = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.files)
      ? payload.files
      : [];

  return rawFiles
    .map((item) => {
      if (typeof item === 'string') return item;
      if (isRecord(item) && typeof item.path === 'string') return item.path;
      if (isRecord(item) && typeof item.name === 'string') return item.name;
      return '';
    })
    .map((item) => {
      if (item.length === 0) return '';
      if (/^https?:\/\//i.test(item) || item.startsWith('/')) return toImageUrl(item);
      if (basePath.length > 0) return toImageUrl(joinPath(basePath, item));
      return toImageUrl(item);
    })
    .filter((item) => item.length > 0);
};

function App() {
  const [dirTree, setDirTree] = useState<DirNode[]>([]);
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const postWithPath = async (url: string, path: string) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });
    return res.json();
  };

  const fetchImagesByPath = (path: string) => {
    setImagesLoading(true);
    setImages([]);
    setCurrent(0);
    postWithPath(API_DIRS, path)
      .then((data) => {
        setImages(extractImageUrls(data));
      })
      .catch(() => {
        // Fallback demo images
        setImages([
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
          'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
          'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
          'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
        ]);
      })
      .finally(() => setImagesLoading(false));
  };

  // Fetch directory tree on startup
  useEffect(() => {
    postWithPath(API_DIRS, '/')
      .then((data) => {
        const dirs = extractDirNodes(data);
        if (dirs.length > 0) setDirTree(dirs);
      })
      .catch(() => {
        // Fallback demo tree (root level only)
        setDirTree([
          { name: 'Photos', path: '/photos', hasChildren: true },
          { name: 'Wallpapers', path: '/wallpapers', hasChildren: false },
          { name: 'Screenshots', path: '/screenshots', hasChildren: false },
        ]);
      });
  }, []);

  // Lazy-load children for a directory node
  const loadChildren = async (path: string): Promise<DirNode[]> => {
    try {
      const data = await postWithPath(API_DIRS, path);
      return extractDirNodes(data);
    } catch {
      // Fallback demo children
      if (path === '/photos') {
        return [
          { name: '2023', path: '/photos/2023', hasChildren: false },
          { name: '2024', path: '/photos/2024', hasChildren: false },
        ];
      }
      return [];
    }
  };

  // Keyboard navigation for PC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // Swipe navigation for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const dx = touchEndX.current - touchStartX.current;
      if (dx > 50) prevImage();
      if (dx < -50) nextImage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const prevImage = () => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1));
  const nextImage = () => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0));

  const { getCachedUrl } = useImagePreloader(images, current);

  const handleDirSelect = (path: string) => {
    setSelectedDir(path);
    fetchImagesByPath(path);
  };

  const renderGalleryContent = () => {
    if (!selectedDir) {
      return (
        <div className="image-viewer">
          <div className="gallery-hint">请从左侧目录树中选择一个目录</div>
        </div>
      );
    }
    if (imagesLoading) {
      return <div className="image-viewer"><div className="loading">Loading...</div></div>;
    }
    if (images.length === 0) {
      return (
        <div className="image-viewer">
          <div className="gallery-hint">该目录下没有图片</div>
        </div>
      );
    }
    return (
      <ImageViewer
        src={getCachedUrl(images[current])}
        alt={`${selectedDir} - ${current + 1}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onDoubleClick={() => setLightbox(true)}
      />
    );
  };

  return (
    <div className="gallery-layout">
      <aside className={`dir-sidebar${sidebarOpen ? '' : ' collapsed'}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">目录</span>
        </div>
        <div className="sidebar-content">
          <DirectoryTree
            nodes={dirTree}
            selectedPath={selectedDir}
            onSelect={handleDirSelect}
            onLoadChildren={loadChildren}
          />
        </div>
      </aside>

      <button
        className="sidebar-toggle"
        onClick={(e) => { e.stopPropagation(); setSidebarOpen((o) => !o); }}
        aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      <main className="gallery-main" onClick={() => setSidebarOpen(false)}>
        {renderGalleryContent()}
        {images.length > 0 && selectedDir && !imagesLoading && (
          <div className="gallery-controls">
            <button onClick={prevImage} aria-label="Previous image">⟨</button>
            <span>{current + 1} / {images.length}</span>
            <button onClick={nextImage} aria-label="Next image">⟩</button>
          </div>
        )}
        {lightbox && images.length > 0 && (
          <Lightbox
            src={getCachedUrl(images[current])}
            alt={`Gallery ${current + 1}`}
            onClose={() => setLightbox(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
