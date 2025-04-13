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

interface EventDetailsProps {
  params: {
    eventId: string;
  };
}

interface Participant {
  id: string;
  name: string;
  email: string;
  amountPaid: number;
  paymentDueDate: Date | undefined;
}

const EventDetails: React.FC<EventDetailsProps> = ({params}) => {
  const {eventId} = params;
  const router = useRouter();

  const [participants, setParticipants] = useState<Participant[]>([
    {id: 'p1', name: 'John Doe', email: 'john.doe@example.com', amountPaid: 50, paymentDueDate: new Date('2024-08-10')},
    {id: 'p2', name: 'Jane Smith', email: 'jane.smith@example.com', amountPaid: 75, paymentDueDate: new Date('2024-08-15')},
  ]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [expenses, setExpenses] = useState([
    {id: 'e1', description: 'Venue Rental', amount: 500},
    {id: 'e2', description: 'Catering', amount: 300},
  ]);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [paymentDueDate, setPaymentDueDate] = useState<Date | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const totalAmountPaid = participants.reduce((sum, participant) => sum + participant.amountPaid, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalAmountPaid - totalExpenses;

  const handleAddParticipant = () => {
    if (newParticipantName && newParticipantEmail) {
      const newParticipant: Participant = {
        id: `p${participants.length + 1}`,
        name: newParticipantName,
        email: newParticipantEmail,
        amountPaid: 0,
        paymentDueDate: undefined,
      };
      setParticipants([...participants, newParticipant]);
      setNewParticipantName('');
      setNewParticipantEmail('');
    }
  };

  const handleAddExpense = () => {
    if (newExpenseDescription && newExpenseAmount) {
      const newExpense = {
        id: `e${expenses.length + 1}`,
        description: newExpenseDescription,
        amount: parseFloat(newExpenseAmount),
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

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4">
        <Button onClick={() => router.back()}>Back to Events</Button>
      </div>

      <div className="flex-1 p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Event Details - Event ID: {eventId}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="grid gap-4 mb-4">
              <div>
                <h4 className="text-lg font-semibold">Participants</h4>
                <ul className="list-none pl-0">
                  {participants.map(participant => (
                    <li key={participant.id} className="py-2 border-b border-border flex items-center justify-between">
                      <div>
                        {participant.name} ({participant.email}) - Paid: ${participant.amountPaid}
                        {participant.paymentDueDate && (
                          <span>
                            {' '}
                            - Due Date:{' '}
                            {format(participant.paymentDueDate, 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={'outline'} className={cn('justify-start text-left font-normal', !participant.paymentDueDate && 'text-muted-foreground')} onClick={() => handleSetPaymentDueDate(participant.id)}>
                              <Icons.calendar className="mr-2 h-4 w-4" />
                              {participant.paymentDueDate ? format(participant.paymentDueDate, 'MMM dd, yyyy') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start" side="bottom">
                            <Calendar mode="single" selected={paymentDueDate} onSelect={handleDateSelect} />
                          </PopoverContent>
                        </Popover>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteParticipant(participant.id)}>
                          <Icons.trash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex space-x-2 mt-2">
                  <Input type="text" placeholder="Participant Name" value={newParticipantName} onChange={(e) => setNewParticipantName(e.target.value)} />
                  <Input type="email" placeholder="Participant Email" value={newParticipantEmail} onChange={(e) => setNewParticipantEmail(e.target.value)} />
                  <Button size="sm" onClick={handleAddParticipant}>Add Participant</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-semibold">Expenses</h4>
                <ul className="list-none pl-0">
                  {expenses.map(expense => (
                    <li key={expense.id} className="py-2 border-b border-border">
                      {expense.description}: ${expense.amount}
                    </li>
                  ))}
                </ul>
                <div className="flex space-x-2 mt-2">
                  <Input type="text" placeholder="Expense Description" value={newExpenseDescription} onChange={(e) => setNewExpenseDescription(e.target.value)} />
                  <Input type="number" placeholder="Expense Amount" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} />
                  <Button size="sm" onClick={handleAddExpense}>Add Expense</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-semibold">Financial Overview</h4>
                <p>Total Amount Paid: ${totalAmountPaid}</p>
                <p>Total Expenses: ${totalExpenses}</p>
                <p>Balance: ${balance}</p>
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
    </div>
  );
};

export default EventDetails;
