export interface ClassDetails {
  name: string;
  description: string;
  meeting: string;
}

export interface ClassMember {
  id: string;
  name: string;
  email: string;
  status: "active" | "removed";
}

export interface ClassInvitation {
  id: string;
  name: string;
  email: string;
  status: "pending" | "accepted" | "revoked" | "expired";
}

export interface TeachingClass extends ClassDetails {
  id: string;
  example?: boolean;
  archived: boolean;
  courseIds: string[];
  members: ClassMember[];
  invitations: ClassInvitation[];
}
