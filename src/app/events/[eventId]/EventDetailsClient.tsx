'use client'; // This is the Client Component

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import useTranslation from '@/hooks/use-translation';
import { useEvents, Participant, ExpenseItem } from '@/context/EventsContext'; // Participant, ExpenseItem をインポート
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

// Define the Event interface to match EventsContext
interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  collectionStartDate?: string;
  collectionEndDate?: string;
}

// Other interfaces
interface EventDetailsProps { params: { eventId: string; }; } // Keep this prop definition

// Helper function (keep as it is)
const formatSimpleDate = (dateStr: string | Date | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}/${month}/${day}`;
  } catch (e) {
    return typeof dateStr === 'string' ? dateStr : 'Invalid Date';
  }
};

// Rename the component slightly to avoid confusion
export default function EventDetailsClient({ params }: { params: { eventId: string } }) {
  // More robust parameter handling with detailed logging
  console.log('Raw params received in EventDetailsClient:', params);
  
  // Extract eventId with fallback to empty string and explicit type checking
  const eventId = params && typeof params === 'object' && 'eventId' in params ? String(params.eventId) : '';
  
  console.log('Extracted eventId:', eventId, 'Type:', typeof eventId, 'Length:', eventId.length);
  
  const router = useRouter();
  const { t } = useTranslation();
  const { events, updateEvent, addParticipant, deleteParticipant, addExpenseItem, deleteExpenseItem } = useEvents();
  
  // Log initial state to help diagnose issues
  console.log('Events from context:', events?.map(e => ({id: e.id, name: e.name})));

  // Get the current event and handle the case where events might be undefined
  const currentEvent = useMemo(() => {
    if (!events || !eventId) return undefined;
    
    // More detailed debug logging to help diagnose the issue
    console.log('EventDetailsClient - Looking for event:', {
      eventId: eventId,
      eventIdType: typeof eventId,
      availableIds: events.map(e => ({id: e.id, type: typeof e.id, name: e.name}))
    });
    
    // More robust ID comparison - convert both to strings
    return events.find(e => String(e.id) === String(eventId));
  }, [events, eventId]);
  
  // Add debug logging to help identify event loading issues
  useEffect(() => {
    console.log('EventDetailsClient: Current state:', { 
      eventId, 
      eventsLoaded: !!events,
      eventsCount: events?.length || 0,
      currentEventFound: !!currentEvent,
      eventDetails: currentEvent || 'Not found'
    });
  }, [eventId, events, currentEvent]);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStartDate, setEditedStartDate] = useState<Date | undefined>(undefined);
  const [editedEndDate, setEditedEndDate] = useState<Date | undefined>(undefined);

  // Participants/Expenses state
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantAmountOwed, setNewParticipantAmountOwed] = useState('');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseRemarks, setNewExpenseRemarks] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExpenseDeleteDialogOpen, setIsExpenseDeleteDialogOpen] = useState(false);
  const [isAddParticipantDialogOpen, setIsAddParticipantDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);

  // 反復処理確認ダイアログの状態
  const [isContinueDialogOpen, setIsContinueDialogOpen] = useState(false);
  const [continueProcessCallback, setContinueProcessCallback] = useState<(() => void) | null>(null);
  
  // 反復処理確認ダイアログを表示する関数
  const showContinueDialog = useCallback((callback: () => void) => {
    setContinueProcessCallback(() => callback);
    setIsContinueDialogOpen(true);
  }, []);

  // Initialize edit form effect
  // Helper function to safely parse YYYY-MM-DD string to Date, avoiding timezone issues
  const parseDateString = (dateString: string | undefined): Date | undefined => {
    if (!dateString) return undefined;
    // Append time to ensure parsing in local timezone context, then zero out time
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return undefined; // Invalid date check
    return date;
  };

  // Initialize edit form effect
  // 修正：Client-sideのみで実行される初期化処理（Hydrationエラー回避）
  useEffect(() => {
    if (currentEvent) {
      setEditedName(currentEvent.name);
      setEditedDescription(currentEvent.description);
      // Use safe parsing function
      setEditedStartDate(parseDateString(currentEvent.collectionStartDate));
      setEditedEndDate(parseDateString(currentEvent.collectionEndDate));
    }
  }, [currentEvent]);

  // Edit/Save/Cancel handlers
  const handleEditToggle = () => {
    if (isEditing && currentEvent) {
      // Format dates to YYYY-MM-DD string safely before updating
      const updatedData: Partial<Omit<Event, 'id'>> = {
        name: editedName,
        description: editedDescription,
        collectionStartDate: editedStartDate ? format(editedStartDate, 'yyyy-MM-dd') : undefined,
        collectionEndDate: editedEndDate ? format(editedEndDate, 'yyyy-MM-dd') : undefined,
      };
      updateEvent(eventId, updatedData);
    } else if (currentEvent) {
      setEditedName(currentEvent.name);
      setEditedDescription(currentEvent.description);
      setEditedStartDate(currentEvent.collectionStartDate ? new Date(currentEvent.collectionStartDate) : undefined);
      setEditedEndDate(currentEvent.collectionEndDate ? new Date(currentEvent.collectionEndDate) : undefined);
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // --- Handlers ---
  const handlePaymentStatusChange = (id: string, checked: boolean) => {
    if (!eventId) return;
    const updatedParticipants = participants.map(p =>
      p.id === id ? { ...p, isPaid: checked, amountPaid: checked ? p.amountOwed : 0 } : p
    );
    updateEvent(eventId, { participants: updatedParticipants });
  };

  const handleExpensePaymentStatusChange = (id: string, checked: boolean) => {
    if (!eventId) return;
    const updatedExpenses = expenses.map(e =>
      e.id === id ? { ...e, isPaid: checked } : e
    );
    updateEvent(eventId, { expenses: updatedExpenses });
  };

  const handleAmountPaidChange = (participantId: string, value: string) => {
    if (!eventId) return;
    const amount = parseFloat(value);
    const updatedParticipants = participants.map(p =>
      p.id === participantId ? { ...p, amountPaid: !isNaN(amount) ? amount : 0 } : p
    );
    updateEvent(eventId, { participants: updatedParticipants });
  };

  // 追加ハンドラをContext経由に修正
  const handleAddParticipant = () => {
    if (newParticipantName && newParticipantAmountOwed && eventId) {
      const success = addParticipant(eventId, {
        name: newParticipantName,
        email: newParticipantEmail,
        amountOwed: parseFloat(newParticipantAmountOwed),
        amountPaid: 0, // 初期値
        isPaid: false // 初期値
        // paymentDueDate はここでは設定しない
      });
      if (success) {
        setNewParticipantName('');
        setNewParticipantEmail('');
        setNewParticipantAmountOwed('');
        setIsAddParticipantDialogOpen(false);
      }
      // 失敗時のトースト通知はContext側で表示される
    }
  };

  // 削除ハンドラをContext経由に修正 (関数名をJSXに合わせる)
  const handleDeleteParticipant = (id: string) => {
    setSelectedParticipantId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteParticipant = () => {
    if (selectedParticipantId && eventId) {
      deleteParticipant(eventId, selectedParticipantId);
      setIsDeleteDialogOpen(false);
      setSelectedParticipantId(null);
    }
  };

  // 追加ハンドラをContext経由に修正
  const handleAddExpense = () => {
    if (newExpenseDescription && newExpenseAmount && eventId) {
      const success = addExpenseItem(eventId, {
        description: newExpenseDescription,
        amount: parseFloat(newExpenseAmount),
        remarks: newExpenseRemarks,
        isPaid: false // 初期値
      });
      if (success) {
        setNewExpenseDescription('');
        setNewExpenseAmount('');
        setNewExpenseRemarks('');
        setIsAddExpenseDialogOpen(false);
      }
    }
  };

  // 削除ハンドラをContext経由に修正 (関数名をJSXに合わせる)
  const handleDeleteExpense = (id: string) => {
    setSelectedExpenseId(id);
    setIsExpenseDeleteDialogOpen(true);
  };

  const confirmDeleteExpense = () => {
    if (selectedExpenseId && eventId) {
      deleteExpenseItem(eventId, selectedExpenseId);
      setIsExpenseDeleteDialogOpen(false);
      setSelectedExpenseId(null);
    }
  };

  // Initialize date select handler
  const handleSetPaymentDueDate = (id: string) => {
    setSelectedParticipantId(id);
    // 不要な setPaymentDueDate 呼び出しを削除
  };

  // 修正：ローカルの paymentDueDate を削除し、Contextの値を直接使用
  const handleDateSelect = (date: Date | undefined) => {
    if (!eventId || !selectedParticipantId) return;
    const updatedParticipants = participants.map(p =>
      p.id === selectedParticipantId ? { ...p, paymentDueDate: date } : p
    );
    updateEvent(eventId, { participants: updatedParticipants });
    setSelectedParticipantId(null); // ポップオーバーを閉じるためにリセット
  };

  // --- End of handlers ---

  // Enhanced loading and error states
  if (!currentEvent) {
    // If events are not loaded yet (undefined or null)
    if (!events) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-center text-muted-foreground">Loading event data...</p>
        </div>
      );
    }
    
    // If events are loaded but the specified event ID wasn't found
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p className="text-center font-medium">Event not found</p>
        <p className="text-center text-muted-foreground mt-2">The requested event (ID: {eventId}) does not exist</p>
        <Button 
          onClick={() => router.back()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Return to events list
        </Button>
      </div>
    );
  }

  // currentEventからリストを取得
  const participants: Participant[] = useMemo(() => currentEvent?.participants || [], [currentEvent]);
  const expenses: ExpenseItem[] = useMemo(() => currentEvent?.expenses || [], [currentEvent]);

  // Totals
  const totalAmountPaid = useMemo(() => {
    if (!participants || participants.length === 0) return 0;
    return participants.reduce((sum, p) => sum + (typeof p.amountPaid === 'number' && !isNaN(p.amountPaid) ? p.amountPaid : 0), 0);
  }, [participants]);

  const totalAmountOwed = useMemo(() => {
    if (!participants || participants.length === 0) return 0;
    return participants.reduce((sum, p) => sum + (typeof p.amountOwed === 'number' && !isNaN(p.amountOwed) ? p.amountOwed : 0), 0);
  }, [participants]);

  const totalExpenses = useMemo(() =>
    expenses.reduce((sum, e) => sum + (e.isPaid ? e.amount : 0), 0)
  , [expenses]);

  const balance = useMemo(() => totalAmountPaid - totalExpenses, [totalAmountPaid, totalExpenses]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 使い方ページやプランページと同じPageHeaderを使用 */}
      <PageHeader 
        title={currentEvent.name} 
        description={currentEvent.description || t('No description provided.')}
      />
      
      {/* 編集ボタン */}
      <div className="p-4 flex justify-end items-center">
        {isEditing && (
           <Button variant="outline" onClick={handleCancelEdit} className="mr-2">
             {t('Cancel')}
           </Button>
        )}
        <Button onClick={handleEditToggle}>
          {isEditing ? t('Save') : t('Edit')}
        </Button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 p-4 overflow-y-auto pb-[60px] md:pb-[100px]">
        <Card>
          <CardHeader>
            {/* Event Details - Editable */}
            {isEditing ? (
              <div className="space-y-3">
                 <div>
                   <Label htmlFor="eventNameEdit" className="text-xs text-muted-foreground">{t('Event Name')}</Label>
                   <Input id="eventNameEdit" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="text-lg font-semibold h-auto p-1 border-b focus-visible:ring-0 focus-visible:border-primary" />
                 </div>
                 <div>
                   <Label htmlFor="eventDescriptionEdit" className="text-xs text-muted-foreground">{t('Event Description')}</Label>
                   <Textarea id="eventDescriptionEdit" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} placeholder={t('Event description')} className="mt-1" />
                 </div>
                 <div>
                    <Label className="text-xs text-muted-foreground block mb-1">{t('Collection Period')}</Label>
                    <div className="flex gap-2 items-center flex-wrap">
                       <Popover>
                         <PopoverTrigger asChild>
                           <Button
                             variant="outline"
                             size="sm"
                             className={cn('w-[150px] justify-start text-left font-normal', !editedStartDate && 'text-muted-foreground')}
                           >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editedStartDate ? format(editedStartDate, 'PPP') : t('Pick a date')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={editedStartDate}
                              onSelect={setEditedStartDate}
                              initialFocus
                              disabled={(date) => // Disable dates after the end date
                                editedEndDate ? date > editedEndDate : false
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <span> - </span>
                       <Popover>
                         <PopoverTrigger asChild>
                           <Button
                             variant="outline"
                             size="sm"
                             className={cn('w-[150px] justify-start text-left font-normal', !editedEndDate && 'text-muted-foreground')}
                           >
                             <CalendarIcon className="mr-2 h-4 w-4" />
                             {editedEndDate ? format(editedEndDate, 'PPP') : t('Pick a date')}
                           </Button>
                         </PopoverTrigger>
                         <PopoverContent className="w-auto p-0">
                           <Calendar
                             mode="single"
                             selected={editedEndDate}
                             onSelect={setEditedEndDate}
                             initialFocus
                             disabled={(date) => editedStartDate ? date < editedStartDate : false}
                           />
                         </PopoverContent>
                       </Popover>
                    </div>
                 </div>
              </div>
            ) : (
              <>
                <CardTitle>{currentEvent.name}</CardTitle>
                <CardDescription>{currentEvent.description || t('No description provided.')}</CardDescription>
                <div className="text-sm text-muted-foreground mt-2">
                  <Icons.calendar className="mr-1 inline h-4 w-4" />
                  {t('Collection Period')}:{' '}
                  {formatSimpleDate(currentEvent.collectionStartDate)} - {formatSimpleDate(currentEvent.collectionEndDate)}
                </div>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-6 pt-4">

            {/* Participants Section */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">{t('Participants')}</h3>
                <Dialog open={isAddParticipantDialogOpen} onOpenChange={setIsAddParticipantDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Icons.plusCircle className="mr-2 h-4 w-4" />
                      {t('Add Participant')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                     <DialogHeader>
                       <DialogTitle>{t('Add New Participant')}</DialogTitle>
                     </DialogHeader>
                     <div className="grid gap-4 py-4">
                       <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="new-participant-name" className="text-right">
                           {t('Name')} <span className="text-red-500">*</span>
                         </Label>
                         <Input
                           id="new-participant-name"
                           type="text"
                           placeholder={t('Participant Name')}
                           value={newParticipantName}
                           onChange={(e) => setNewParticipantName(e.target.value)}
                           required
                           className="col-span-3"
                         />
                       </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="new-participant-contact" className="text-right">{t('Contact')}</Label>
                         <Input
                           id="new-participant-contact"
                           type="text"
                           placeholder={t('Participant Contact')}
                           value={newParticipantEmail}
                           onChange={(e) => setNewParticipantEmail(e.target.value)}
                           className="col-span-3"
                         />
                       </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="new-participant-amount" className="text-right">
                           {t('Amount Owed (JPY)')} <span className="text-red-500">*</span>
                         </Label>
                         <Input
                           id="new-participant-amount"
                           type="number"
                           placeholder={t('Amount Owed (JPY)')}
                           value={newParticipantAmountOwed}
                           onChange={(e) => setNewParticipantAmountOwed(e.target.value)}
                           required
                           className="col-span-3"
                         />
                       </div>
                     </div>
                     <DialogFooter>
                       <DialogClose asChild>
                         <Button variant="outline">{t('Cancel')}</Button>
                       </DialogClose>
                       <Button onClick={handleAddParticipant}>{t('Add Participant')}</Button>
                     </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('Name')}</TableHead>
                          <TableHead>{t('Contact')}</TableHead>
                          <TableHead className="text-right">{t('Amount Owed (JPY)')}</TableHead>
                          <TableHead className="text-right">{t('Amount Paid (JPY)')}</TableHead>
                          <TableHead>{t('Due Date')}</TableHead>
                          <TableHead className="text-center">{t('Paid Status')}</TableHead>
                          <TableHead className="text-right">{t('Actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participants.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                              {t('No participants added yet.')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          participants.map(p => (
                            <TableRow key={p.id}>
                              <TableCell>{p.name}</TableCell>
                              <TableCell>{p.email ?? '-'}</TableCell>
                              <TableCell className="text-right">¥{(p.amountOwed ?? 0).toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  // amountPaidManually を削除し、Contextの値を直接表示
                                  value={p.amountPaid !== undefined && p.amountPaid !== null ? p.amountPaid.toString() : '0'}
                                  onChange={(e) => handleAmountPaidChange(p.id, e.target.value)}
                                  className="h-8 w-24 text-right inline-block"
                                  min="0"
                                />
                              </TableCell>
                              <TableCell>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={cn('w-[150px] justify-start text-left font-normal', !p.paymentDueDate && 'text-muted-foreground')}
                                      onClick={() => handleSetPaymentDueDate(p.id)}
                                    >
                                      <Icons.calendar className="mr-2 h-4 w-4" />
                                      {p.paymentDueDate ? format(p.paymentDueDate, 'PPP') : t('Pick a date')}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start" side="bottom">
                                    <Calendar
                                      mode="single"
                                      // ローカルの paymentDueDate を削除し、Contextの値を直接使用
                                      selected={p.paymentDueDate}
                                      onSelect={handleDateSelect}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  id={`paid-${p.id}`}
                                  checked={p.isPaid}
                                  onCheckedChange={(checked) => handlePaymentStatusChange(p.id, !!checked)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  // 関数名を修正
                                  onClick={() => handleDeleteParticipant(p.id)}
                                >
                                  <Icons.trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Separator />

            {/* Expenses Section */}
            <section>
               <div className="flex justify-between items-center mb-3">
                 <h3 className="text-lg font-semibold">{t('Expenses')}</h3>
                 <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
                   <DialogTrigger asChild>
                     <Button size="sm">
                       <Icons.plusCircle className="mr-2 h-4 w-4" />
                       {t('Add Expense')}
                     </Button>
                   </DialogTrigger>
                   <DialogContent>
                     <DialogHeader>
                       <DialogTitle>{t('Add New Expense')}</DialogTitle>
                     </DialogHeader>
                     <div className="grid gap-4 py-4">
                       <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="new-expense-description" className="text-right">
                           {t('Description')} <span className="text-red-500">*</span>
                         </Label>
                         <Input
                           id="new-expense-description"
                           type="text"
                           placeholder={t('Expense Description')}
                           value={newExpenseDescription}
                           onChange={(e) => setNewExpenseDescription(e.target.value)}
                           required
                           className="col-span-3"
                         />
                       </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="new-expense-remarks" className="text-right">{t('Remarks')}</Label>
                         <Input
                           id="new-expense-remarks"
                           type="text"
                           placeholder={t('Remarks')}
                           value={newExpenseRemarks}
                           onChange={(e) => setNewExpenseRemarks(e.target.value)}
                           className="col-span-3"
                         />
                       </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="new-expense-amount" className="text-right">
                           {t('Expense Amount (JPY)')} <span className="text-red-500">*</span>
                         </Label>
                         <Input
                           id="new-expense-amount"
                           type="number"
                           placeholder={t('Expense Amount (JPY)')}
                           value={newExpenseAmount}
                           onChange={(e) => setNewExpenseAmount(e.target.value)}
                           required
                           className="col-span-3"
                         />
                       </div>
                     </div>
                     <DialogFooter>
                       <DialogClose asChild>
                         <Button variant="outline">{t('Cancel')}</Button>
                       </DialogClose>
                       <Button onClick={handleAddExpense}>{t('Add Expense')}</Button>
                     </DialogFooter>
                   </DialogContent>
                 </Dialog>
               </div>
               <Card>
                 <CardContent className="p-0">
                   <div className="overflow-x-auto">
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead>{t('Description')}</TableHead>
                           <TableHead>{t('Remarks')}</TableHead>
                           <TableHead className="text-right">{t('Expense Amount (JPY)')}</TableHead>
                           <TableHead className="text-center">{t('Paid Status')}</TableHead>
                           <TableHead className="text-right">{t('Actions')}</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {expenses.length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={5} className="text-center text-muted-foreground">
                               {t('No expenses added yet.')}
                             </TableCell>
                           </TableRow>
                         ) : (
                           expenses.map(expense => (
                             <TableRow key={expense.id}>
                               <TableCell>{expense.description}</TableCell>
                               <TableCell>{expense.remarks ?? '-'}</TableCell>
                               <TableCell className="text-right">¥{(expense.amount ?? 0).toLocaleString()}</TableCell>
                               <TableCell className="text-center">
                                 <Checkbox
                                   id={`expense-paid-${expense.id}`}
                                   checked={expense.isPaid}
                                   onCheckedChange={(checked) => handleExpensePaymentStatusChange(expense.id, !!checked)}
                                 />
                               </TableCell>
                               <TableCell className="text-right">
                                 <Button
                                   variant="ghost"
                                   size="icon"
                                   // 関数名を修正
                                   onClick={() => handleDeleteExpense(expense.id)}
                                 >
                                   <Icons.trash className="h-4 w-4" />
                                 </Button>
                               </TableCell>
                             </TableRow>
                           ))
                         )}
                       </TableBody>
                     </Table>
                   </div>
                 </CardContent>
               </Card>
            </section>

            <Separator />

            {/* Financial Overview Section */}
            <section>
              <h3 className="text-lg font-semibold mb-3">{t('Financial Overview')}</h3>
              <Card>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('Total Amount Owed (All Participants)')}</span>
                    <span className="font-medium">¥{(totalAmountOwed ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('Total Income (JPY)')}</span>
                    <span className="font-medium">¥{(totalAmountPaid ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('Total Expenses (JPY)')}</span>
                    <span className="font-medium">¥{(totalExpenses ?? 0).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>{t('Balance (Total Income - Total Expenses)')}</span>
                    <span className={cn(balance >= 0 ? 'text-green-600' : 'text-red-600')}>
                      ¥{(balance ?? 0).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </section>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialogs */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Delete Participant')}</AlertDialogTitle>
            <AlertDialogDescription>{t('Are you sure you want to delete this participant?')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            {/* 関数名を修正 */}
            <AlertDialogAction onClick={confirmDeleteParticipant}>{t('Confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isExpenseDeleteDialogOpen} onOpenChange={setIsExpenseDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Delete Expense')}</AlertDialogTitle>
            <AlertDialogDescription>{t('Are you sure you want to delete this expense?')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            {/* 関数名を修正 */}
            <AlertDialogAction onClick={confirmDeleteExpense}>{t('Confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
