// Ponto de entrada: `npm start` dentro da pasta do robô (ou `node src/index.ts`).
import { startRobot } from "../../../shared/engine/main.ts";
import { agendaRobot } from "./robot.ts";

await startRobot(agendaRobot, { configPath: new URL("../config/empresa.json", import.meta.url).pathname });
