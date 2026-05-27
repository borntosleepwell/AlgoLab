import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  onScrollToAbout?: () => void;
}

const NAV_ITEMS = ['ALGORITHMS', 'AUTOMATA', 'VISION', 'ABOUT'] as const;

export function Navbar({ onScrollToAbout }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (item: string) => {
    if (item === 'ABOUT') {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        onScrollToAbout?.();
      }
      return;
    } else if (item === 'ALGORITHMS') {
      navigate('/lab/graph');
    } else if (item === 'AUTOMATA') {
      navigate('/lab/automata');
    } else if (item === 'VISION') {
      navigate('/lab/vision');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="w-full border-b border-[#333333] px-8 py-6 flex justify-between items-center sticky top-0 z-50 bg-[#050505]">
      
      {/* Left Area - Contextual back button or Logo */}
      <div className="flex items-center gap-8 w-1/3">
        {location.pathname !== '/' ? (
           <button 
             onClick={() => navigate('/')} 
             className="font-mono text-sm font-bold uppercase tracking-widest hover:text-[#aaaaaa] transition-colors flex items-center gap-2 text-[#F2F2F2]"
           >
             <span className="text-lg leading-none">←</span> BACK
           </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="font-serif text-3xl italic flex items-center gap-3 text-[#F2F2F2] hover:opacity-80 transition-opacity"
          >
              <img src="/logo.svg" alt="AlgoLab Logo" className="w-8 h-8" />
              AlgoLab
          </button>
        )}
      </div>

      {/* Center - Navigation (Brutalist monospace links) */}
      <nav className="hidden md:flex items-center justify-center gap-8 w-1/3">
         {NAV_ITEMS.map((item) => (
           <button
             key={item}
             onClick={() => handleNavClick(item)}
             className={`font-mono text-xs uppercase font-bold tracking-[0.2em] transition-colors ${
               location.pathname.toUpperCase().includes(item) || (item === 'ABOUT' && location.hash === '#about')
                 ? 'text-[#F2F2F2]' 
                 : 'text-[#aaaaaa] hover:text-[#A62533]'
             }`}
           >
             {item}
           </button>
         ))}
      </nav>

      {/* Right Area - Logo (if not on homepage) or empty */}
      <div className="w-1/3 flex justify-end">
        {location.pathname !== '/' && (
          <button
            onClick={() => navigate('/')}
            className="font-serif text-3xl italic flex items-center gap-3 text-[#F2F2F2] hover:opacity-80 transition-opacity"
          >
              <img src="/logo.svg" alt="AlgoLab Logo" className="w-8 h-8" />
              AlgoLab
          </button>
        )}
      </div>

    </header>
  );
}
