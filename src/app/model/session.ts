export class Session{
    sid?: string;
    cid: string;
    createdAt: Date;
    startedAt: Date;
    endedAt: Date;
    isActive: boolean;
    location: string;
    count?: number;
    attended?: boolean;
    keyword?: string;
  }