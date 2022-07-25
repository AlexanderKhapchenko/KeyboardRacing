import {ServerFacade} from './component/server/server-facade';
import {Server} from "./component/server/server";

const {app, httpServer} = new ServerFacade(new Server()).start();

export {app, httpServer};
