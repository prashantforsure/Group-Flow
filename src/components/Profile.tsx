'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/ui/icons"
import { CircleUserRound, Briefcase, MapPin, Calendar, Mail, Phone } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

type User = {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  jobTitle?: string
  bio?: string
  skills?: string[]
  location?: string
  joinDate?: string
  phone?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}

type Task = {
  id: string
  title: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate: string
}

type PerformanceMetrics = {
  tasksCompleted: number
  tasksInProgress: number
  tasksPending: number
  averageReviewScore: number
}

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  jobTitle: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  skills: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid URL').optional().or(z.literal(''))
})

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: user || {}
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [userResponse, tasksResponse] = await Promise.all([
          axios.get("/api/users/me"),
          axios.get("/api/users/me/tasks")
        ])
        setUser(userResponse.data)
        setTasks(tasksResponse.data)
        
        // Calculate metrics
        const completedTasks = tasksResponse.data.filter((task: Task) => task.status === 'COMPLETED')
        const inProgressTasks = tasksResponse.data.filter((task: Task) => task.status === 'IN_PROGRESS')
        const pendingTasks = tasksResponse.data.filter((task: Task) => task.status === 'PENDING')
        
        setMetrics({
          tasksCompleted: completedTasks.length,
          tasksInProgress: inProgressTasks.length,
          tasksPending: pendingTasks.length,
          averageReviewScore: 4.5 // This should be fetched from the backend in a real scenario
        })
      } catch(error) {
        console.error('Error fetching profile data:', error)
      }
    }
    fetchProfileData()
  }, [])

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.put('/api/users/me', data)
      setUser(response.data)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const totalTasks = tasks.length
  const completedTasksPercentage = (metrics?.tasksCompleted || 0) / totalTasks * 100
  const inProgressTasksPercentage = (metrics?.tasksInProgress || 0) / totalTasks * 100
  const pendingTasksPercentage = (metrics?.tasksPending || 0) / totalTasks * 100

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-32"></div>
          <div className="px-6 py-4 relative">
            <Avatar className="h-32 w-32 absolute -top-16 ring-4 ring-white">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback>
                  <CircleUserRound className="h-20 w-20 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="mt-16">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.jobTitle}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              {user.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {user.location}
                </div>
              )}
              {user.joinDate && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined {new Date(user.joinDate).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {user.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{user.bio || 'No bio provided.'}</p>
                  {user.skills && user.skills.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tasks Completed</Label>
                    <Progress value={completedTasksPercentage} className="mt-2" />
                    <p className="text-sm text-gray-600 mt-1">{metrics?.tasksCompleted} out of {totalTasks} tasks</p>
                  </div>
                  <div>
                    <Label>Tasks In Progress</Label>
                    <Progress value={inProgressTasksPercentage} className="mt-2" />
                    <p className="text-sm text-gray-600 mt-1">{metrics?.tasksInProgress} out of {totalTasks} tasks</p>
                  </div>
                  <div>
                    <Label>Tasks Pending</Label>
                    <Progress value={pendingTasksPercentage} className="mt-2" />
                    <p className="text-sm text-gray-600 mt-1">{metrics?.tasksPending} out of {totalTasks} tasks</p>
                  </div>
                  <div>
                    <Label>Average Review Score</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Progress value={metrics?.averageReviewScore ? metrics.averageReviewScore * 20 : 0} className="w-full" />
                      <span className="text-sm font-medium">{metrics?.averageReviewScore?.toFixed(1)}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <Badge>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" {...register('name')} />
                      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" {...register('email')} />
                      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" {...register('jobTitle')} />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" {...register('bio')} />
                    {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input id="skills" {...register('skills')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" {...register('location')} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" {...register('phone')} />
                    </div>
                  </div>
                  
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}