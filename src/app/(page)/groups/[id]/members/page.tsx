'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from '@/hooks/use-toast'
import { Search, UserPlus } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
type Member = {
  id: string
  name: string
  avatar: string
  role: string
  joinDate: string
  recentActivity: string
}

export default function GroupMembersPage() {
  const { id } = useParams()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [id])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/groups/${id}/members`)
      setMembers(response.data.members)
      setIsAdmin(response.data.isAdmin)
    } catch (error) {
      console.error('Error fetching group members:', error)
      toast({
        title: "Error",
        description: "Failed to load group members. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async () => {
    // Implement invite member functionality
    toast({
      title: "Invite Member",
      description: "Invite functionality not implemented yet.",
    })
  }

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      await axios.put(`/api/groups/${id}/members/${memberId}`, { role: newRole })
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      
      ))
      toast({
        title: "Success",
        description: "Member role updated successfully.",
      })
    } catch (error) {
      console.error('Error updating member role:', error)
      toast({
        title: "Error",
        description: "Failed to update member role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await axios.delete(`/api/groups/${id}/members/${memberId}`)
      setMembers(members.filter(member => member.id !== memberId))
      toast({
        title: "Success",
        description: "Member removed successfully.",
      })
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Group Members</h1>
        {isAdmin && (
          <Button onClick={handleInviteMember}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Members ({filteredMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {filteredMembers.map((member) => (
                <li key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">Joined: {new Date(member.joinDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Recent: {member.recentActivity}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <>
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleChangeRole(member.id, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="destructive" onClick={() => handleRemoveMember(member.id)}>
                          Remove
                        </Button>
                      </>
                    )}
                    {!isAdmin && <Badge>{member.role}</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}