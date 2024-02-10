import { PlayertoJson } from "./Player";
import { SkyjoCardtoJson } from "./SkyjoCard";

export interface SkyjoPlayertoJson extends PlayertoJson {
  readonly scores: number[];
  readonly currentScore: number;
  readonly cards: SkyjoCardtoJson[][];
}
