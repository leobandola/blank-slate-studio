import { createRoot } from 'react-dom/client'
import { applySavedTheme } from './components/themes/ThemePicker'
import App from './App.tsx'
import './index.css'

applySavedTheme();
createRoot(document.getElementById("root")!).render(<App />);
