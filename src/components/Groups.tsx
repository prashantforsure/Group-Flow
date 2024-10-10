'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pagination } from "@/components/ui/pagination"
import { toast } from '@/hooks/use-toast'
import { Users, Search, Plus } from 'lucide-react'

type Group = {
  id: string
  name: string
  description: string
  memberCount: number
  userRole: string
  recentActivity: boolean
}

export default function GroupsListPage() {

  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  useEffect(() => {
    fetchGroups()
  }, [currentPage, searchTerm])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/groups', {
        params: { page: currentPage, search: searchTerm }
      })
      setGroups(response.data.groups)
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
  }

  const handleCreateGroup = async () => {
    try {
      const response = await axios.post('/api/groups', { name: 'New Group', description: 'New group description' })
      setGroups([...groups, response.data])
      toast({
        title: "Success",
        description: "New group created successfully.",
      })
    } catch (error) {
      console.error('Error creating group:', error)
      toast({
        title: "Error",
        description: "Failed to create new group. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Groups</h1>
        <Button onClick={handleCreateGroup}>
          <Plus className="mr-2 h-4 w-4" /> Create New Group
        </Button>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
         
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{group.memberCount} members</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant={group.userRole === 'Admin' ? 'default' : 'secondary'}>
                    {group.userRole}
                  </Badge>
                  {group.recentActivity && (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Recent Activity
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={`/groups/${group.id}`}>View Group</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination
        //@ts-ignore
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}