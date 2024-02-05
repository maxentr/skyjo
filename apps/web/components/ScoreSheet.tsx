import ScoreTable from "@/components/ScoreTable"
import { useState } from "react"
import { SkyjoPlayerToJSON } from "shared/types/SkyjoPlayer"

type Props = {
  players: SkyjoPlayerToJSON[]
}

const ScoreSheet = ({ players }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute right-8 -bottom-6 z-10 flex items-center justify-end">
      <div
        className={`w-fit h-fit bg-white shadow border rounded-t-lg boder-slate-600 flex flex-col items-center duration-300 transition-transform ease-in-out ${
          open ? "translate-y-0" : "-translate-y-[calc(-100%+2.75rem)]"
        }`}
      >
        <button
          className="text-center text-slate-800 font-semibold w-full px-4 py-2 border-b"
          onClick={() => setOpen(!open)}
        >
          Voir scores
        </button>
        <ScoreTable players={players} />
      </div>
    </div>
  )
}

export default ScoreSheet
