import { WebSocket } from 'ws';

export interface ClientMetadata {
  ws: WebSocket;
  id: string;
  name: string;
  permissions: string[];
  lastPong: number;
}

export interface AuthConfirmationPayload {
  status: 'success';
  updatedName: string;
  permissions: string[];
  timestamp: string;
}

export interface AuthErrorPayload {
  error: string;
  code: string;
  timestamp: string;
}

export interface PermissionUpdatePayload {
  status: 'success';
  newPermissions: string[];
  timestamp: string;
}

export interface PermissionErrorPayload {
  error: string;
  code: string;
  timestamp: string;
}