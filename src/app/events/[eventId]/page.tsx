'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {format} from 'date-fns';
import {cn} from '@/lib/utils';
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
  email: string;
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

  const [participants, setParticipants] = useState<Participant[]>([
    {id: 'p1', name: 'John Doe', email: 'john.doe@example.com', amountOwed: 10000, amountPaid: 5000, paymentDueDate: new Date('2024-08-10'), isPaid: false},
    {id: 'p2', name: 'Jane Smith', email: 'jane.smith@example.com', amountOwed: 15000, amountPaid: 15000, paymentDueDate: new Date('2024-08-15'), isPaid: true},
  ]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantAmountOwed, setNewParticipantAmountOwed] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([
    {id: 'e1', description: 'Venue Rental', amount: 50000, isPaid: false},
    {id: 'e2', description: 'Catering', amount: 30000, isPaid: true},
  ]);
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
    if (newParticipantName && newParticipantEmail && newParticipantAmountOwed) {
      const newParticipant: Participant = {
        id: `p${participants.length + 1}`,
        name: newParticipantName,
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


  const handlePaymentStatusChange = (participantId: string, checked: boolean) => {
    setParticipants(
      participants.map(p =>
        p.id === participantId ? {...p, isPaid: checked} : p
      )
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
            <CardTitle>Event Details - Event ID: {eventId}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="grid gap-4 mb-4">
              <div>
                <h4 className="text-lg font-semibold">{t('Participants')}</h4>
                <ul className="list-none pl-0">
                  {participants.map(participant => (
                    <li key={participant.id} className="py-2 border-b border-border flex items-center justify-between">
                      <div>
                        {participant.name} ({participant.email}) - Owed: ¥{participant.amountOwed} - Paid: ¥{participant.amountPaid}
                        {participant.paymentDueDate && (
                          <span>
                            {' '}
                            - Due Date:{' '}
                            {format(participant.paymentDueDate, 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`paid-${participant.id}`} className="mr-2">
                          {t('Paid:')}
                        </Label>
                        <Checkbox
                          id={`paid-${participant.id}`}
                          checked={participant.isPaid}
                          onCheckedChange={(checked) => handlePaymentStatusChange(participant.id, !!checked)}
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={'outline'} className={cn('justify-start text-left font-normal', !participant.paymentDueDate && 'text-muted-foreground')} onClick={() => handleSetPaymentDueDate(participant.id)}>
                              <Icons.calendar className="mr-2 h-4 w-4" />
                              {participant.paymentDueDate ? format(participant.paymentDueDate, 'MMM dd, yyyy') : <span>{t('Pick a date')}</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start" side="bottom">
                            <Calendar mode="single" selected={paymentDueDate} onSelect={handleDateSelect} />
                          </PopoverContent>
                        </Popover>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteParticipant(participant.id)}>
                          <Icons.trash className="mr-2 h-4 w-4" />
                          {t('Delete')}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex space-x-2 mt-2">
                  <Input type="text" placeholder={t('Participant Name')} value={newParticipantName} onChange={(e) => setNewParticipantName(e.target.value)} />
                  <Input type="email" placeholder={t('Participant Email')} value={newParticipantEmail} onChange={(e) => setNewParticipantEmail(e.target.value)} />
                  <Input type="number" placeholder="Amount Owed (JPY)" value={newParticipantAmountOwed} onChange={(e) => setNewParticipantAmountOwed(e.target.value)} />
                  <Button size="sm" onClick={handleAddParticipant}>{t('Add Participant')}</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-semibold">{t('Expenses')}</h4>
                <ul className="list-none pl-0">
                  {expenses.map(expense => (
                    <li key={expense.id} className="py-2 border-b border-border flex items-center justify-between">
                      <div>
                        {expense.description}: ¥{expense.amount}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`expense-paid-${expense.id}`} className="mr-2">
                          {t('Paid:')}
                        </Label>
                        <Checkbox
                          id={`expense-paid-${expense.id}`}
                          checked={expense.isPaid}
                          onCheckedChange={(checked) => handleExpensePaymentStatusChange(expense.id, !!checked)}
                        />
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                          <Icons.trash className="mr-2 h-4 w-4" />
                          {t('Delete')}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex space-x-2 mt-2">
                  <Input type="text" placeholder={t('Expense Description')} value={newExpenseDescription} onChange={(e) => setNewExpenseDescription(e.target.value)} />
                  <Input type="number" placeholder={t('Expense Amount')} value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} />
                  <Button size="sm" onClick={handleAddExpense}>{t('Add Expense')}</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-semibold">{t('Financial Overview')}</h4>
                <p>{t('Total Amount Paid')}: ¥{totalAmountPaid}</p>
                <p>Total Expenses: ¥{totalExpenses}</p>
                <p>Balance: ¥{balance}</p>
              </div>
            </div>
          </CardContent>
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
