import express, {Express} from 'express';
import http from 'http';
import { Server as ServerIO } from 'socket.io';
import socketHandler from '../../socket';
import routes from '../../routes';

export class Server {
    private readonly app: Express;
    private readonly httpServer: http.Server;
    private readonly socketIo: ServerIO;

    constructor() {
        this.app = express();
        this.httpServer = new http.Server(this.app);
        this.socketIo = new ServerIO(this.httpServer);
    }

    public addPath(path) {
        this.app.use(express.static(path));
    }

    public addRoutes() {
        routes(this.app);
    }

    public addRedirect(endpoint, redirect) {
        this.app.get(endpoint, (req, res) => res.redirect(redirect));
    }

    public addSocketHandler() {
        socketHandler(this.socketIo);
    }

    public addListen(port, message) {
        this.httpServer.listen(port, () => console.log(message));
    }

    public get() {
        return {
            app: this.app,
            httpServer: this.httpServer,
            socketIo: this.socketIo
        }
    }
}

export type TServer = InstanceType<typeof Server>;
