"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { cva } from "class-variance-authority"
import { SendIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { ChatMessage } from "shared/types/chat"
import { z } from "zod"

const Chat = () => {
  const [open, setOpen] = useState(false)
  const { chat } = useSkyjo()
  const t = useTranslations("components.chat")

  return (
    <div className="absolute right-8 top-full z-10 flex items-center justify-end">
      <div
        className={`w-80 h-fit px-2 pb-2 bg-white shadow border rounded-t-lg boder-slate-600 flex flex-col items-center duration-300 transition-transform ease-in-out ${
          open ? "-translate-y-full" : "-translate-y-11"
        }`}
      >
        <button
          className="text-center text-slate-800 font-semibold w-full px-4 py-2 border-b"
          onClick={() => setOpen(!open)}
        >
          {t("title")}
        </button>
        <div className="h-96 w-full flex flex-col">
          <div className="overflow-y-auto flex flex-grow flex-col py-2 pr-2.5 -mr-2 gap-2">
            {chat.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
          <ChatForm />
        </div>
      </div>
    </div>
  )
}

type ChatMessageProps = {
  message: ChatMessage
}

const chatMessageClasses = cva("font-medium", {
  variants: {
    type: {
      message: "text-slate-800",
      info: "text-blue-600",
      warn: "text-yellow-600",
      "player-joined": "text-green-600",
      "player-left": "text-red-600",
    },
  },
})

const ChatMessage = ({ message }: ChatMessageProps) => (
  <p
    className={cn(
      "font-inter text-sm",
      chatMessageClasses({ type: message.type }),
    )}
  >
    {message?.username && (
      <span className="font-bold">{message?.username} : </span>
    )}
    {message.message}
  </p>
)

const ChatForm = () => {
  const { toast } = useToast()
  const formSchema = z.object({
    message: z.string().max(200),
  })
  const { actions } = useSkyjo()
  const t = useTranslations("components.chat.form")
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.message) return

    if (values.message.length > 200) {
      toast({
        description: t("message-too-long.description"),
        variant: "destructive",
        duration: 3000,
      })
    } else actions.sendMessage(values.message)
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-row items-end w-full gap-2"
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
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button size="icon" type="submit" title={t("button-title")}>
          <SendIcon width={16} height={16} />
        </Button>
      </form>
    </Form>
  )
}

export default Chat
