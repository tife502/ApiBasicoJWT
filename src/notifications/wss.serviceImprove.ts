import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { ClientMetadata } from './handlers/types';
import { ClientHandler } from './handlers/clientHandlers';
import { AuthHandler } from './handlers/authHandler';
import { PermissionHandler } from './handlers/permissionsHandler';
import { TransferHandler } from './handlers/handleClientTranfer';

export class WSService {

  /******************************************************************************************************************************************************** /
  Clase que se encarga de la coneccion ws tiene metodos basicos lista para expansion 
  **********************************************************************************************************************************************************/

  private static _instance: WSService;
  private wss: WebSocketServer;
  private clients: Map<string, ClientMetadata> = new Map();

  private constructor(server: Server, path: string = '/wsImproved') {
  this.wss = new WebSocketServer({
    server,
    path,
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true
    }
  });
  
  // Add error handling
  this.wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
  });

  this.initialize();
}

  public static getInstance(server?: Server, path?: string): WSService {
    if (!WSService._instance) {
      if (!server) throw new Error('Se necesita un servidor HTTP para la primera inicialización');
      WSService._instance = new WSService(server, path);
    }
    return WSService._instance;
  }


  private initialize(): void {

    this.wss.on('connection', (ws: WebSocket, req) => {
      const urlParams = new URLSearchParams(req.url?.split('?')[1]);
      const clientId = Math.random().toString(36).slice(2, 11);
      const clientName = urlParams.get('name') || `Cliente-${clientId.slice(0, 4)}`;
      const clientPermissions = urlParams.get('permissions')?.split(',') || ['2'];
      const validPermissions = ['1', '2', '3', '4'];
      const sanitizedPermissions = clientPermissions.filter(p => validPermissions.includes(p));

      this.clients.set(clientId, {
        ws,
        id: clientId,
        name: clientName,
        permissions: sanitizedPermissions.length > 0 ? sanitizedPermissions : ['2'],
        lastPong: Date.now()
      });

      //respuesta al front con los datos de la conexion
      ws.send(JSON.stringify({
        type: 'connection_established',
        payload: {
          clientId,
          assignedName: clientName,
          permissions: sanitizedPermissions
        }
      }));

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30000);

      ws.on('pong', () => {
        const client = this.clients.get(clientId);
        if (client) {
          client.lastPong = Date.now();
        }
      });


      ws.on('message', async (rawData: Buffer) => {
        try {
          const message = rawData.toString('utf8');
          const parsedData = JSON.parse(message);

          switch (parsedData.type) {

            case 'chat':
            console.log("chat resivido")
             
        
            case 'notification':
              //aqui se guardara las notificaciones en la base de datos
              console.log('Nueva notificación:', parsedData.payload);
              this.broadcast(JSON.stringify({
                type: 'notification',
                payload: "¡Nueva alerta del sistema!"
              }));
              break;
            case 'update_permissions':
              PermissionHandler.handlePermissionUpdate(clientId, this.clients, parsedData.payload, ws);
              break;
            case 'get_clients':
              ClientHandler.handleClientList(this.clients, ws);
              break;
            case 'auth_data':
              AuthHandler.handleAuthData(clientId, this.clients, parsedData.payload, ws);
              break;         
            case 'transfer_client':

              await TransferHandler.handleTransfer(
                clientId,
                this.clients,
                parsedData.payload,
                ws
              );
              console.log('[SERVER] Transferencia exitosa');
              break;
            default:
              console.log('Evento desconocido:', parsedData.type);
          }

        } catch (error) {
          console.error('Error procesando mensaje:', error);
        }
      });

      // Evento cuando se cierra la conexión
      ws.on('close', () => {
        clearInterval(pingInterval);
        this.handleDisconnect(clientId)
      });
    });

  }
  //metodo para la desconexion 
  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`Cliente desconectado: ${client.name} (ID: ${clientId})`);
      this.clients.delete(clientId);
    }
  }
  // Método para enviar mensaje a todos los clientes conectados
  public broadcast(message: string): void {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  // Método para apagar el servidor (podrías expandirlo)
  public shutdown(): void {
    this.wss.clients.forEach(client => client.close());
    this.wss.close();
  }

}



