
import React, { useState, useEffect, useMemo } from 'react';
import { Ticket, ServiceType, TicketStatus } from './types';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import AdminView from './components/AdminView';
import AnalyticsView from './components/AnalyticsView';

const App: React.FC = () => {
  const [view, setView] = useState<'customer' | 'admin' | 'analytics'>('customer');
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('antriqu_tickets');
    return saved ? JSON.parse(saved).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })) : [];
  });

  useEffect(() => {
    localStorage.setItem('antriqu_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const addTicket = (name: string, service: ServiceType) => {
    const prefix = service === ServiceType.GENERAL ? 'A' : 
                   service === ServiceType.FINANCE ? 'B' :
                   service === ServiceType.CS ? 'C' : 'D';
    
    const count = tickets.filter(t => t.serviceType === service).length + 1;
    const number = `${prefix}-${count.toString().padStart(3, '0')}`;
    
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      number,
      name,
      serviceType: service,
      status: TicketStatus.WAITING,
      timestamp: new Date()
    };
    
    setTickets(prev => [...prev, newTicket]);
  };

  const updateTicketStatus = (id: string, status: TicketStatus, counter?: number) => {
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, status, counter: counter ?? t.counter, calledAt: status === TicketStatus.CALLING ? new Date() : t.calledAt } : t
    ));
  };

  const currentCalling = useMemo(() => {
    return tickets.filter(t => t.status === TicketStatus.CALLING).sort((a, b) => (b.calledAt?.getTime() || 0) - (a.calledAt?.getTime() || 0))[0] || null;
  }, [tickets]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentView={view} setView={setView} />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        {view === 'customer' && (
          <CustomerView 
            tickets={tickets} 
            addTicket={addTicket} 
            currentCalling={currentCalling}
          />
        )}
        
        {view === 'admin' && (
          <AdminView 
            tickets={tickets} 
            updateTicketStatus={updateTicketStatus} 
          />
        )}
        
        {view === 'analytics' && (
          <AnalyticsView tickets={tickets} />
        )}
      </main>

      <footer className="py-4 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
        &copy; 2024 AntriQu System • Modern Queue Management Solution
      </footer>
    </div>
  );
};

export default App;
