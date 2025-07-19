import express, { Router } from "express";
import path from "path";
import cors from "cors";

interface Options {
  port: number;
  public_path?: string;
}

export class Server {
  /****************************************************** 
    todo lo relacionado con la configuracion del server
  *******************************************************/
  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly publicPath: string;


  constructor(options: Options) {
    const { port, public_path = "public" } = options;
    this.port = port;
    this.publicPath = public_path;
    this.configure();
  }

  private configure() {
    
    /******************************************************* 
    Middlewares aqui se configuran los middlewares del server
    aqui se configura el cors, el tamaño del body y el urlencoded
    ********************************************************/
     
    this.app.use(cors({
      origin: '*', // Permitir todas las solicitudes de origen
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    this.app.use(express.json({ limit: '100mb' })); //100mb provisional
    this.app.use(express.urlencoded({ limit: '100mb', extended: true }));

    //* Public Folder
    // no implementado aqui se pondria algo por si buscan el server
    // desde la carpeta public
    this.app.use(express.static(this.publicPath));

    //* SPA /^\/(?!api).*/  <== Únicamente si no empieza con la palabra api
    this.app.get(/^\/(?!api).*/, (req, res) => {
      const indexPath = path.join(
        __dirname + `../../../${this.publicPath}/index.html`
      );
      res.sendFile(indexPath);
    });
  }

public setRoutes(router:Router){
  this.app.use(router);
}

  async start() {
    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  public close() {
    this.serverListener?.close();
  }
}
