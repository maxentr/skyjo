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

export type PlayerToJSON = {
  readonly name: string;
  readonly socketID: string;
  readonly avatar: Avatar;
  readonly score: number;
  readonly wantReplay: boolean;
};
