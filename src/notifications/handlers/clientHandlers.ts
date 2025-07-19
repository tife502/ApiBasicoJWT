import { WebSocket } from 'ws';
import { ClientMetadata } from './types';

export class ClientHandler {
  static handleClientList(clients: Map<string, ClientMetadata>, ws: WebSocket) {
    try {
      const clientList = Array.from(clients.entries()).map(([id, client]) => ({
        id,
        name: client.name,
        permissions: client.permissions,
        status: client.ws.readyState === WebSocket.OPEN ? 'online' : 'offline',
        lastActivity: new Date(client.lastPong).toISOString()
      }));

      if (ws.readyState === WebSocket.OPEN) {
        const response = JSON.stringify({
          type: 'get_clients_response',
          payload: clientList
        });
        
        // Verificación adicional antes de enviar
        ws.send(response, (error) => {
          if (error) {
            console.error('Error enviando lista de clientes:', error);
            // Puedes agregar lógica de reintento aquí si es necesario
          }
        });
      }
      
    } catch (error) {
      console.error('Error generando lista de clientes:', error);
      
      // Intentar enviar mensaje de error si la conexión sigue abierta
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: 'Error al obtener la lista de clientes'
        }));
      }
    }
  }
}