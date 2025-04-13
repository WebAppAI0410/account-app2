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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Import Table components
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
      <div className="p-4">
        <Button onClick={() => router.back()}>{t('Back to Events')}</Button>
      </div>

      <div className="flex-1 p-4">
        <Card className="h-full">
          <CardHeader>
            {/* Simplified Card Title */}
            <CardTitle>{t('Event Details')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full space-y-6">
            {/* Participants Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('Participants')}</CardTitle>
                {/* Add Participant Button could go here or below table */}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Name')}</TableHead>
                      <TableHead>{t('Contact')}</TableHead> {/* Changed from Email */}
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
                          <TableCell>{participant.email ?? '-'}</TableCell> {/* Display email or dash if undefined */}
                          <TableCell className="text-right">¥{participant.amountOwed.toLocaleString()}</TableCell>
                          {/* Amount Paid Input */}
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
                {/* Add Participant Form */}
                 <div className="mt-4 p-4 border rounded-md">
                    <h5 className="text-md font-semibold mb-2">{t('Add New Participant')}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start"> {/* Use items-start for alignment */}
                      {/* Name Input (Required) */}
                      <div className="space-y-1">
                        <Label htmlFor="new-participant-name">{t('Participant Name')}</Label>
                        <Input id="new-participant-name" type="text" placeholder={t('Participant Name')} value={newParticipantName} onChange={(e) => setNewParticipantName(e.target.value)} required />
                      </div>
                      {/* Contact Input (Optional) */}
                      <div className="space-y-1">
                         <Label htmlFor="new-participant-contact">{t('Participant Contact')} <span className="text-xs text-muted-foreground">{t('Optional')}</span></Label>
                         <Input id="new-participant-contact" type="text" placeholder={t('Participant Contact')} value={newParticipantEmail} onChange={(e) => setNewParticipantEmail(e.target.value)} />
                      </div>
                      {/* Amount Owed Input (Required) */}
                      <div className="space-y-1">
                        <Label htmlFor="new-participant-amount">{t('Amount Owed (JPY)')}</Label>
                        <Input id="new-participant-amount" type="number" placeholder={t('Amount Owed (JPY)')} value={newParticipantAmountOwed} onChange={(e) => setNewParticipantAmountOwed(e.target.value)} required />
                      </div>
                      {/* Add Button - aligned with inputs */}
                      <Button onClick={handleAddParticipant} className="w-full md:w-auto self-end"> {/* Use self-end for alignment */}
                        <Icons.plusCircle className="mr-2 h-4 w-4" />
                       {t('Add Participant')}
                     </Button>
                   </div>
                 </div>
              </CardContent>
            </Card>

            {/* Separator removed as sections are now in Cards */}

            {/* Expenses Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('Expenses')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Description')}</TableHead>
                      <TableHead className="text-right">{t('Expense Amount (JPY)')}</TableHead> {/* Use specific key */}
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
                {/* Add Expense Form */}
                <div className="mt-4 p-4 border rounded-md">
                  <h5 className="text-md font-semibold mb-2">{t('Add New Expense')}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input type="text" placeholder={t('Expense Description')} value={newExpenseDescription} onChange={(e) => setNewExpenseDescription(e.target.value)} />
                    <Input type="number" placeholder={t('Expense Amount (JPY)')} value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} />
                    <Button onClick={handleAddExpense} className="w-full md:w-auto">
                      <Icons.plusCircle className="mr-2 h-4 w-4" />
                      {t('Add Expense')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t('Financial Overview')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('Total Amount Paid')}</span>
                  <span className="font-medium">¥{totalAmountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('Total Expenses')}</span>
                  <span className="font-medium">¥{totalExpenses.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>{t('Balance')}</span>
                  <span>¥{balance.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

          </CardContent>
          {/* Card Footer might not be needed if content fills height */}
        </Card>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Participant</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this participant?
          </AlertDialogDescription>
          <AlertDialogAction onClick={confirmDeleteParticipant}>Confirm</AlertDialogAction>
          <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isExpenseDeleteDialogOpen} onOpenChange={setIsExpenseDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Expense</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this expense?
          </AlertDialogDescription>
          <AlertDialogAction onClick={confirmDeleteExpense}>Confirm</AlertDialogAction>
          <AlertDialogCancel onClick={() => setIsExpenseDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventDetails;
