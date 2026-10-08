// Lista de todos os robôs da fábrica. Para criar um novo robô: crie a pasta em robots/ e registre aqui.
import type { Robot } from "../shared/engine/types.ts";
import { agendaRobot } from "./robot-001-agendazap/src/robot.ts";
import { cobraRobot } from "./robot-002-cobrazap/src/robot.ts";
import { pedidoRobot } from "./robot-003-pedidozap/src/robot.ts";
import { orcaRobot } from "./robot-004-orcazap/src/robot.ts";
import { leadRobot } from "./robot-005-leadzap/src/robot.ts";

export const registry: Record<string, Robot<never>> = {
  [agendaRobot.id]: agendaRobot as unknown as Robot<never>,
  [cobraRobot.id]: cobraRobot as unknown as Robot<never>,
  [pedidoRobot.id]: pedidoRobot as unknown as Robot<never>,
  [orcaRobot.id]: orcaRobot as unknown as Robot<never>,
  [leadRobot.id]: leadRobot as unknown as Robot<never>,
};
