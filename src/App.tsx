import { HashRouter, Routes, Route } from 'react-router-dom';
import { CourseView } from './ui/pages/CourseView';
import { Settings } from './ui/pages/Settings';
import { ImportExport } from './ui/pages/ImportExport';

// HashRouter owns location.hash for routing, so the skip link can't use a
// native "#main-content" href (react-router would treat it as a navigation).
// Focus the target directly instead.
function SkipToContent() {
  return (
    <a
      href="#/"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('main-content')?.focus();
      }}
      className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-emerald-600 focus:px-3 focus:py-2 focus:text-white"
    >
      Skip to content
    </a>
  );
}

export function App() {
  return (
    <HashRouter>
      <SkipToContent />
      <Routes>
        <Route path="/" element={<CourseView />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/import-export" element={<ImportExport />} />
      </Routes>
    </HashRouter>
  );
}
