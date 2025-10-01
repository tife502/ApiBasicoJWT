// transferHandler.ts
import { WebSocket } from 'ws';
import { ClientMetadata } from './types';
// import { AssignmentManager } from './assigmentManager';
// import { DataManager } from '../../domain/classes/dataManager';


export class TransferHandler {
  static async handleTransfer(
    senderClientId: string,
    clients: Map<string, ClientMetadata>,
    payload: any,
    ws: WebSocket
  ) {
    /*******************************************************************************************
      estamos en el handler de transferencia de clientes como manejaremos la transferencia de usuarios?
      solo cambiamos la clasificacion del cliente por ejemplo de servicio al cliente a cartera

    ********************************************************************************************/
    try {
 
    
    const { targetClientId, newCategory } = payload; // Cambiamos targetAgentId por newCategory
    const sender = clients.get(senderClientId);
  
    // // Validar permisos del remitente (permiso 2 para atención al cliente)
    // if (!sender?.permissions.includes('2')) {
    //   throw new Error('No tienes permisos para transferir clientes');
    // }
  
    // // Validar categoría destino (ej: solo permitir mover a "cartera")
    // if (newCategory !== 'cartera') {
    //   throw new Error('Categoría destino inválida');
    // }
  
    // Actualizar categoría en DataManager (y base de datos si aplica)
    // await DataManager.getInstance().updateClientCategory(targetClientId, newCategory);
  
    // Notificar a todos los agentes afectados
    this.broadcastCategoryUpdate(clients, newCategory, targetClientId);

           //esto es la logica de transferencia de agente a agente no lo necesitamos
        //  pero lo dejo por referencia
    //   const { targetClientId, targetAgentId } = payload;
    //   const sender = clients.get(senderClientId);

    //   this.validateTransfer(sender, targetAgentId, clients);
    //   AssignmentManager.getInstance().assignClient(targetClientId, targetAgentId);
      
    //   this.sendNotifications(
    //     ws,
    //     clients.get(targetAgentId)?.ws,
    //     targetClientId,
    //     targetAgentId
    //   );

    } catch (error: any) {
      this.sendError(ws, error.message);
    }
  }
 //no se usa ya que no estamos transfiriendo de agente a agente
  private static validateTransfer(
    sender: ClientMetadata | undefined,
    targetAgentId: string,
    clients: Map<string, ClientMetadata>
  ) {
    // Validar remitente
    if (!sender?.permissions.includes('2')) {
      throw new Error('No tienes permisos para transferir clientes');
    }

    // Validar agente destino
    const targetAgent = clients.get(targetAgentId);
    if (!targetAgent?.permissions.includes('3')) {
      throw new Error('El agente destino no tiene permisos válidos');
    }
  }
//no se usa ya que no estamos transfiriendo de agente a agente
  private static sendNotifications(
    senderWs: WebSocket,
    targetWs: WebSocket | undefined,
    clientId: string,
    agentId: string
  ) {
    // Notificar remitente
    senderWs.send(JSON.stringify({
      type: 'transfer_success',
      payload: { clientId, newAgent: agentId }
    }));

    // Notificar destino
    if (targetWs?.readyState === WebSocket.OPEN) {
      targetWs.send(JSON.stringify({
        type: 'client_transferred',
        payload: { clientId }
      }));
    }
  }

  private static sendError(ws: WebSocket, message: string) {
    ws.send(JSON.stringify({
      type: 'transfer_error',
      payload: { message }
    }));
  }
  private static broadcastCategoryUpdate(
    clients: Map<string, ClientMetadata>, 
    newCategory: string,
    clientId: string
  ) {
    clients.forEach(agent => {
      if (
        (newCategory === 'cartera' && agent.permissions.includes('3')) ||
        (newCategory === 'atencionCliente' && agent.permissions.includes('2'))
      ) {
        agent.ws.send(JSON.stringify({
          type: 'category_updated',
          payload: { clientId, newCategory }
        }));
      }
    });
  }
}