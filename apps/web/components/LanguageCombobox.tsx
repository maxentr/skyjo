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
import { useState } from "react"

import { useMemo } from "react"

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

  const LocaleList = () => {
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
                value={locale}
                onSelect={updateLocale}
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

  if (isDesktop)
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {currentLocale
              ? t(`locale.${currentLocale}`)
              : t("select-language")}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <LocaleList />
        </PopoverContent>
      </Popover>
    )

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          {currentLocale ? t(`locale.${currentLocale}`) : t("select-language")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <LocaleList />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { LanguageCombobox }
