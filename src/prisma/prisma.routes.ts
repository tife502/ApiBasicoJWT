import { Router } from "express";
import { PrismaController } from "./prisma.controller";

export class PrismaRoutes {


    static get routes(){ 
    const router= Router();

    const prismaController =new PrismaController();

    //funciones de recepcion de mensajes usuarios
    router.post(`/DB`,prismaController.onSomething);
   
    
return router;
 }
}