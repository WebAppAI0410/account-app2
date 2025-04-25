// src/types/index.ts
export interface Participant {
  id: string;
  name: string;
  email?: string;
  amountOwed?: number;
  amountPaid?: number;
  paymentDueDate?: Date;
  isPaid?: boolean;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  collectionStartDate?: string;
  collectionEndDate?: string;
  participants?: Participant[];
  expenses?: ExpenseItem[];
}