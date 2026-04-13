import Gallery from './components/Gallery';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <span className="app-header__icon" aria-hidden="true">🖼️</span>
          <h1 className="app-header__title">My Gallery</h1>
        </div>
      </header>

      <main className="app-main">
        <Gallery />
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} My Gallery</p>
      </footer>
    </div>
  );
}

export default App;
