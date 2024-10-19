"use client"

import ChatForm from "@/components/ChatForm"
import ChatMessageList from "@/components/ChatMessageList"
import { useChat } from "@/contexts/ChatContext"
import { useSettings } from "@/contexts/SettingsContext"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import { ClassValue } from "clsx"
import { m } from "framer-motion"
import { MessageCircleIcon } from "lucide-react"
import { useTranslations } from "next-intl"

const ChatNotificationVariant = cva("absolute rounded-full bg-red-400", {
  variants: {
    size: {
      small: "top-1.5 left-1.5 w-1 h-1",
      normal: "top-1.5 left-1.5 w-2 h-2",
      big: "top-1.5 left-1.5 w-3 h-3",
    },
  },
})

type ChatDesktopViewProps = {
  open: boolean
  toggleOpening: () => void
  disabled?: boolean
  className?: ClassValue
}

const ChatDesktopView = ({
  open,
  toggleOpening,
  disabled = false,
  className,
}: ChatDesktopViewProps) => {
  const t = useTranslations("components.Chat")
  const { hasUnreadMessage } = useChat()
  const {
    settings: { chatNotificationSize },
  } = useSettings()

  return (
    <div
      className={cn(
        "flex flex-row items-end transition-all duration-300 ease-in-out",
        open ? "w-72 xl:w-96" : "w-0",
        className,
      )}
    >
      <div className="relative">
        <button
          className="absolute bottom-16 right-full w-10 h-24 flex items-center justify-center bg-button text-center text-black border-2 border-r-0 rounded-s-lg border-black transition-all duration-200 focus-visible:outline-black focus-visible:-outline-offset-4 shadow-[3px_3px_0px_0px_rgba(0,0,0)]"
          onClick={toggleOpening}
          disabled={disabled}
        >
          {hasUnreadMessage && (
            <>
              <span
                className={ChatNotificationVariant({
                  size: chatNotificationSize,
                })}
              />
              <span
                className={cn(
                  ChatNotificationVariant({ size: chatNotificationSize }),
                  "animate-ping",
                )}
              />
            </>
          )}
          <MessageCircleIcon className="size-5" />
        </button>
      </div>
      <div className="flex w-full h-svh px-2 pb-2 bg-white shadow border-l-2 border-black z-10">
        <m.div
          animate={open ? "open" : "closed"}
          variants={{
            open: { opacity: 1 },
            closed: {
              opacity: 0,
            },
          }}
          transition={{ duration: 0.2 }}
          className="flex flex-grow flex-col items-center"
        >
          <p className="w-full text-center text-black text-xl pt-2 pb-1 border-b-2 border-black">
            {t("title")}
          </p>
          <ChatMessageList />
          <ChatForm chatOpen={open} />
        </m.div>
      </div>
    </div>
  )
}

export { ChatDesktopView }
