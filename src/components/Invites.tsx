'use client'

import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

type Invite = {
    id: string
    groupName: string
    groupDescription: string
    invitedBy: {
      name: string
      avatar: string
    }
    invitedAt: string
    role: string
    memberCount: number
  }

export default function Invites() {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [ loading, setLoading] = useState(true)

    useEffect(() => {
        fetchInvites()
      }, [])
      const fetchInvites = async () => {
        try{
            setLoading(true);
            const response = await axios.get("/api/groups/invites")
            setInvites(response.data);
        }catch(error){
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to load group invites. Please try again.",
                variant: "destructive",
              })
        }finally{
            setLoading(false)
        }
      }
      const handleInviteAction = async (inviteId: string, action: 'accept' | 'reject') => {
        try{
            axios.put(`/api/groups/invites/${inviteId}`, { action })
            setInvites(invites.filter(invite => invite.id !== inviteId))
            toast({
                title: "Success",
                description: `Invitation ${action === 'accept' ? 'accepted' : 'rejected'} successfully.`,
              })
        }catch(error){
            console.log(error);
            toast({
                title: "Error",
                description: `Failed to ${action} invitation. Please try again.`,
                variant: "destructive",
              })
        }
      }
      if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )
      }
    return(
      <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Group Invitations</h1>
      {invites.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">You have no pending group invitations.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {invites.map((invite) => (
            <Card key={invite.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {invite.groupName}
                  <Badge variant="secondary">{invite.memberCount} members</Badge>
                </CardTitle>
                <CardDescription>{invite.groupDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarImage src={invite.invitedBy.avatar} alt={invite.invitedBy.name} />
                    <AvatarFallback>{invite.invitedBy.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Invited by: {invite.invitedBy.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(invite.invitedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-sm">
                  Invited as: <Badge variant="outline">{invite.role}</Badge>
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  onClick={() => handleInviteAction(invite.id, 'accept')}
                  className="w-full mr-2"
                >
                  Accept
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleInviteAction(invite.id, 'reject')}
                  className="w-full ml-2"
                >
                  Reject
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
    )
}