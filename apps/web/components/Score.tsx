"use client"

import ScoreDialog from "@/components/ScoreDialog"
import { Button } from "@/components/ui/button"
import { ListIcon } from "lucide-react"
import { useState } from "react"

//? TODO Score in dialog or in an other place ?????????????????????????????????????????
const Score = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="icon" variant="ghost" onClick={() => setOpen(!open)}>
        <ListIcon />
      </Button>

      <ScoreDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

export default Score
