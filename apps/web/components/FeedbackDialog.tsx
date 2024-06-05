"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { feedbackSchema } from "shared/validations/feedback"
import { z } from "zod"

type FeedbackDialogProps = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const FeedbackDialog = ({ open, setOpen }: FeedbackDialogProps) => {
  const t = useTranslations("components.FeedbackDialog")
  const { toast } = useToast()

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      email: "",
      message: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof feedbackSchema>) => {
    if (!values.message) return

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      },
    )

    const data = await response.json()

    if (data.success) {
      form.reset()

      setOpen(false)
      toast({
        title: t("toast.success.title"),
        description: t("toast.success.description"),
        duration: 8000,
      })
    } else {
      toast({
        title: t("toast.error.title"),
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} data-testid="feedback-dialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="mt-2">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col w-full gap-2"
          >
            <Label htmlFor="email" data-testid="feedback-email-label">
              {t("email-input.label")}
            </Label>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-1">
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("email-input.placeholder")}
                      className={cn(
                        form.formState.errors.email &&
                          "focus-visible:ring-red-500",
                      )}
                      data-testid="feedback-email-input"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Label htmlFor="message" data-testid="feedback-message-label">
              {t("message-input.label")}
            </Label>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex flex-1">
                  <FormControl>
                    <Textarea
                      id="message"
                      required
                      placeholder={t("message-input.placeholder")}
                      className={cn(
                        "flex flex-1",
                        form.formState.errors.message &&
                          "focus-visible:ring-red-500",
                      )}
                      rows={4}
                      data-testid="feedback-message-input"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              title={t("button-title")}
              className="w-fit self-end"
              data-testid="feedback-submit-button"
            >
              {t("button-title")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default FeedbackDialog
