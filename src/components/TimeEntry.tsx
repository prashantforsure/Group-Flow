'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"

import { Play, Pause, Plus, Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { DateRangePicker } from './ui/date-range-picker'

type TimeEntry = {
  id: string
  taskName: string
  date: string
  duration: number
  user: {
    id: string
    name: string
  }
}

type Task = {
  id: string
  title: string
}

export default function TimeEntriesPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [newEntry, setNewEntry] = useState({
    taskId: '',
    date: new Date(),
    duration: 0
  })
  const [runningTimer, setRunningTimer] = useState<{ taskId: string; startTime: number } | null>(null)

  useEffect(() => {
    fetchTimeEntriesAndTasks()
  }, [dateRange, selectedTask])

  const fetchTimeEntriesAndTasks = async () => {
    try {
      setLoading(true)
      const [entriesRes, tasksRes] = await Promise.all([
        axios.get('/api/time-entries', {
          params: {
            from: dateRange?.from.toISOString(),
            to: dateRange?.to.toISOString(),
            taskId: selectedTask || undefined
          }
        }),
        axios.get('/api/tasks')
      ])
      setTimeEntries(entriesRes.data)
      setTasks(tasksRes.data)
    } catch (error) {
      console.error('Error fetching time entries and tasks:', error)
      toast({
        title: "Error",
        description: "Failed to load time entries and tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewEntryChange = (field: string, value: string | number | Date) => {
    setNewEntry({ ...newEntry, [field]: value })
  }

  const handleAddEntry = async () => {
    try {
      const response = await axios.post('/api/time-entries', newEntry)
      setTimeEntries([...timeEntries, response.data])
      setNewEntry({ taskId: '', date: new Date(), duration: 0 })
      toast({
        title: "Success",
        description: "Time entry added successfully.",
      })
    } catch (error) {
      console.error('Error adding time entry:', error)
      toast({
        title: "Error",
        description: "Failed to add time entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStartTimer = (taskId: string) => {
    setRunningTimer({ taskId, startTime: Date.now() })
  }

  const handleStopTimer = async () => {
    if (runningTimer) {
      const duration = Math.round((Date.now() - runningTimer.startTime) / 1000)
      try {
        const response = await axios.post('/api/time-entries', {
          taskId: runningTimer.taskId,
          date: new Date(),
          
          duration
        })
        setTimeEntries([...timeEntries, response.data])
        setRunningTimer(null)
        toast({
          title: "Success",
          description: "Timer stopped and time entry added successfully.",
        })
      } catch (error) {
        console.error('Error stopping timer:', error)
        toast({
          title: "Error",
          description: "Failed to stop timer and add time entry. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Time Entries</h1>
        <div className="space-x-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            Calendar
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="w-full md:w-auto">
            <Label htmlFor="dateRange">Date Range</Label>
            <DateRangePicker
              id="dateRange"
              //@ts-expect-error there is some error will figure out
              value={dateRange}
              onValueChange={setDateRange}
            />
          </div>
          <div className="w-full md:w-auto">
            <Label htmlFor="taskFilter">Task</Label>
            <Select
              value={selectedTask}
              onValueChange={setSelectedTask}
            >
              <SelectTrigger id="taskFilter">
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Tasks</SelectItem>
                {tasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading time entries...</div>
            ) : (
              <ul className="space-y-4">
                {timeEntries.map(entry => (
                  <li key={entry.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{entry.taskName}</p>
                      <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>{formatDuration(entry.duration)}</span>
                      <span className="text-sm text-gray-500">{entry.user.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="range"
              selected={dateRange}
              //@ts-expect-error there is some error will figure out
              onSelect={setDateRange}
              className="rounded-md border"
            />
            {/* You would need to implement a more sophisticated calendar view here */}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add New Time Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="newTaskId">Task</Label>
              <Select
                value={newEntry.taskId}
                onValueChange={(value) => handleNewEntryChange('taskId', value)}
              >
                <SelectTrigger id="newTaskId">
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newDate">Date</Label>
              <Input
                id="newDate"
                type="date"
                value={newEntry.date.toISOString().split('T')[0]}
                onChange={(e) => handleNewEntryChange('date', new Date(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="newDuration">Duration (minutes)</Label>
              <Input
                id="newDuration"
                type="number"
                value={newEntry.duration}
                onChange={(e) => handleNewEntryChange('duration', parseInt(e.target.value) * 60)}
              />
            </div>
          </div>
          <Button onClick={handleAddEntry} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add Entry
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Running Timer</CardTitle>
        </CardHeader>
        <CardContent>
          {runningTimer ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {tasks.find(task => task.id === runningTimer.taskId)?.title}
                </p>
                <p className="text-sm text-gray-500">
                  Started at: {new Date(runningTimer.startTime).toLocaleTimeString()}
                </p>
              </div>
              <Button onClick={handleStopTimer}>
                <Pause className="mr-2 h-4 w-4" /> Stop Timer
              </Button>
            </div>
          ) : (
            <div>
              <p>No timer running</p>
              <Select
                value={selectedTask}
                onValueChange={setSelectedTask}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a task to start timer" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => handleStartTimer(selectedTask)} className="mt-2" disabled={!selectedTask}>
                <Play className="mr-2 h-4 w-4" /> Start Timer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}