'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from '@/hooks/use-toast'
import { Label } from "@/components/ui/label"


type GroupSettings = {
  name: string
  description: string
  privacy: 'public' | 'private' | 'organization'
  memberPermissions: {
    canInvite: boolean
    canRemoveMembers: boolean
    canEditTasks: boolean
  }
  notificationSettings: {
    newMember: boolean
    newTask: boolean
    taskCompletion: boolean
  }
  joinSetting: 'open' | 'invite' | 'approval'
}

export default function GroupSettingsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [settings, setSettings] = useState<GroupSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroupSettings()
  }, [id])

  const fetchGroupSettings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/groups/${id}`)
      setSettings(response.data)
    } catch (error) {
      console.error('Error fetching group settings:', error)
      toast({
        title: "Error",
        description: "Failed to load group settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsChange = (field: string, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handlePermissionChange = (field: string, value: boolean) => {
    setSettings(prev => prev ? {
      ...prev,
      memberPermissions: { ...prev.memberPermissions, [field]: value }
    } : null)
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setSettings(prev => prev ? {
      ...prev,
      notificationSettings: { ...prev.notificationSettings, [field]: value }
    } : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.put(`/api/groups/${id}`, settings)
      toast({
        title: "Success",
        description: "Group settings updated successfully.",
      })
    } catch (error) {
      console.error('Error updating group settings:', error)
      toast({
        title: "Error",
        description: "Failed to update group settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGroup = async () => {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/groups/${id}`)
        toast({
          title: "Success",
          description: "Group deleted successfully.",
        })
        router.push('/groups')
      } catch (error) {
        console.error('Error deleting group:', error)
        toast({
          title: "Error",
          description: "Failed to delete group. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (loading || !settings) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Group Settings</h1>
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage your groups basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => handleSettingsChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => handleSettingsChange('description', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="privacy">Privacy</Label>
              <Select
                value={settings.privacy}
                onValueChange={(value) => handleSettingsChange('privacy', value)}
              >
                <SelectTrigger id="privacy">
                  <SelectValue placeholder="Select privacy setting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Member Permissions</CardTitle>
            <CardDescription>Set what members can do in your group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="canInvite">Members can invite others</Label>
              <Switch
                id="canInvite"
                checked={settings.memberPermissions.canInvite}
                onCheckedChange={(checked) => handlePermissionChange('canInvite', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="canRemoveMembers">Members can remove others</Label>
              <Switch
                id="canRemoveMembers"
                checked={settings.memberPermissions.canRemoveMembers}
                onCheckedChange={(checked) => handlePermissionChange('canRemoveMembers', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="canEditTasks">Members can edit tasks</Label>
              <Switch
                id="canEditTasks"
                checked={settings.memberPermissions.canEditTasks}
                onCheckedChange={(checked) => handlePermissionChange('canEditTasks', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage group notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="newMember">New member notifications</Label>
              <Switch
                id="newMember"
                checked={settings.notificationSettings.newMember}
                onCheckedChange={(checked) => handleNotificationChange('newMember', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="newTask">New task notifications</Label>
              <Switch
                id="newTask"
                checked={settings.notificationSettings.newTask}
                onCheckedChange={(checked) => handleNotificationChange('newTask', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="taskCompletion">Task completion notifications</Label>
              <Switch
                id="taskCompletion"
                checked={settings.notificationSettings.taskCompletion}
                onCheckedChange={(checked) => handleNotificationChange('taskCompletion', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Join Settings</CardTitle>
            <CardDescription>Control how new members can join your group</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.joinSetting}
              onValueChange={(value) => handleSettingsChange('joinSetting', value)}
            >
              <SelectTrigger id="joinSetting">
                <SelectValue placeholder="Select join setting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open (anyone can join)</SelectItem>
                <SelectItem value="invite">Invite only</SelectItem>
                <SelectItem value="approval">Approval required</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="submit">Save Changes</Button>
          <Button variant="destructive" onClick={handleDeleteGroup}>Delete Group</Button>
        </div>
      </form>
    </div>
  )
}