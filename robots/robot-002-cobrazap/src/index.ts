import { startRobot } from "../../../shared/engine/main.ts";
import { cobraRobot } from "./robot.ts";

await startRobot(cobraRobot, { configPath: new URL("../config/empresa.json", import.meta.url).pathname });
