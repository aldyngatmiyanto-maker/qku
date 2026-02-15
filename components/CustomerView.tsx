
import React, { useState, useEffect } from 'react';
import { Ticket, ServiceType, TicketStatus } from '../types';
import { getSmartGreeting } from '../services/geminiService';

interface CustomerViewProps {
  tickets: Ticket[];
  addTicket: (name: string, service: ServiceType) => void;
  currentCalling: Ticket | null;
}

const CustomerView: React.FC<CustomerViewProps> = ({ tickets, addTicket, currentCalling }) => {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('Selamat datang di layanan kami.');
  const [showModal, setShowModal] = useState(false);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const fetchGreeting = async () => {
      const msg = await getSmartGreeting();
      setGreeting(msg);
    };
    fetchGreeting();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Always use General service type as requested
    const service = ServiceType.GENERAL;
    
    addTicket(name, service);
    const prefix = 'A'; // Prefix for General
    const count = tickets.filter(t => t.serviceType === service).length + 1;
    
    setLastTicket({
        id: 'temp',
        name,
        serviceType: service,
        number: `${prefix}-${count.toString().padStart(3, '0')}`,
        status: TicketStatus.WAITING,
        timestamp: new Date()
    });
    
    setName('');
    setShowModal(true);
  };

  const getWaitingCount = () => {
    return tickets.filter(t => t.status === TicketStatus.WAITING).length;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      {/* Left Section: Info & Status */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Sedang Melayani</h1>
          <p className="text-indigo-100 mb-8 opacity-90">{greeting}</p>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-sm uppercase tracking-widest opacity-75 font-semibold">Nomor Antrian</span>
              <div className="text-8xl font-black mt-2 tracking-tighter">
                {currentCalling ? currentCalling.number : '---'}
              </div>
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                <i className="fas fa-desktop mr-2"></i>
                Loket {currentCalling?.counter || '-'}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full md:w-auto text-center md:text-left">
              <h3 className="font-semibold mb-4 border-b border-white/10 pb-2 text-sm uppercase tracking-wider">Status Antrian</h3>
              <div className="flex flex-col items-center md:items-start">
                <div className="text-4xl font-black mb-1">{getWaitingCount()}</div>
                <div className="text-xs uppercase opacity-70 font-bold">Orang Menunggu</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Estimasi Tunggu</h4>
                <p className="text-sm text-slate-500">Berdasarkan trafik saat ini</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800">~{Math.max(5, getWaitingCount() * 3)} Menit</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <i className="fas fa-bolt text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Total Terlayani</h4>
                <p className="text-sm text-slate-500">Hari ini</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {tickets.filter(t => t.status === TicketStatus.COMPLETED).length} Orang
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Form */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 self-start sticky top-24">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Ambil Antrian</h2>
          <p className="text-slate-500 text-sm">Cukup masukkan nama Anda untuk bergabung dalam antrian hari ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama Anda..."
              className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-slate-50 text-lg font-medium"
            />
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start space-x-3">
             <i className="fas fa-info-circle text-indigo-400 mt-1"></i>
             <p className="text-xs text-indigo-700 leading-relaxed">
               Anda akan otomatis masuk ke antrian umum. Estimasi waktu tunggu akan ditampilkan setelah Anda mendapatkan nomor.
             </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all text-lg"
          >
            Daftar Sekarang
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && lastTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
            <div className="bg-indigo-600 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-ticket-alt text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-1">Pendaftaran Berhasil!</h3>
              <p className="opacity-80 text-sm">Silakan tunggu panggilan petugas</p>
            </div>
            <div className="p-8 text-center">
              <div className="mb-6">
                <span className="text-slate-400 text-sm uppercase tracking-widest font-bold">Nomor Anda</span>
                <div className="text-6xl font-black text-indigo-600 mt-2">{lastTicket.number}</div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Pemegang Tiket</span>
                  <span className="font-semibold text-slate-800">{lastTicket.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-indigo-600">Dalam Antrian</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <i className="fas fa-print mr-2"></i> Cetak
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
