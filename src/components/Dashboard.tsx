'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bell, CheckCircle, Clock, PlusCircle, Users, FileText, Calendar } from 'lucide-react'

type Task = {
  id: string
  title: string
  status: 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string
}

type Group = {
  id: string
  name: string
  description?: string
}

type TimeEntry = {
  id: string
  startTime: string
  endTime?: string
  description?: string
  taskId: string
}

type Notification = {
  id: string
  type: 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'COMMENT_ADDED' | 'REVIEW_REQUESTED' | 'DEADLINE_APPROACHING' | 'MENTION'
  content: string
  isRead: boolean
  createdAt: string
}

type Event = {
  id: string
  title: string
  startTime: string
  endTime: string
  isVirtual: boolean
}

type UserAchievement = {
  id: string
  achievementType: 'TASK_MASTER' | 'TEAM_PLAYER' | 'DEADLINE_CHAMPION' | 'QUALITY_GURU' | 'PRODUCTIVITY_STAR'
  awardedAt: string
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [achievements, setAchievements] = useState<UserAchievement[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tasksRes, groupsRes, timeEntriesRes, notificationsRes, eventsRes, achievementsRes] = await Promise.all([
          axios.get('/api/tasks'),
          axios.get('/api/groups'),
          axios.get('/api/time-entries'),
          axios.get('/api/notifications'),
          axios.get('/api/events'),
          axios.get('/api/achievements')
        ])

        setTasks(tasksRes.data)
        setGroups(groupsRes.data)
        setTimeEntries(timeEntriesRes.data)
        setNotifications(notificationsRes.data)
        setEvents(eventsRes.data)
        setAchievements(achievementsRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [])

  const calculateTaskStats = () => {
    const total = tasks.length
    const pending = tasks.filter(task => task.status === 'PENDING').length
    const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length
    const completed = tasks.filter(task => task.status === 'COMPLETED').length
    return { total, pending, inProgress, completed }
  }

  const calculateTotalTimeTracked = () => {
    return timeEntries.reduce((total, entry) => {
      if (entry.endTime) {
        const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()
        return total + duration
      }
      return total
    }, 0) / 3600000 
  }

  const taskStats = calculateTaskStats()
  const totalTimeTracked = calculateTotalTimeTracked()

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Task Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Pending</span>
                <span className="font-bold">{taskStats.pending}</span>
              </div>
              <Progress value={(taskStats.pending / taskStats.total) * 100} className="h-2 w-full" />
              <div className="flex items-center justify-between">
                <span>In Progress</span>
                <span className="font-bold">{taskStats.inProgress}</span>
              </div>
              <Progress value={(taskStats.inProgress / taskStats.total) * 100} className="h-2 w-full" />
              <div className="flex items-center justify-between">
                <span>Completed</span>
                <span className="font-bold">{taskStats.completed}</span>
              </div>
              <Progress value={(taskStats.completed / taskStats.total) * 100} className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tasks
                .filter(task => task.status !== 'COMPLETED' && task.status !== 'CANCELLED')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 5)
                .map(task => (
                  <li key={task.id} className="flex items-center justify-between">
                    <span className={`font-medium ${task.priority === 'URGENT' ? 'text-red-500' : ''}`}>{task.title}</span>
                    <span className="text-sm text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Tracked This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Total Hours</span>
              <span className="text-2xl font-bold">{totalTimeTracked.toFixed(1)}</span>
            </div>
            <Progress value={(totalTimeTracked / 40) * 100} className="mt-2 h-2 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {groups.slice(0, 5).map(group => (
                <li key={group.id} className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{group.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {events.slice(0, 5).map(event => (
                <li key={event.id} className="flex items-center justify-between">
                  <span>{event.title}</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm text-gray-500">{new Date(event.startTime).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {achievements.slice(0, 5).map(achievement => (
                <li key={achievement.id} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{achievement.achievementType.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {notifications.slice(0, 5).map(notification => (
              <li key={notification.id} className="flex items-center space-x-2">
                <Bell className={`h-4 w-4 ${notification.isRead ? 'text-gray-400' : 'text-blue-500'}`} />
                <span className={notification.isRead ? 'text-gray-500' : 'font-semibold'}>
                  {notification.content}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mt-6 flex space-x-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Task
        </Button>
        <Button variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          Start Time Entry
        </Button>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Create Document
        </Button>
      </div>
    </div>
  )
}