
import React, { useState, useEffect, useRef } from 'react';
import { Ticket, TicketStatus, ServiceType } from '../types';
import { getQueueInsights, generateQueueVoice, decodeBase64, decodeAudioData } from '../services/geminiService';

interface AdminViewProps {
  tickets: Ticket[];
  updateTicketStatus: (id: string, status: TicketStatus, counter?: number) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ tickets, updateTicketStatus }) => {
  const [selectedCounter, setSelectedCounter] = useState(1);
  const [aiInsight, setAiInsight] = useState<{ summary: string; recommendation: string; expectedTraffic: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const waitingTickets = tickets.filter(t => t.status === TicketStatus.WAITING).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const callingTicket = tickets.find(t => t.status === TicketStatus.CALLING && t.counter === selectedCounter);

  useEffect(() => {
    analyzeQueue();
  }, [tickets.length]);

  const analyzeQueue = async () => {
    setIsAnalyzing(true);
    const result = await getQueueInsights(tickets);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

  const playVoice = async (text: string) => {
    setIsCalling(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const base64Audio = await generateQueueVoice(text);
      
      if (base64Audio) {
        const audioBytes = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsCalling(false);
        source.start(0);
      } else {
        // Fallback to basic speech if AI fails
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.onend = () => setIsCalling(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Playback error:", error);
      setIsCalling(false);
    }
  };

  const handleCallNext = async () => {
    if (callingTicket) {
      updateTicketStatus(callingTicket.id, TicketStatus.COMPLETED);
    }
    
    if (waitingTickets.length > 0) {
      const next = waitingTickets[0];
      updateTicketStatus(next.id, TicketStatus.CALLING, selectedCounter);
      
      const message = `Nomor Antrian ${next.number.split('').join(' ')}, silakan menuju ke loket ${selectedCounter}`;
      await playVoice(message);
    }
  };

  const handleSkip = () => {
    if (callingTicket) {
      updateTicketStatus(callingTicket.id, TicketStatus.SKIPPED);
    }
  };

  const handleRecall = async () => {
    if (callingTicket) {
      const message = `Panggilan ulang, Nomor Antrian ${callingTicket.number.split('').join(' ')}, silakan menuju ke loket ${selectedCounter}`;
      await playVoice(message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Panel Kendali Loket</h2>
          <p className="text-sm text-slate-500">Kelola antrian yang sedang berjalan</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="text-sm font-semibold text-slate-600">Pilih Loket:</label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setSelectedCounter(num)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${selectedCounter === num ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calling Box */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
            {callingTicket ? (
              <div className="animate-pulseFast">
                <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                  {isCalling ? '🎙️ Sedang Memanggil...' : 'Sedang Dipanggil'}
                </span>
                <div className="text-9xl font-black text-slate-800 tracking-tighter mb-4">{callingTicket.number}</div>
                <h3 className="text-2xl font-semibold text-slate-600 mb-8">{callingTicket.name}</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => updateTicketStatus(callingTicket.id, TicketStatus.COMPLETED)}
                    className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center"
                  >
                    <i className="fas fa-check mr-2"></i> Selesai & Berikutnya
                  </button>
                  <button 
                    onClick={handleSkip}
                    className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Lewati
                  </button>
                  <button 
                    onClick={handleRecall}
                    disabled={isCalling}
                    className="px-8 py-4 bg-indigo-50 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-100 transition-all disabled:opacity-50"
                  >
                    Panggil Ulang
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-headset text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Loket {selectedCounter} Tersedia</h3>
                <p className="max-w-xs mb-8">Tidak ada antrian yang sedang aktif di loket ini.</p>
                <button 
                  onClick={handleCallNext}
                  disabled={waitingTickets.length === 0 || isCalling}
                  className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  {isCalling ? 'Menghasilkan Suara...' : 'Panggil Nomor Berikutnya'}
                </button>
              </div>
            )}
          </div>

          {/* AI Insights Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <i className="fas fa-brain text-8xl"></i>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-wand-magic-sparkles"></i>
                  </div>
                  <h3 className="font-bold text-lg">AI Smart Assistant</h3>
                </div>
                <button onClick={analyzeQueue} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
                  {isAnalyzing ? 'Menganalisis...' : 'Refresh Analisis'}
                </button>
              </div>
              
              {aiInsight ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider">Status Saat Ini</p>
                    <p className="text-white leading-relaxed">{aiInsight.summary}</p>
                    <div className="inline-flex items-center px-2 py-0.5 bg-indigo-500/30 rounded text-xs border border-indigo-400/30">
                      Trafik: {aiInsight.expectedTraffic}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider">Rekomendasi Petugas</p>
                    <p className="text-indigo-50 text-sm leading-relaxed italic">"{aiInsight.recommendation}"</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 animate-pulse">Menghubungkan ke Gemini AI untuk analisis antrian...</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Queue List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[650px]">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Daftar Tunggu ({waitingTickets.length})</h3>
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <i className="fas fa-list-ul text-xs"></i>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {waitingTickets.length > 0 ? (
              waitingTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl font-black text-slate-800 group-hover:text-indigo-700">{ticket.number}</span>
                    <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded shadow-sm text-slate-500">{ticket.serviceType}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium truncate max-w-[120px]">{ticket.name}</span>
                    <span className="text-slate-400 text-xs">
                      {new Date(ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <i className="fas fa-inbox text-4xl mb-2"></i>
                <p className="text-sm">Belum ada antrian</p>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-50/50">
            <button 
              onClick={() => {
                if(confirm('Reset semua data antrian?')) {
                  localStorage.removeItem('antriqu_tickets');
                  window.location.reload();
                }
              }}
              className="w-full py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              Reset Database Antrian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
