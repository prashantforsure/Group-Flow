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
import { CircleUserRound } from 'lucide-react'

// Define types based on the schema
type User = {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  jobTitle?: string
  bio?: string
  skills?: string[]
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}

type PerformanceMetrics = {
  tasksCompleted: number
  averageReviewScore: number
}

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  jobTitle: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  skills: z.string().optional(),
  twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid URL').optional().or(z.literal(''))
})

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: user || {}
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        axios.get("/api/users/me").then((response) => {
          setUser(response.data)
        })
      }catch(error){
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
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">My Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <CircleUserRound  className="h-16 w-16 mr-2 "/>
              </Avatar>
              <div>
                <CardTitle className='text-black'>{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <>
                
                {user.jobTitle && (
                  <div className="mb-4">
                    <Label>Job Title</Label>
                    <p>{user.jobTitle}</p>
                  </div>
                )}
                {user.bio && (
                  <div className="mb-4">
                    <Label>Bio</Label>
                    <p>{user.bio}</p>
                  </div>
                )}
                {user.skills && (
                  <div className="mb-4">
                    <Label>Skills</Label>
                    <p>{user.skills.join(', ')}</p>
                  </div>
                )}
                {user.socialLinks && (
                  <div className="flex space-x-2">
                    {user.socialLinks.twitter && (
                      <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                        <Icons.twitter className="h-6 w-6" />
                      </a>
                    )}
                   
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="submit">Save Changes</Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </CardFooter>
        </Card>

        {metrics && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tasks Completed</Label>
                <p className="text-2xl font-bold">{metrics.tasksCompleted}</p>
              </div>
              <div>
                <Label>Average Review Score</Label>
                <div className="flex items-center space-x-2">
                  <Progress value={metrics.averageReviewScore * 20} className="w-full" />
                  <span className="text-sm font-medium">{metrics.averageReviewScore.toFixed(1)}/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}