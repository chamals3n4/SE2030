import { useEffect, useState } from 'react'
import { useAuthContext } from '@asgardeo/auth-react'
import { useSearchParams } from 'react-router-dom'
import { financeAPI, projectAPI } from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function ProjectFinance() {
    const [searchParams] = useSearchParams()
    const [summary, setSummary] = useState(null)
    const [entries, setEntries] = useState([])
    const [dates, setDates] = useState({ start: '', end: '' })
    const [form, setForm] = useState({ type: 'CAPITAL_RECEIPT', amount: '', description: '', reference: '', entryDate: '' })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editOpen, setEditOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    const projectId = searchParams.get('projectId')
    const { state } = useAuthContext()
    useAuth()

    const load = async () => {
        try {
            setLoading(true)
            setError('')
            // small delay to ensure token is set by useAuth()
            if (state.isAuthenticated) {
                await new Promise(res => setTimeout(res, 100))
            }
            let pid = projectId
            if (!pid) {
                const all = await projectAPI.getAll()
                const first = (all?.data || [])[0]
                if (!first) {
                    setSummary(null)
                    setEntries([])
                    setError('No projects found. Create a project first.')
                    return
                }
                pid = first.projectId
            }
            const [sumRes, listRes] = await Promise.all([
                financeAPI.summary(pid),
                financeAPI.getByProject(pid)
            ])
            setSummary(sumRes?.data)
            setEntries(listRes?.data || [])
        } catch (e) {
            setError('Failed to load finance data')
            setEntries([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (state.isAuthenticated && !state.isLoading) {
            load()
        }
    }, [state.isAuthenticated, state.isLoading, projectId, dates.start, dates.end])

    const onCreate = async (e) => {
        e.preventDefault()
        try {
            let pid = projectId
            if (!pid) {
                const all = await projectAPI.getAll()
                const first = (all?.data || [])[0]
                if (!first) {
                    setError('No projects found. Create a project first.')
                    return
                }
                pid = first.projectId
            }
            await financeAPI.create({
                ...form,
                amount: parseFloat(form.amount),
                project: { projectId: parseInt(pid) }
            })
            setForm({ type: 'CAPITAL_RECEIPT', amount: '', description: '', reference: '', entryDate: '' })
            await load()
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to add entry')
        }
    }

    const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n || 0))

    if (state.isLoading) return <div className="p-6">Authenticating...</div>
    if (loading) return <div className="p-6">Loading...</div>

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    {
                        title: "Budget",
                        value: summary?.budget,
                        bgColor: "bg-gray-50",
                        textColor: "text-gray-900"
                    },
                    {
                        title: "Capital Received",
                        value: summary?.totalCapital,
                        bgColor: "bg-green-100",
                        textColor: "text-green-700"
                    },
                    {
                        title: "Total Expense",
                        value: summary?.totalExpense,
                        bgColor: "bg-red-100",
                        textColor: "text-red-700"
                    },
                    {
                        title: "Balance",
                        value: summary?.balance,
                        bgColor: "bg-gray-50",
                        textColor: Number(summary?.balance || 0) < 0 ? "text-red-700" : "text-gray-900"
                    }
                ].map((item, index) => (
                    <Card key={index} className="shadow-none border-2 border-red-200 transition-all duration-800 hover:border-red-400">
                        <CardContent className="px-3 py-1">
                            <div className="flex items-center space-x-3">
                                <div className={`p-1.5 rounded-lg ${item.bgColor}`} />
                                <div className="flex-1">
                                    <p className="text-md font-medium text-gray-500 uppercase tracking-wide">{item.title}</p>
                                    <p className={`text-xl font-bold ${item.textColor}`}>{fmt(item.value)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-none">
                <CardHeader><CardTitle>Add Finance Entry</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div className="md:col-span-2">
                            <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                                <SelectTrigger className="w-full min-w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="min-w-[220px]">
                                    <SelectItem value="CAPITAL_RECEIPT">Capital</SelectItem>
                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Input placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                        <Input placeholder="Reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
                        <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {form.entryDate ? new Date(form.entryDate).toLocaleDateString() : 'Pick date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={form.entryDate ? new Date(form.entryDate) : undefined}
                                    onSelect={(date) => setForm({ ...form, entryDate: date ? date.toISOString().slice(0, 10) : '' })}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button type="submit" disabled={!form.amount || !form.entryDate}>Add</Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="shadow-none">
                <CardHeader><CardTitle>Entries</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dates.start ? new Date(dates.start).toLocaleDateString() : 'Start date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={dates.start ? new Date(dates.start) : undefined}
                                    onSelect={(date) => setDates({ ...dates, start: date ? date.toISOString().slice(0, 10) : '' })}
                                />
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dates.end ? new Date(dates.end).toLocaleDateString() : 'End date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={dates.end ? new Date(dates.end) : undefined}
                                    onSelect={(date) => setDates({ ...dates, end: date ? date.toISOString().slice(0, 10) : '' })}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" onClick={() => setDates({ start: '', end: '' })}>Clear</Button>
                        {error && <div className="text-red-600 md:col-span-3">{error}</div>}
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map(e => (
                                <TableRow key={e.entryId}>
                                    <TableCell>{e.entryDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={e.type === 'EXPENSE' ? 'destructive' : 'default'}>
                                            {e.type === 'CAPITAL_RECEIPT' ? 'Capital' : 'Expense'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{fmt(e.amount)}</TableCell>
                                    <TableCell className="text-sm">{e.reference || '—'}</TableCell>
                                    <TableCell className="text-sm">{e.description || '—'}</TableCell>
                                    <TableCell className="text-right">
                                        <Dialog open={editOpen && editing?.entryId === e.entryId} onOpenChange={(v) => { if (!v) { setEditOpen(false); setEditing(null); } }}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => { setEditing(e); setEditOpen(true); }}>Edit</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader><DialogTitle>Edit Entry</DialogTitle></DialogHeader>
                                                <form onSubmit={async (ev) => { ev.preventDefault(); try { await financeAPI.update(e.entryId, { ...editing, amount: parseFloat((editing?.amount ?? e.amount)) }); setEditOpen(false); setEditing(null); await load(); } catch (err) { setError('Failed to update entry'); } }} className="space-y-3">
                                                    <Select value={editing?.type || e.type} onValueChange={(value) => setEditing({ ...(editing || {}), type: value })}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="CAPITAL_RECEIPT">Capital</SelectItem>
                                                            <SelectItem value="EXPENSE">Expense</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Input type="number" step="0.01" defaultValue={e.amount} onChange={(ev) => setEditing({ ...(editing || {}), amount: ev.target.value })} />
                                                    <Input defaultValue={e.reference || ''} onChange={(ev) => setEditing({ ...(editing || {}), reference: ev.target.value })} />
                                                    <Input defaultValue={e.description || ''} onChange={(ev) => setEditing({ ...(editing || {}), description: ev.target.value })} />
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {(editing?.entryDate || e.entryDate) ? new Date(editing?.entryDate || e.entryDate).toLocaleDateString() : 'Pick date'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <CalendarComponent mode="single" selected={(editing?.entryDate || e.entryDate) ? new Date(editing?.entryDate || e.entryDate) : undefined} onSelect={(date) => setEditing({ ...(editing || {}), entryDate: date ? date.toISOString().slice(0, 10) : '' })} />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <div className="flex justify-end gap-2">
                                                        <Button type="button" variant="outline" onClick={() => { setEditOpen(false); setEditing(null); }}>Cancel</Button>
                                                        <Button type="submit">Save</Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="ml-2">Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this finance entry?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={async () => { try { await financeAPI.delete(e.entryId); await load(); } catch (err) { setError('Failed to delete entry'); } }}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}


