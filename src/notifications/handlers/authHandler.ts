// src/websocket/handlers/authHandler.ts
import { WebSocket } from 'ws';
import { ClientMetadata } from './types';


export class AuthHandler {
  static handleAuthData(
    clientId: string,
    clients: Map<string, ClientMetadata>,
    payload: any,
    ws: WebSocket
  ) {
    try {
      // Validar estructura básica del payload
      if (!payload?.name || !payload?.permissions) {
        throw new Error('Formato de autenticación inválido');
      }

      const client = clients.get(clientId);
      if (!client) throw new Error('Cliente no encontrado');

      // Sanitizar y validar datos
      const sanitizedName = this.sanitizeName(payload.name);
      const validPermissions = this.validatePermissions(payload.permissions);

      // Actualizar datos del cliente
      client.name = sanitizedName;
      client.permissions = validPermissions;
      clients.set(clientId, client);

      // Enviar confirmación
      this.sendAuthConfirmation(ws, {
        name: sanitizedName,
        permissions: validPermissions
      });

      console.log(`Autenticación actualizada para ${clientId}:`, client.name );

    } catch (error) {
      this.sendAuthError(ws, error instanceof Error ? error.message : 'Error desconocido');
    }
  }

  private static sanitizeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '')
               .substring(0, 25)
               .trim();
  }

  private static validatePermissions(permissions: any): string[] {
    const validPermissions = ['1', '2', '3', 'admin'];
    const permArray = Array.isArray(permissions) ? permissions : String(permissions).split(',');
    return permArray.filter(p => validPermissions.includes(String(p).trim()));
  }

  private static sendAuthConfirmation(ws: WebSocket, data: { name: string; permissions: string[] }) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'auth_confirmation',
        payload: {
          status: 'success',
          updatedName: data.name,
          permissions: data.permissions,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }

  private static sendAuthError(ws: WebSocket, message: string) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'auth_error',
        payload: {
          error: message,
          code: 'AUTH_001',
          timestamp: new Date().toISOString()
        }
      }));
    }
  }
}