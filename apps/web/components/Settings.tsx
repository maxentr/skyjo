"use client"

import { Button } from "@/components/ui/button"
import { SettingsIcon } from "lucide-react"
import { useState } from "react"

const Settings = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="icon" variant="ghost" onClick={() => setOpen(!open)}>
        <SettingsIcon />
      </Button>
      {/* TODO here settings dialog or dropdown menu */}
    </>
  )
}

export default Settings
