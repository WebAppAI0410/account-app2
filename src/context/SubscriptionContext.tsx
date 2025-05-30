'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// プランの種類
export type PlanType = 'free' | 'premium';

// プランごとの制限値を定義
interface PlanLimits {
  maxEvents: number;
  maxParticipants: number; 
  maxExpenseItems: number;
}

// プランごとの制限を設定
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxEvents: 3,        // 無料プランでは最大3つのイベント
    maxParticipants: 10, // 無料プランでは1イベントあたり最大10人の参加者
    maxExpenseItems: 10, // 無料プランでは1イベントあたり最大10つの費用項目
  },
  premium: {
    maxEvents: Infinity,  // 有料プランでは無制限
    maxParticipants: Infinity,
    maxExpenseItems: Infinity,
  },
};

// サブスクリプションの状態を表すインターフェース
interface SubscriptionState {
  currentPlan: PlanType;
  isPremium: boolean;
  expiryDate: Date | null;
  limits: PlanLimits;
  upgradeToPremium: () => Promise<void>;
  downgradeToFree: () => Promise<void>; // ダウングレード機能を追加
  restorePurchases: () => Promise<void>;
  checkLimits: {
    canCreateEvent: (currentCount: number) => boolean;
    canAddParticipant: (currentCount: number) => boolean;
    canAddExpenseItem: (currentCount: number) => boolean;
  };
}

// コンテキストのデフォルト値
const defaultSubscriptionState: SubscriptionState = {
  currentPlan: 'free',
  isPremium: false,
  expiryDate: null,
  limits: PLAN_LIMITS.free,
  upgradeToPremium: async () => {},
  downgradeToFree: async () => {}, // ダウングレード関数のデフォルト値
  restorePurchases: async () => {},
  checkLimits: {
    canCreateEvent: () => true,
    canAddParticipant: () => true,
    canAddExpenseItem: () => true,
  },
};

// コンテキストを作成
export const SubscriptionContext = createContext<SubscriptionState>(defaultSubscriptionState);

// サブスクリプションプロバイダーのプロパティ
interface SubscriptionProviderProps {
  children: ReactNode;
}

// サブスクリプションプロバイダーコンポーネント
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  // 現在のプラン状態（ローカルストレージから復元）
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  
  // アプリ起動時に保存されたプラン情報を読み込む
  useEffect(() => {
    // ローカルストレージから購入情報を取得
    const loadSubscriptionData = () => {
      try {
        const storedPlan = localStorage.getItem('subscriptionPlan');
        const storedExpiryDate = localStorage.getItem('subscriptionExpiryDate');
        
        if (storedPlan === 'premium') {
          setCurrentPlan('premium');
          
          if (storedExpiryDate) {
            const expiryDateObj = new Date(storedExpiryDate);
            setExpiryDate(expiryDateObj);
            
            // 有効期限が切れていたら無料プランに戻す
            if (expiryDateObj < new Date()) {
              setCurrentPlan('free');
              setExpiryDate(null);
              localStorage.removeItem('subscriptionPlan');
              localStorage.removeItem('subscriptionExpiryDate');
            }
          }
        }
      } catch (error) {
        console.error('サブスクリプション情報の読み込みに失敗しました:', error);
      }
    };
    
    loadSubscriptionData();
  }, []);
  
  // プレミアムプランへのアップグレード処理（将来的にはApp内課金APIと連携）
  const upgradeToPremium = async (): Promise<void> => {
    try {
      // 実際のアプリでは、ここでGoogle Play BillingやApp Store In-App Purchaseとの連携を行う
      
      // 開発用に、プレミアムプランへの切り替えをシミュレート
      setCurrentPlan('premium');
      
      // 有効期限を1ヶ月後に設定（開発用）
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      setExpiryDate(oneMonthLater);
      
      // ローカルストレージに保存
      localStorage.setItem('subscriptionPlan', 'premium');
      localStorage.setItem('subscriptionExpiryDate', oneMonthLater.toISOString());
      
      console.log('プレミアムプランへのアップグレードが完了しました（開発用）');
    } catch (error) {
      console.error('プレミアムプランへのアップグレードに失敗しました:', error);
      throw error;
    }
  };
  
  // ダウングレード処理（将来的にはApp内課金APIと連携）
  const downgradeToFree = async (): Promise<void> => {
    try {
      // 実際のアプリでは、ここでGoogle Play BillingやApp Store In-App Purchaseとの連携を行う
      
      // 開発用に、無料プランにダウングレード
      setCurrentPlan('free');
      setExpiryDate(null);
      
      // ローカルストレージから情報を削除
      localStorage.removeItem('subscriptionPlan');
      localStorage.removeItem('subscriptionExpiryDate');
      
      console.log('ダウングレードが完了しました（開発用）');
    } catch (error) {
      console.error('ダウングレードに失敗しました:', error);
      throw error;
    }
  };
  
  // 購入情報の復元処理（将来的にはApp内課金APIと連携）
  const restorePurchases = async (): Promise<void> => {
    try {
      // 実際のアプリでは、ここでGoogle Play BillingやApp Store In-App Purchaseとの連携を行う
      
      // 開発用に、保存されているプラン情報を読み込む
      const storedPlan = localStorage.getItem('subscriptionPlan');
      const storedExpiryDate = localStorage.getItem('subscriptionExpiryDate');
      
      if (storedPlan === 'premium' && storedExpiryDate) {
        const expiryDateObj = new Date(storedExpiryDate);
        
        // 有効期限内のみ復元
        if (expiryDateObj > new Date()) {
          setCurrentPlan('premium');
          setExpiryDate(expiryDateObj);
          console.log('購入情報を復元しました（開発用）');
        } else {
          console.log('サブスクリプションの有効期限が切れています');
        }
      } else {
        console.log('復元可能な購入情報がありません');
      }
    } catch (error) {
      console.error('購入情報の復元に失敗しました:', error);
      throw error;
    }
  };
  
  // 現在のプランに基づいた制限値
  const limits = PLAN_LIMITS[currentPlan];
  
  // 制限チェック関数
  const checkLimits = {
    canCreateEvent: (currentCount: number): boolean => {
      return currentCount < limits.maxEvents;
    },
    canAddParticipant: (currentCount: number): boolean => {
      return currentCount < limits.maxParticipants;
    },
    canAddExpenseItem: (currentCount: number): boolean => {
      return currentCount < limits.maxExpenseItems;
    }
  };
  
  // コンテキスト値の生成
  const value: SubscriptionState = {
    currentPlan,
    isPremium: currentPlan === 'premium',
    expiryDate,
    limits,
    upgradeToPremium,
    downgradeToFree,
    restorePurchases,
    checkLimits,
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// カスタムフック
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};