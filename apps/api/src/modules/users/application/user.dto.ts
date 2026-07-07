import type { User } from '@mnemonic/core';
import type { ProfileData } from './profile.port.js';

export interface MeResponse {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  profile: ProfileData | null;
}

export function toMeResponse(user: User, profile: ProfileData | null): MeResponse {
  const p = user.toJSON();
  return {
    id: p.id,
    email: p.email,
    role: p.role,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    profile,
  };
}
