// Use type safe message keys with `next-intl
type EnglishMessages = typeof import("./locales/en.json")

declare interface IntlMessages extends EnglishMessages {}
