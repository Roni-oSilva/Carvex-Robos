import { startRobot } from "../../../shared/engine/main.ts";
import { orcaRobot } from "./robot.ts";

await startRobot(orcaRobot, { configPath: new URL("../config/empresa.json", import.meta.url).pathname });
