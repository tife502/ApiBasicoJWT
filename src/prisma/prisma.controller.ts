import { Request, Response } from 'express';
import PrismaService from './prisma.service';



export class PrismaController {
    constructor(
        private readonly prismaService = new PrismaService(),
    ) { }

    onSomething = async (req: Request, res: Response) => {
        const payload = req.body;
        const mensaje = await this.prismaService.onSomething(payload);
        res.status(200).send(mensaje);
    }
   
}

