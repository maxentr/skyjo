"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { SendIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const chatFormSchema = z.object({
  message: z.string().max(200),
})

type ChatFormProps = {
  chatOpen: boolean
  onMessageSent: () => void
}

const ChatForm = ({ chatOpen, onMessageSent }: ChatFormProps) => {
  const { toast } = useToast()
  const { actions } = useSkyjo()
  const t = useTranslations("components.ChatForm")
  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: "",
    },
  })

  const [tabIndex, setTabIndex] = useState(-1)

  useEffect(() => {
    if (chatOpen) setTimeout(() => setTabIndex(0), 300)
    else setTabIndex(-1)
  }, [chatOpen])

  const onSubmit = (values: z.infer<typeof chatFormSchema>) => {
    if (!values.message) return

    if (values.message.length > 200) {
      toast({
        description: t("message-too-long.description"),
        variant: "destructive",
        duration: 3000,
      })
    } else {
      onMessageSent()
      actions.sendMessage(values.message)
    }

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
                  tabIndex={tabIndex}
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
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
