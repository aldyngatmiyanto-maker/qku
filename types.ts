
export enum ServiceType {
  GENERAL = 'Umum',
  FINANCE = 'Keuangan',
  CS = 'Customer Service',
  TECH = 'Teknis'
}

export enum TicketStatus {
  WAITING = 'Menunggu',
  CALLING = 'Dipanggil',
  COMPLETED = 'Selesai',
  SKIPPED = 'Terlewat'
}

export interface Ticket {
  id: string;
  number: string;
  name: string;
  serviceType: ServiceType;
  status: TicketStatus;
  timestamp: Date;
  calledAt?: Date;
  counter?: number;
}

export interface QueueState {
  tickets: Ticket[];
  currentCalling: Ticket | null;
  avgServiceTime: number; // in minutes
}

export interface AIInsight {
  summary: string;
  recommendation: string;
  expectedTraffic: 'Low' | 'Medium' | 'High';
}
