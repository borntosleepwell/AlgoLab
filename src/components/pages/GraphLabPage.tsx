import { Navbar } from '../layout/Navbar';
import { GraphLab } from '../visualizer/GraphLab';

export function GraphLabPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <div className="page-enter flex-1 flex flex-col">
        {/* Graph Lab */}
        <div className="relative flex-1 px-4 sm:px-8 lg:px-12 py-12">
          <div className="absolute inset-0 pointer-events-none bg-dot-grid dark" />
          <GraphLab />
        </div>
      </div>
    </div>
  );
}

