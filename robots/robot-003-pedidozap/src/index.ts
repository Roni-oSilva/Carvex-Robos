import { startRobot } from "../../../shared/engine/main.ts";
import { pedidoRobot } from "./robot.ts";

await startRobot(pedidoRobot, { configPath: new URL("../config/empresa.json", import.meta.url).pathname });
