export interface CreateGroupInput {
    name: string;
    description?: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'ORGANIZATION';
    maxMembers?: number;
    settings?: Record<string, unknown>;
  }
  
  export interface UpdateGroupInput extends Partial<CreateGroupInput> {
    isArchived?: boolean;
  }
  
  export interface UpdateMemberRoleInput {
    role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST';
  }
  
  export interface CreateInviteInput {
    email: string;
    role?: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST';
    message?: string;
  }
  
  export interface RespondToInviteInput {
    status: 'ACCEPTED' | 'REJECTED';
  }