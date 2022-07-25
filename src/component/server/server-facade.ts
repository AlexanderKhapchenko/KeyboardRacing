import {Server, TServer} from "./server";
import {PORT, STATIC_PATH} from "../../config";

export class ServerFacade {

    constructor(private server: TServer) {
    }

    start() {
        this.server.addPath(STATIC_PATH);
        this.server.addRoutes();
        this.server.addRedirect('*', '/login');
        this.server.addSocketHandler();
        this.server.addListen(PORT, `Listen server on port ${PORT}`);

        return this.server.get();
    }
}