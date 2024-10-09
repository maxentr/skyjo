import { Env } from "./env.schema";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}