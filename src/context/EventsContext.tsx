'use client';

import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import useTranslation from '@/hooks/use-translation';
import { useSubscription } from '@/context/SubscriptionContext'; // サブスクリプションフックをインポート
import { toast } from '@/hooks/use-toast'; // トースト通知用

// Define the Event type (ensure this matches the type used elsewhere)
interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  collectionStartDate?: string;
  collectionEndDate?: string;
  participants?: Participant[]; // 参加者リスト
  expenses?: ExpenseItem[]; // 費用項目リスト
}

// 参加者の型定義
interface Participant {
  id: string;
  name: string;
  // その他の参加者情報
}

// 費用項目の型定義
interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  // その他の費用項目情報
}

// Define the shape of the context data
interface EventsContextType {
  events: Event[];
  setEvents: Dispatch<SetStateAction<Event[]>>;
  addEvent: (newEventData: Omit<Event, 'id'>) => boolean; // 戻り値を追加（成功/失敗）
  deleteEvent: (eventId: string) => void;
  updateEvent: (eventId: string, updatedData: Partial<Omit<Event, 'id'>>) => void;
  addParticipant: (eventId: string, participant: Omit<Participant, 'id'>) => boolean; // 参加者追加
  deleteParticipant: (eventId: string, participantId: string) => void; // 参加者削除
  addExpenseItem: (eventId: string, expense: Omit<ExpenseItem, 'id'>) => boolean; // 費用項目追加
  deleteExpenseItem: (eventId: string, expenseId: string) => void; // 費用項目削除
}

// Create the context with a default value (can be undefined or null initially)
const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Helper function to format dates to YYYY/MM/DD format (copied from page.tsx)
const formatSimpleDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}/${month}/${day}`;
};


// Create the Provider component
interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const { checkLimits, currentPlan, limits } = useSubscription(); // サブスクリプション情報を取得

  // Define initial state with clearer identifiers
   const initialEventsData: Event[] = [
    {
      id: '1',
      name: '飲み会', // Use direct string
      date: '2025/3/25', 
      description: '4/3の新歓用', // Use direct string
      collectionStartDate: '2025-03-25',
      collectionEndDate: '2025-04-03',
      participants: [
        { id: 'p1', name: '山田太郎' },
        { id: 'p2', name: '佐藤次郎' }
      ],
      expenses: [
        { id: 'e1', name: '会場費', amount: 10000 },
        { id: 'e2', name: '飲食費', amount: 30000 }
      ]
    },
  ];

  // localStorage からイベントデータを読み込む
  const loadEventsFromStorage = () => {
    try {
      const storedEvents = localStorage.getItem('events');
      if (storedEvents) {
        return JSON.parse(storedEvents);
      }
    } catch (error) {
      console.error('Failed to load events from localStorage:', error);
    }
    return initialEventsData;
  };

  const [events, setEvents] = useState<Event[]>(loadEventsFromStorage);
  
  // イベントデータが変更されたら localStorage に保存
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
    
    if (process.env.NODE_ENV === 'development') {
      console.log('EventsContext: Events saved:', events.map(e => ({id: e.id, name: e.name})));
    }
  }, [events]);

  // Debug logging for events data
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('EventsContext: Events loaded:', events.map(e => ({id: e.id, name: e.name})));
    }
  }, [events]);

  // イベント追加（プラン制限チェック付き）
  const addEvent = (newEventData: Omit<Event, 'id'>): boolean => {
    // イベント数の制限をチェック
    if (!checkLimits.canCreateEvent(events.length)) {
      toast({
        title: "制限に達しました",
        description: `無料プランでは最大${limits.maxEvents}個のイベントまでしか作成できません。プレミアムにアップグレードすると制限なく作成できます。`,
        variant: "destructive"
      });
      return false; // 制限超過なので失敗
    }

    const eventWithId: Event = {
      ...newEventData,
      id: String(Date.now()), // Simple ID generation
      date: newEventData.date || formatSimpleDate(new Date()),
      participants: newEventData.participants || [],
      expenses: newEventData.expenses || []
    };
    setEvents((prevEvents) => [...prevEvents, eventWithId]);
    return true; // 成功
  };

  // イベント削除
  const deleteEvent = (eventId: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
  };

  // イベント更新
  const updateEvent = (eventId: string, updatedData: Partial<Omit<Event, 'id'>>) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, ...updatedData } : event
      )
    );
  };

  // 参加者追加（プラン制限チェック付き）
  const addParticipant = (eventId: string, participant: Omit<Participant, 'id'>): boolean => {
    const event = events.find(e => e.id === eventId);
    if (!event) return false;
    
    const currentParticipants = event.participants || [];
    
    // 参加者数の制限をチェック
    if (!checkLimits.canAddParticipant(currentParticipants.length)) {
      toast({
        title: "制限に達しました",
        description: `無料プランでは1イベントあたり最大${limits.maxParticipants}人の参加者までしか追加できません。プレミアムにアップグレードすると制限なく追加できます。`,
        variant: "destructive"
      });
      return false; // 制限超過なので失敗
    }

    const participantWithId: Participant = {
      ...participant,
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setEvents(prevEvents => 
      prevEvents.map(e => 
        e.id === eventId 
          ? { 
              ...e, 
              participants: [...(e.participants || []), participantWithId] 
            }
          : e
      )
    );
    return true; // 成功
  };

  // 参加者削除
  const deleteParticipant = (eventId: string, participantId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(e => 
        e.id === eventId 
          ? { 
              ...e, 
              participants: (e.participants || []).filter(p => p.id !== participantId)
            }
          : e
      )
    );
  };

  // 費用項目追加（プラン制限チェック付き）
  const addExpenseItem = (eventId: string, expense: Omit<ExpenseItem, 'id'>): boolean => {
    const event = events.find(e => e.id === eventId);
    if (!event) return false;
    
    const currentExpenses = event.expenses || [];
    
    // 費用項目数の制限をチェック
    if (!checkLimits.canAddExpenseItem(currentExpenses.length)) {
      toast({
        title: "制限に達しました",
        description: `無料プランでは1イベントあたり最大${limits.maxExpenseItems}個の費用項目までしか追加できません。プレミアムにアップグレードすると制限なく追加できます。`,
        variant: "destructive"
      });
      return false; // 制限超過なので失敗
    }

    const expenseWithId: ExpenseItem = {
      ...expense,
      id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setEvents(prevEvents => 
      prevEvents.map(e => 
        e.id === eventId 
          ? { 
              ...e, 
              expenses: [...(e.expenses || []), expenseWithId] 
            }
          : e
      )
    );
    return true; // 成功
  };

  // 費用項目削除
  const deleteExpenseItem = (eventId: string, expenseId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(e => 
        e.id === eventId 
          ? { 
              ...e, 
              expenses: (e.expenses || []).filter(exp => exp.id !== expenseId)
            }
          : e
      )
    );
  };

  return (
    <EventsContext.Provider value={{ 
      events, 
      setEvents, 
      addEvent, 
      deleteEvent, 
      updateEvent,
      addParticipant,
      deleteParticipant,
      addExpenseItem,
      deleteExpenseItem
    }}>
      {children}
    </EventsContext.Provider>
  );
};

// Create a custom hook for easy context consumption
export const useEvents = (): EventsContextType => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};
