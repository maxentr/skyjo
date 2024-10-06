import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useSocket } from "@/contexts/SocketContext"
import { useTranslations } from "next-intl"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { KickVote } from "shared/types/kickVote"

type VoteKickContext = {
  actions: {
    initiateKickVote: (playerSocketId: string) => void
    voteToKick: (playerSocketId: string, vote: boolean) => void
  }
}

const VoteKickContext = createContext<VoteKickContext | undefined>(undefined)

export const VoteKickProvider = ({ children }: PropsWithChildren) => {
  const { socket } = useSocket()
  const { game, player } = useSkyjo()
  const { toast } = useToast()
  const t = useTranslations("components.KickVote")

  useEffect(() => {
    if (!game || !socket) return

    initKickVoteListeners()

    return destroyKickVoteListeners
  }, [socket, game])

  //#region listeners
  const onKickVoteStarted = ({ initiatorId, playerToKickId }: KickVote) => {
    const playerToKick = game?.players.find((p) => p.id === playerToKickId)
    const initiator = game?.players.find((p) => p.id === initiatorId)
    if (!playerToKick || !initiator) return

    if (playerToKick.id !== player.id) {
      toast({
        title: t("vote-started.title", { playerName: playerToKick.name }),
        description: (
          <Button onClick={() => voteToKick(playerToKick.id, true)}>
            {t("vote-started.button")}
          </Button>
        ),
        duration: 30000, // 30 seconds to vote
      })
    } else {
      toast({
        title: t("vote-started-against-you.title"),
        description: t("vote-started-against-you.description", {
          initiatorName: initiator.name,
        }),
        duration: 12000,
      })
    }
  }

  const onKickVoteFailed = ({ playerToKickId }: KickVote) => {
    const playerToKick = game?.players.find((p) => p.id === playerToKickId)
    if (!playerToKick) return

    toast({
      title: t("vote-failed.title"),
      description: t("vote-failed.description", {
        playerName: playerToKick.name,
      }),
      duration: 5000,
    })
  }

  const onPlayerKicked = ({ username }: { username: string }) => {
    toast({
      title: t("player-kicked.title"),
      description: t("player-kicked.description", {
        playerName: username,
      }),
      duration: 5000,
    })
  }

  const onYouWereKicked = () => {
    toast({
      title: t("you-were-kicked.title"),
      description: t("you-were-kicked.description"),
      duration: 5000,
    })
  }

  const initKickVoteListeners = () => {
    socket!.on("kick:vote-started", onKickVoteStarted)
    socket!.on("kick:vote-failed", onKickVoteFailed)
    socket!.on("kick:player-kicked", onPlayerKicked)
    socket!.on("kick:you-were-kicked", onYouWereKicked)
  }

  const destroyKickVoteListeners = () => {
    socket!.off("kick:vote-started", onKickVoteStarted)
    socket!.off("kick:vote-failed", onKickVoteFailed)
    socket!.off("kick:player-kicked", onPlayerKicked)
    socket!.off("kick:you-were-kicked", onYouWereKicked)
  }
  //#endregion

  //#region actions
  const initiateKickVote = (playerToKickId: string) => {
    socket!.emit("kick:initiate-vote", { playerToKickId })
    const playerToKick = game?.players.find(
      (p) => p.socketId === playerToKickId,
    )
    if (!playerToKick) return

    toast({
      title: t("vote-initiated.title"),
      description: t("vote-initiated.description", {
        playerName: playerToKick.name,
      }),
      duration: 5000,
    })
  }

  const voteToKick = (playerToKickId: string, vote: boolean) => {
    socket!.emit("kick:vote", { playerToKickId, vote })
  }

  const actions = {
    initiateKickVote,
    voteToKick,
  }
  //#endregion

  const providerValue = useMemo(() => ({ actions }), [])

  return (
    <VoteKickContext.Provider value={providerValue}>
      {children}
    </VoteKickContext.Provider>
  )
}

export const useVoteKick = () => {
  const context = useContext(VoteKickContext)
  if (context === undefined) {
    throw new Error("useVoteKick must be used within a VoteKickProvider")
  }
  return context
}
