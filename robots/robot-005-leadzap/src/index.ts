import { startRobot } from "../../../shared/engine/main.ts";
import { leadRobot } from "./robot.ts";

await startRobot(leadRobot, { configPath: new URL("../config/empresa.json", import.meta.url).pathname });
