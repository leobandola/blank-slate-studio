import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Check } from 'lucide-react';
import { toast } from 'sonner';

const THEME_PRESETS = [
  { id: 'blue', name: 'Azul Corporativo', primary: '220 70% 50%', accent: '240 80% 60%' },
  { id: 'green', name: 'Verde Natureza', primary: '142 76% 36%', accent: '160 84% 39%' },
  { id: 'purple', name: 'Roxo Elegante', primary: '262 83% 58%', accent: '280 73% 53%' },
  { id: 'red', name: 'Vermelho Energia', primary: '0 84% 55%', accent: '15 90% 50%' },
  { id: 'orange', name: 'Laranja Vibrante', primary: '24 95% 53%', accent: '35 95% 50%' },
  { id: 'teal', name: 'Teal Moderno', primary: '188 78% 41%', accent: '174 72% 45%' },
  { id: 'pink', name: 'Rosa Ousado', primary: '330 70% 50%', accent: '340 82% 52%' },
  { id: 'slate', name: 'Cinza Profissional', primary: '215 20% 40%', accent: '215 25% 50%' },
];

export const ThemePicker = () => {
  const [activeTheme, setActiveTheme] = useState(() => 
    localStorage.getItem('colorTheme') || 'blue'
  );

  useEffect(() => {
    applyTheme(activeTheme);
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = THEME_PRESETS.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--primary-hover', theme.accent);
    root.style.setProperty('--gradient-primary', 
      `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))`
    );
    root.style.setProperty('--gradient-hero',
      `linear-gradient(135deg, hsl(${theme.primary}) 0%, hsl(${theme.accent}) 100%)`
    );
    root.style.setProperty('--shadow-soft',
      `0 4px 6px -1px hsl(${theme.primary} / 0.1)`
    );
    root.style.setProperty('--shadow-medium',
      `0 10px 15px -3px hsl(${theme.primary} / 0.1)`
    );

    setActiveTheme(themeId);
    localStorage.setItem('colorTheme', themeId);
  };

  const handleSelect = (themeId: string) => {
    applyTheme(themeId);
    toast.success('Tema aplicado!');
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="bg-gradient-secondary">
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Tema de Cores
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Escolha a cor primária do sistema
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {THEME_PRESETS.map(theme => (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                activeTheme === theme.id 
                  ? 'border-foreground shadow-medium' 
                  : 'border-transparent hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ background: `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))` }}
                />
                {activeTheme === theme.id && (
                  <Check className="h-4 w-4 text-foreground absolute top-2 right-2" />
                )}
              </div>
              <p className="text-xs font-medium text-left">{theme.name}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Apply saved theme on app load
export const applySavedTheme = () => {
  const themeId = localStorage.getItem('colorTheme') || 'blue';
  const theme = THEME_PRESETS.find(t => t.id === themeId);
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--ring', theme.primary);
  root.style.setProperty('--primary-hover', theme.accent);
  root.style.setProperty('--gradient-primary',
    `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))`
  );
  root.style.setProperty('--gradient-hero',
    `linear-gradient(135deg, hsl(${theme.primary}) 0%, hsl(${theme.accent}) 100%)`
  );
  root.style.setProperty('--shadow-soft',
    `0 4px 6px -1px hsl(${theme.primary} / 0.1)`
  );
  root.style.setProperty('--shadow-medium',
    `0 10px 15px -3px hsl(${theme.primary} / 0.1)`
  );
};
