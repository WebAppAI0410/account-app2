
'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog'; // Import Dialog components
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {Icons} from '@/components/icons';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';
import {Checkbox} from '@/components/ui/checkbox';
import useTranslation from '@/hooks/use-translation';

interface EventDetailsProps {
  params: {
    eventId: string;
  };
}

interface Participant {
  id: string;
  name: string;
  email?: string; // Make email optional
  amountOwed: number;
  amountPaid: number;
  paymentDueDate: Date | undefined;
  isPaid: boolean;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  isPaid: boolean;
}

const EventDetails: React.FC<EventDetailsProps> = ({params}) => {
  const {eventId} = params;
  const router = useRouter();
  const { t } = useTranslation();

  // Initialize participants and expenses with empty arrays
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantAmountOwed, setNewParticipantAmountOwed] = useState('');
  // Initialize participants and expenses with empty arrays
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [paymentDueDate, setPaymentDueDate] = useState<Date | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExpenseDeleteDialogOpen, setIsExpenseDeleteDialogOpen] = useState(false);
  const [isAddParticipantDialogOpen, setIsAddParticipantDialogOpen] = useState(false); // State for Add Participant Dialog
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false); // State for Add Expense Dialog

  const totalAmountPaid = participants.reduce((sum, participant) => sum + (participant.isPaid ? participant.amountPaid : 0), 0);
  const totalAmountOwed = participants.reduce((sum, participant) => sum + participant.amountOwed, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalAmountPaid - totalExpenses;

  const handleAddParticipant = () => {
    // Only require name and amount owed
    if (newParticipantName && newParticipantAmountOwed) {
      const newParticipant: Participant = {
        id: `p${participants.length + 1}`,
        name: newParticipantName,
        // Add email only if provided
        ...(newParticipantEmail && { email: newParticipantEmail }),
        email: newParticipantEmail,
        amountOwed: parseFloat(newParticipantAmountOwed),
        amountPaid: 0,
        paymentDueDate: undefined,
        isPaid: false,
      };
      setParticipants([...participants, newParticipant]);
      setNewParticipantName('');
      setNewParticipantEmail('');
      setNewParticipantAmountOwed('');
      setIsAddParticipantDialogOpen(false); // Close dialog on success
    }
  };

  const handleAddExpense = () => {
    if (newExpenseDescription && newExpenseAmount) {
      const newExpense: Expense = {
        id: `e${expenses.length + 1}`,
        description: newExpenseDescription,
        amount: parseFloat(newExpenseAmount),
        isPaid: false,
      };
      setExpenses([...expenses, newExpense]);
      setNewExpenseDescription('');
      setNewExpenseAmount('');
      setIsAddExpenseDialogOpen(false); // Close dialog on success
    }
  };

  const handleSetPaymentDueDate = (participantId: string) => {
    setSelectedParticipantId(participantId);
    const participant = participants.find(p => p.id === participantId);
    setPaymentDueDate(participant?.paymentDueDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (selectedParticipantId) {
      setParticipants(participants.map(p => p.id === selectedParticipantId ? {...p, paymentDueDate: date} : p));
    }
    setPaymentDueDate(date);
    setSelectedParticipantId(null);
  };

  const handleDeleteParticipant = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteParticipant = () => {
    if (selectedParticipantId) {
      setParticipants(participants.filter(p => p.id !== selectedParticipantId));
      setIsDeleteDialogOpen(false);
      setSelectedParticipantId(null);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsExpenseDeleteDialogOpen(true);
  };

  const confirmDeleteExpense = () => {
    if (selectedExpenseId) {
      setExpenses(expenses.filter(e => e.id !== selectedExpenseId));
      setIsExpenseDeleteDialogOpen(false);
      setSelectedExpenseId(null);
    }
  };

  // Handler for changing the amount paid input
  const handleAmountPaidChange = (participantId: string, value: string) => {
    const amount = parseFloat(value) || 0; // Convert to number, default to 0 if invalid
    setParticipants(
      participants.map(p =>
        p.id === participantId ? { ...p, amountPaid: amount } : p
      )
    );
  };

  const handlePaymentStatusChange = (participantId: string, checked: boolean) => {
    setParticipants(
      participants.map(p => {
        if (p.id === participantId) {
          // If checked, set isPaid to true and amountPaid to amountOwed
          // If unchecked, only set isPaid to false
          return {
            ...p,
            isPaid: checked,
            amountPaid: checked ? p.amountOwed : p.amountPaid // Auto-fill amountPaid only when checking the box
          };
        }
        return p;
      })
    );
  };

  const handleExpensePaymentStatusChange = (expenseId: string, checked: boolean) => {
    setExpenses(
      expenses.map(e =>
        e.id === expenseId ? {...e, isPaid: checked} : e
      )
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Back Button */}
      <div className="p-4">
        <Button onClick={() => router.back()}>{t('Back to Events')}</Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t('Event Details')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full space-y-4">

            {/* Participants Section */}
            <section className="space-y-4"> {/* Increased spacing */}
              <div className="flex justify-between items-center"> {/* Header with Add Button */}
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
                      {/* Name Input (Required) */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-participant-name" className="text-right">{t('Name')}</Label>
                        <Input id="new-participant-name" type="text" placeholder={t('Participant Name')} value={newParticipantName} onChange={(e) => setNewParticipantName(e.target.value)} required className="col-span-3" />
                      </div>
                      {/* Contact Input (Optional) */}
                      <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="new-participant-contact" className="text-right">{t('Contact')} <span className="text-xs text-muted-foreground">({t('Optional')})</span></Label>
                         <Input id="new-participant-contact" type="text" placeholder={t('Participant Contact')} value={newParticipantEmail} onChange={(e) => setNewParticipantEmail(e.target.value)} className="col-span-3" />
                      </div>
                      {/* Amount Owed Input (Required) */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-participant-amount" className="text-right">{t('Amount Owed (JPY)')}</Label>
                        <Input id="new-participant-amount" type="number" placeholder={t('Amount Owed (JPY)')} value={newParticipantAmountOwed} onChange={(e) => setNewParticipantAmountOwed(e.target.value)} required className="col-span-3" />
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
              <Card> {/* Wrap table in Card for better visual grouping */}
                <CardContent className="p-0"> {/* Remove Card padding for table */}
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
                        <TableCell colSpan={7} className="text-center text-muted-foreground">{t('No participants added yet.')}</TableCell>
                      </TableRow>
                    ) : (
                      participants.map(participant => (
                        <TableRow key={participant.id}>
                          <TableCell>{participant.name}</TableCell>
                          <TableCell>{participant.email ?? '-'}</TableCell>
                          <TableCell className="text-right">¥{participant.amountOwed.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                             <Input
                               type="number"
                               value={participant.amountPaid}
                               onChange={(e) => handleAmountPaidChange(participant.id, e.target.value)}
                               className="h-8 w-24 text-right" // Adjust size as needed
                               min="0" // Prevent negative numbers
                             />
                          </TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant={'outline'} size="sm" className={cn('w-[150px] justify-start text-left font-normal', !participant.paymentDueDate && 'text-muted-foreground')} onClick={() => handleSetPaymentDueDate(participant.id)}>
                                  <Icons.calendar className="mr-2 h-4 w-4" />
                                  {participant.paymentDueDate ? format(participant.paymentDueDate, 'PPP') : <span>{t('Pick a date')}</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                                <Calendar mode="single" selected={selectedParticipantId === participant.id ? paymentDueDate : participant.paymentDueDate} onSelect={handleDateSelect} />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              id={`paid-${participant.id}`}
                              checked={participant.isPaid}
                              onCheckedChange={(checked) => handlePaymentStatusChange(participant.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                             <Button variant="ghost" size="icon" onClick={() => handleDeleteParticipant(participant.id)}>
                               <Icons.trash className="h-4 w-4" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            <Separator />

            {/* Expenses Section */}
            <section className="space-y-4"> {/* Increased spacing */}
               <div className="flex justify-between items-center"> {/* Header with Add Button */}
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
                       {/* Description Input */}
                       <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="new-expense-description" className="text-right">{t('Description')}</Label>
                         <Input id="new-expense-description" type="text" placeholder={t('Expense Description')} value={newExpenseDescription} onChange={(e) => setNewExpenseDescription(e.target.value)} className="col-span-3" />
                       </div>
                        {/* Amount Input */}
                       <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="new-expense-amount" className="text-right">{t('Expense Amount (JPY)')}</Label> {/* Changed key */}
                         <Input id="new-expense-amount" type="number" placeholder={t('Expense Amount (JPY)')} value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} className="col-span-3" />
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
               <Card> {/* Wrap table in Card */}
                 <CardContent className="p-0"> {/* Remove Card padding */}
                   <Table>
                     <TableHeader>
                    <TableRow>
                      <TableHead>{t('Description')}</TableHead>
                      <TableHead className="text-right">{t('Expense Amount (JPY)')}</TableHead>
                      <TableHead className="text-center">{t('Paid Status')}</TableHead>
                      <TableHead className="text-right">{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={4} className="text-center text-muted-foreground">{t('No expenses added yet.')}</TableCell>
                       </TableRow>
                    ) : (
                      expenses.map(expense => (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="text-right">¥{expense.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              id={`expense-paid-${expense.id}`}
                              checked={expense.isPaid}
                              onCheckedChange={(checked) => handleExpensePaymentStatusChange(expense.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                              <Icons.trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                     </TableBody>
                   </Table>
                 </CardContent>
               </Card>
            </section>

            <Separator />

            {/* Financial Overview Section */}
            <section className="space-y-4"> {/* Increased spacing */}
              <h3 className="text-lg font-semibold">{t('Financial Overview')}</h3>
              <Card> {/* Wrap overview in Card */}
                <CardContent className="space-y-3 pt-4"> {/* Add padding top */}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('Total Amount Paid')}</span>
                    <span className="font-medium">¥{totalAmountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('Total Amount Owed (All Participants)')}</span> {/* Added Total Owed */}
                    <span className="font-medium">¥{totalAmountOwed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('Total Expenses')}</span>
                    <span className="font-medium">¥{totalExpenses.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>{t('Balance')}</span>
                    <span className={cn(balance >= 0 ? 'text-green-600' : 'text-red-600')}> {/* Conditional color */}
                      ¥{balance.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </section>

          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog for Participants */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>{t('Delete Participant')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('Are you sure you want to delete this participant?')}
          </AlertDialogDescription>
          <AlertDialogAction onClick={confirmDeleteParticipant}>{t('Confirm')}</AlertDialogAction>
          <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>{t('Cancel')}</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog for Expenses */}
      <AlertDialog open={isExpenseDeleteDialogOpen} onOpenChange={setIsExpenseDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>{t('Delete Expense')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('Are you sure you want to delete this expense?')}
          </AlertDialogDescription>
          <AlertDialogAction onClick={confirmDeleteExpense}>{t('Confirm')}</AlertDialogAction>
          <AlertDialogCancel onClick={() => setIsExpenseDeleteDialogOpen(false)}>{t('Cancel')}</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventDetails;
