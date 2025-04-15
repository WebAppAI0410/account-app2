'use client'; // This is the Client Component

import React, { useState, useEffect, useMemo } from 'react';
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
import { useEvents } from '@/context/EventsContext';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';

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
interface Participant { id: string; name: string; email?: string; amountOwed: number; amountPaid: number; paymentDueDate: Date | undefined; isPaid: boolean; }
interface Expense { id: string; description: string; amount: number; remarks?: string; isPaid: boolean; }

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
const EventDetailsClient: React.FC<EventDetailsProps> = ({ params }) => {
  // Access eventId directly from params in a Client Component page
  const { eventId } = params;
  const router = useRouter();
  const { t } = useTranslation();
  const { events, updateEvent } = useEvents();

  // Get the current event and handle the case where events might be undefined
  const currentEvent = useMemo(() =>
    events ? events.find(e => e.id === eventId) : undefined
  , [events, eventId]);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStartDate, setEditedStartDate] = useState<Date | undefined>(undefined);
  const [editedEndDate, setEditedEndDate] = useState<Date | undefined>(undefined);

  // Participants/Expenses state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantAmountOwed, setNewParticipantAmountOwed] = useState('');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseRemarks, setNewExpenseRemarks] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [paymentDueDate, setPaymentDueDate] = useState<Date | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExpenseDeleteDialogOpen, setIsExpenseDeleteDialogOpen] = useState(false);
  const [isAddParticipantDialogOpen, setIsAddParticipantDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [amountPaidManually, setAmountPaidManually] = useState<Record<string, string>>({});

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
  useEffect(() => {
    if (currentEvent) {
      setEditedName(currentEvent.name);
      setEditedDescription(currentEvent.description);
      // Use safe parsing function
      setEditedStartDate(parseDateString(currentEvent.collectionStartDate));
      setEditedEndDate(parseDateString(currentEvent.collectionEndDate));
      setParticipants([]); // Reset participants on event change
      setExpenses([]); // Reset expenses on event change
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
  const handleAmountPaidChange = (participantId: string, value: string) => {
    setAmountPaidManually({...amountPaidManually, [participantId]: value});
  };

  useEffect(() => {
    if (participants.length > 0) {
      setParticipants(prev => prev.map(p => {
        const manualAmountStr = amountPaidManually[p.id];
        if (manualAmountStr !== undefined) {
          const manualAmountNum = parseFloat(manualAmountStr);
          return { ...p, amountPaid: !isNaN(manualAmountNum) ? manualAmountNum : p.amountPaid };
        }
        return p;
      }));
    }
  }, [amountPaidManually, participants]);

  // Totals
  const totalAmountPaid = useMemo(() =>
    participants.length > 0 ? participants.reduce((sum, p) => sum + p.amountPaid, 0) : 0
  , [participants]);

  const totalAmountOwed = useMemo(() =>
    participants.length > 0 ? participants.reduce((sum, p) => sum + p.amountOwed, 0) : 0
  , [participants]);

  const totalExpenses = useMemo(() =>
    expenses.length > 0 ? expenses.reduce((sum, e) => sum + (e.isPaid ? e.amount : 0), 0) : 0
  , [expenses]);

  const balance = useMemo(() => totalAmountPaid - totalExpenses, [totalAmountPaid, totalExpenses]);

  const handleAddParticipant = () => {
    if (newParticipantName && newParticipantAmountOwed) {
      const newP: Participant = {
        id: String(Date.now()),
        name: newParticipantName,
        email: newParticipantEmail,
        amountOwed: parseFloat(newParticipantAmountOwed),
        amountPaid: 0,
        paymentDueDate: undefined,
        isPaid: false
      };
      setParticipants(prev => [...prev, newP]);
      setNewParticipantName('');
      setNewParticipantEmail('');
      setNewParticipantAmountOwed('');
      setIsAddParticipantDialogOpen(false);
    }
  };

  const handleAddExpense = () => {
    if (newExpenseDescription && newExpenseAmount) {
      const newE: Expense = {
        id: String(Date.now()),
        description: newExpenseDescription,
        amount: parseFloat(newExpenseAmount),
        ...(newExpenseRemarks && { remarks: newExpenseRemarks }),
        isPaid: false
      };
      setExpenses(prev => [...prev, newE]);
      setNewExpenseDescription('');
      setNewExpenseAmount('');
      setNewExpenseRemarks('');
      setIsAddExpenseDialogOpen(false);
    }
  };

  const handleSetPaymentDueDate = (id: string) => {
    setSelectedParticipantId(id);
    const p = participants.find(p => p.id === id);
    setPaymentDueDate(p?.paymentDueDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (selectedParticipantId) {
      setParticipants(ps => ps.map(p => p.id === selectedParticipantId ? {...p, paymentDueDate: date} : p));
    }
    setPaymentDueDate(date);
    setSelectedParticipantId(null);
  };

  const handleDeleteParticipant = (id: string) => {
    setSelectedParticipantId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteParticipant = () => {
    if (selectedParticipantId) {
      setParticipants(ps => ps.filter(p => p.id !== selectedParticipantId));
      setIsDeleteDialogOpen(false);
      setSelectedParticipantId(null);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setSelectedExpenseId(id);
    setIsExpenseDeleteDialogOpen(true);
  };

  const confirmDeleteExpense = () => {
    if (selectedExpenseId) {
      setExpenses(es => es.filter(e => e.id !== selectedExpenseId));
      setIsExpenseDeleteDialogOpen(false);
      setSelectedExpenseId(null);
    }
  };

  const handlePaymentStatusChange = (id: string, checked: boolean) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === id) {
        const newPaid = checked ? p.amountOwed : 0;
        setAmountPaidManually(man => ({ ...man, [id]: String(newPaid) }));
        return { ...p, isPaid: checked, amountPaid: newPaid };
      }
      return p;
    }));
  };

  const handleExpensePaymentStatusChange = (id: string, checked: boolean) => {
    setExpenses(prev => prev.map((e: Expense) => e.id === id ? { ...e, isPaid: checked } : e));
  };
  // --- End of handlers ---

  if (!currentEvent) {
    return <div className="p-4">Loading event details or event not found...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <div className="p-4 flex justify-between items-center border-b sticky top-0 bg-background z-10">
        <Button onClick={() => router.back()}>{t('Back to Events')}</Button>
        <div>
          {isEditing && (
             <Button variant="outline" onClick={handleCancelEdit} className="mr-2">
               {t('Cancel')}
             </Button>
          )}
          <Button onClick={handleEditToggle}>
            {isEditing ? t('Save') : t('Edit')}
          </Button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 p-4 overflow-y-auto">
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
                              <TableCell className="text-right">¥{p.amountOwed.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  value={amountPaidManually[p.id] ?? p.amountPaid.toString()}
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
                                      selected={selectedParticipantId === p.id ? paymentDueDate : p.paymentDueDate}
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
                               <TableCell className="text-right">¥{expense.amount.toLocaleString()}</TableCell>
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
                    <span className="font-medium">¥{totalAmountOwed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('Total Income (JPY)')}</span>
                    <span className="font-medium">¥{totalAmountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('Total Expenses (JPY)')}</span>
                    <span className="font-medium">¥{totalExpenses.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>{t('Balance (Total Income - Total Expenses)')}</span>
                    <span className={cn(balance >= 0 ? 'text-green-600' : 'text-red-600')}>
                      ¥{balance.toLocaleString()}
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
            <AlertDialogAction onClick={confirmDeleteExpense}>{t('Confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventDetailsClient; // Export the client component
