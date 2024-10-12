"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSettings } from "@/contexts/SettingsContext"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Locales, locales } from "@/i18n"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"

type LocalListProps = {
  currentLocale: Locales
  updateLocale: (locale: Locales) => void
  t: ReturnType<typeof useTranslations<"components.LanguageCombobox">>
}
const LocaleList = ({ currentLocale, updateLocale, t }: LocalListProps) => {
  const translatedLocales = useMemo(
    () =>
      locales.map((locale) => ({
        locale,
        label: t(`locale.${locale}`),
      })),
    [t],
  )

  const orderedLocales = useMemo(
    () => translatedLocales.sort((a, b) => a.label.localeCompare(b.label)),
    [translatedLocales],
  )

  return (
    <Command>
      <CommandInput placeholder={t("search-language")} />
      <CommandList>
        <CommandEmpty>{t("no-language-found")}</CommandEmpty>
        <CommandGroup>
          {orderedLocales.map(({ locale, label }) => (
            <CommandItem
              key={locale}
              value={locale}
              onSelect={(value) => updateLocale(value as Locales)}
              className="flex flex-row justify-between"
            >
              <span>{label}</span>
              {locale === currentLocale && <CheckIcon className="h-4 w-4" />}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

const LanguageCombobox = () => {
  const {
    updateSetting,
    settings: { locale: currentLocale },
  } = useSettings()
  const t = useTranslations("components.LanguageCombobox")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [open, setOpen] = useState(false)

  const updateLocale = (locale: string) => {
    updateSetting("locale", locale as Locales)
    setOpen(false)
  }

  if (isDesktop)
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="input-list"
            aria-expanded={open}
            className="justify-between"
          >
            {currentLocale
              ? t(`locale.${currentLocale}`)
              : t("select-language")}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <LocaleList
            currentLocale={currentLocale}
            updateLocale={updateLocale}
            t={t}
          />
        </PopoverContent>
      </Popover>
    )

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="justify-start">
          {currentLocale ? t(`locale.${currentLocale}`) : t("select-language")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t-[1.5px] border-black">
          <LocaleList
            currentLocale={currentLocale}
            updateLocale={updateLocale}
            t={t}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { LanguageCombobox }
