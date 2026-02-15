
import React from 'react';

interface HeaderProps {
  currentView: 'customer' | 'admin' | 'analytics';
  setView: (view: 'customer' | 'admin' | 'analytics') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('customer')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <i className="fas fa-users-viewfinder text-xl"></i>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            AntriQu
          </span>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-4">
          <button 
            onClick={() => setView('customer')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'customer' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <i className="fas fa-user-tag mr-2"></i> Pelanggan
          </button>
          <button 
            onClick={() => setView('admin')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <i className="fas fa-user-shield mr-2"></i> Admin
          </button>
          <button 
            onClick={() => setView('analytics')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <i className="fas fa-chart-line mr-2"></i> Analitik
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
