import { Guard } from '../shared/guard.js';
import { USER_ROLES, USER_STATUSES, UserRole, UserStatus } from '../words/enums.js';

export interface UserProps {
  id: string;
  clerkId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  clerkId: string;
  email: string;
  role?: UserRole;
  status?: UserStatus;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Account/identity aggregate. Linked to Clerk via `clerkId`. */
export class User {
  private constructor(private props: UserProps) {}

  static create(input: CreateUserInput, options: { id: string; now?: Date }): User {
    const now = options.now ?? new Date();
    const email = input.email?.trim().toLowerCase() ?? '';

    new Guard()
      .requireNonEmpty(input.clerkId, 'clerkId')
      .requireNonEmpty(email, 'email')
      .add(!EMAIL_RE.test(email), 'email must be a valid address')
      .requireOneOf(input.role ?? UserRole.USER, USER_ROLES, 'role')
      .throwIfInvalid();

    return new User({
      id: options.id,
      clerkId: input.clerkId.trim(),
      email,
      role: input.role ?? UserRole.USER,
      status: input.status ?? UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get clerkId(): string {
    return this.props.clerkId;
  }
  get email(): string {
    return this.props.email;
  }
  get role(): UserRole {
    return this.props.role;
  }
  get status(): UserStatus {
    return this.props.status;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  isModerator(): boolean {
    return this.props.role === UserRole.MODERATOR || this.props.role === UserRole.ADMIN;
  }

  isActive(): boolean {
    return this.props.status === UserStatus.ACTIVE;
  }

  changeEmail(email: string, now: Date = new Date()): void {
    const normalized = email.trim().toLowerCase();
    new Guard().add(!EMAIL_RE.test(normalized), 'email must be a valid address').throwIfInvalid();
    this.props.email = normalized;
    this.props.updatedAt = now;
  }

  setRole(role: UserRole, now: Date = new Date()): void {
    new Guard().requireOneOf(role, USER_ROLES, 'role').throwIfInvalid();
    this.props.role = role;
    this.props.updatedAt = now;
  }

  setStatus(status: UserStatus, now: Date = new Date()): void {
    new Guard().requireOneOf(status, USER_STATUSES, 'status').throwIfInvalid();
    this.props.status = status;
    this.props.updatedAt = now;
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
