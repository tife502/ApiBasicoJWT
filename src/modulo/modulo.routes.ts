import { Router } from "express";

import { ModuloController } from "./modulo.controller";
import { AuthMiddleware } from "../presentation/middlewares/auth.middleware";

export class ModuloRoutes {


    static get routes(){ 
    const router= Router();

    const moduloController =new ModuloController();

    //funciones de recepcion de mensajes usuarios - protegidas con JWT
    router.post(`/ejemplo`, AuthMiddleware.validateJWT, moduloController.onSomething);
   
    
return router;
 }
}