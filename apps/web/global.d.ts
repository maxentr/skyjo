import { BeforeInstallPromptEvent } from "@/types/beforeInstallPrompt";

// Use type safe message keys with `next-intl
type EnglishMessages = typeof import("./locales/en.json")

declare interface IntlMessages extends EnglishMessages {}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}