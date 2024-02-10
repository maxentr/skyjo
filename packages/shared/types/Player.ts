export type Avatar =
  | "bee"
  | "crab"
  | "dog"
  | "elephant"
  | "fox"
  | "frog"
  | "koala"
  | "octopus"
  | "penguin"
  | "turtle"
  | "whale";

export type PlayertoJson = {
  readonly name: string;
  readonly socketId: string;
  readonly avatar: Avatar;
  readonly score: number;
  readonly wantReplay: boolean;
};
