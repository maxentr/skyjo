import { PlayerToJSON } from "./Player";
import { SkyjoCardToJSON } from "./SkyjoCard";

export interface SkyjoPlayerToJSON extends PlayerToJSON {
  readonly scores: number[];
  readonly currentScore: number;
  readonly cards: SkyjoCardToJSON[][];
}
