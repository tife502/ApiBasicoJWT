// src/websocket/handlers/permissionHandler.ts
import { WebSocket } from 'ws';
import { ClientMetadata } from './types';


export class PermissionHandler {
    
  static handlePermissionUpdate(
    clientId: string,
    clients: Map<string, ClientMetadata>,
    payload: any,
    ws: WebSocket
  ) {
    try {
      const client = clients.get(clientId);
      if (!client) throw new Error('Cliente no encontrado');

      // Validar estructura del payload
      if (!Array.isArray(payload.permissions)) {
        throw new Error('Formato de permisos inválido');
      }

      // Convertir y validar permisos
      const newPermissions = this.sanitizePermissions(payload.permissions);

      // Actualizar y notificar
      clients.set(clientId, { ...client, permissions: newPermissions });
      this.sendPermissionUpdateConfirmation(ws, newPermissions);

      console.log(`Permisos actualizados para ${clientId}:`, newPermissions);

    } catch (error) {
      this.sendPermissionError(ws, error instanceof Error ? error.message : 'Error desconocido');
    }
  }

  private static sanitizePermissions(permissions: any): string[] {
    const validPermissions = ['1', '2', '3', 'admin'];
    return permissions
      .map((p: any) => String(p).trim())
      .filter((p: string) => validPermissions.includes(p))
      .slice(0, 3); // Limitar a 3 permisos
  }

  private static sendPermissionUpdateConfirmation(ws: WebSocket, permissions: string[]) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'permission_update_confirmation',
        payload: {
          status: 'success',
          newPermissions: permissions,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }

  private static sendPermissionError(ws: WebSocket, message: string) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'permission_error',
        payload: {
          error: message,
          code: 'PERM_001',
          timestamp: new Date().toISOString()
        }
      }));
    }
  }
}