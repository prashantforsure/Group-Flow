'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from '@/hooks/use-toast'
import { Users, Plus, Search, Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  image: string | null
}

interface GroupMember {
  role: 'ADMIN' | 'MEMBER'
  user: User
}

interface Group {
  id: string
  name: string
  description: string
  owner: User
  members: GroupMember[]
  createdAt?: string
  updatedAt?: string
}

interface NewGroupData {
  name: string
  description: string
}

interface GroupDisplay {
  id: string
  name: string
  description: string
  memberCount: number
  userRole: string
  recentActivity: boolean
}

interface ValidationError {
  path: string[]
  message: string
}

export default function GroupsListPage() {
  const [groups, setGroups] = useState<GroupDisplay[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [newGroup, setNewGroup] = useState<NewGroupData>({ name: '', description: '' })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const transformGroupData = (group: Group): GroupDisplay => {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group.members.length,
      userRole: group.members[0]?.role || 'MEMBER',
      recentActivity: new Date(group.updatedAt || '').getTime() > Date.now() - 24 * 60 * 60 * 1000
    }
  }

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/groups', {
        params: { page: currentPage, search: searchTerm }
      })
      const transformedGroups = response.data.groups.map(transformGroupData)
      setGroups(transformedGroups)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast({
        title: "Error",
        description: "Failed to load groups. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!newGroup.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (newGroup.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    } else if (newGroup.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters'
    }

    if (!newGroup.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (newGroup.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (newGroup.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateGroup = async () => {
    try {
      if (!validateForm()) {
        return
      }

      setIsSubmitting(true)

      const trimmedData = {
        name: newGroup.name.trim(),
        description: newGroup.description.trim()
      }

      const response = await axios.post<Group>('/api/groups', trimmedData)
      
      const transformedGroup = transformGroupData(response.data)
      setGroups(prevGroups => [...prevGroups, transformedGroup])
      setIsCreateDialogOpen(false)
      setNewGroup({ name: '', description: '' })
      setErrors({})
      
      toast({
        title: "Success",
        description: "New group created successfully.",
      })
      
      fetchGroups()
    } catch (error: any) {
      console.error('Error creating group:', error)
      
      if (error.response?.data?.error) {
        toast({
          title: "Error",
          description: error.response.data.error,
          variant: "destructive",
        })
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors as ValidationError[]
        const newErrors: { [key: string]: string } = {}
        
        validationErrors.forEach(err => {
          const field = err.path[err.path.length - 1]
          newErrors[field] = err.message
        })
        
        setErrors(newErrors)
      } else {
        toast({
          title: "Error",
          description: "Failed to create new group. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#A259FF] hover:bg-[#1ABCFE] text-white transition-colors">
                <Plus className="mr-2 h-4 w-4" /> Create New Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Enter the details for your new group. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="col-span-3"
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="col-span-4 text-right text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="col-span-3"
                    disabled={isSubmitting}
                  />
                  {errors.description && <p className="col-span-4 text-right text-red-500 text-sm">{errors.description}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleCreateGroup} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#A259FF]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{group.name}</CardTitle>
                  <CardDescription className="text-gray-600">{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{group.memberCount} members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={group.userRole === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                      {group.userRole}
                    </Badge>
                    {group.recentActivity && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                        Recent Activity
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-[#A259FF] hover:bg-[#1ABCFE] transition-colors">
                    <Link href={`/groups/${group.id}`}>View Group</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Pagination
          //@ts-expect-error 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
    </div>
  )
}