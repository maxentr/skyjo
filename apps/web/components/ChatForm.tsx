"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useChat } from "@/contexts/ChatContext"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { SendIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const chatFormSchema = z.object({
  message: z.string().max(200),
})

type ChatFormProps = {
  chatOpen: boolean
}

const ChatForm = ({ chatOpen }: ChatFormProps) => {
  const { toast } = useToast()
  const { player, opponents } = useSkyjo()
  const { sendMessage, clearUnreadMessages } = useChat()
  const t = useTranslations("components.ChatForm")
  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: "",
    },
  })

  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([])
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const [tabIndex, setTabIndex] = useState(-1)

  useEffect(() => {
    if (chatOpen) setTimeout(() => setTabIndex(0), 300)
    else setTabIndex(-1)
  }, [chatOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    form.setValue("message", value)

    const lastWord = value.split(" ").pop() || ""
    if (lastWord.startsWith("@")) {
      const searchTerm = lastWord.slice(1).toLowerCase()
      const matchingPlayers = opponents
        .flat()
        .map((p) => p.name)
        .filter((p) => p.toLowerCase().includes(searchTerm))

      setAutocompleteOptions(matchingPlayers)
      setShowAutocomplete(matchingPlayers.length > 0)
      setSelectedOptionIndex(0)
    } else {
      setShowAutocomplete(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showAutocomplete) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedOptionIndex(
          (prev) => (prev + 1) % autocompleteOptions.length,
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedOptionIndex(
          (prev) =>
            (prev - 1 + autocompleteOptions.length) %
            autocompleteOptions.length,
        )
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        insertPlayerTag(autocompleteOptions[selectedOptionIndex])
      }
    }
  }

  const insertPlayerTag = (playerName: string) => {
    const currentValue = form.getValues("message")
    const words = currentValue.split(" ")
    words[words.length - 1] = `@${playerName}`
    const newValue = words.join(" ") + " "
    form.setValue("message", newValue)
    setShowAutocomplete(false)
    inputRef.current?.focus()
  }

  const onSubmit = (values: z.infer<typeof chatFormSchema>) => {
    if (!values.message) return

    if (values.message.length > 200) {
      toast({
        description: t("message-too-long.description"),
        variant: "destructive",
        duration: 3000,
      })
    } else {
      sendMessage(player.name, values.message)
      clearUnreadMessages()
    }

    form.reset()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-row items-end w-full gap-2 relative"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex flex-1">
              <FormControl>
                <Input
                  placeholder={t("message-input-placeholder")}
                  className={cn(
                    "flex flex-1",
                    form.formState.errors.message &&
                      "focus-visible:ring-red-500",
                  )}
                  tabIndex={tabIndex}
                  autoComplete="off"
                  {...field}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  ref={inputRef}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {showAutocomplete && (
          <div className="absolute bottom-full left-0 bg-white border-2 border-black rounded-md max-h-32 overflow-y-auto select-none">
            {autocompleteOptions.map((option, index) => (
              <div
                key={option}
                className={cn(
                  "px-2 py-1 cursor-pointer hover:bg-gray-100",
                  index === selectedOptionIndex && "",
                )}
                onClick={() => insertPlayerTag(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
        <Button
          variant="icon"
          type="submit"
          title={t("button-title")}
          tabIndex={tabIndex}
        >
          <SendIcon width={16} height={16} />
        </Button>
      </form>
    </Form>
  )
}

export default ChatForm
