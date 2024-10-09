import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useSocket } from "@/contexts/SocketContext"
import { useRouter } from "@/navigation"
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
  const { toast, dismiss } = useToast()
  const t = useTranslations("components.KickVote")
  const router = useRouter()

  useEffect(() => {
    if (!game || !socket) return

    initKickVoteListeners()

    return destroyKickVoteListeners
  }, [socket, game])

  //#region listeners
  const onKickVote = ({
    initiatorId,
    playerToKickId,
    votes,
    requiredVotes,
  }: KickVote) => {
    const playerToKick = game?.players.find((p) => p.id === playerToKickId)
    const initiator = game?.players.find((p) => p.id === initiatorId)
    if (!playerToKick || !initiator) return

    const isPlayerToKick = playerToKick.id === player.id
    const hasVoted = votes.find((v) => v.playerId === player.id)
    if (isPlayerToKick) {
      toast({
        title: t("vote-started-against-you.title"),
        description: t("vote-started-against-you.description", {
          initiatorName: initiator.name,
        }),
        duration: 12000,
      })
    } else if (hasVoted) {
      toast({
        title: t("vote-updated.title", { playerName: playerToKick.name }),
        description: t("vote-updated.description", {
          playerName: playerToKick.name,
          yesVotes: votes.filter((v) => v.vote).length,
          requiredVotes,
        }),
        duration: 30000, // 30 seconds to vote
      })
    } else {
      toast({
        title: t("vote-started.title", { playerName: playerToKick.name }),
        description: (
          <div className="flex flex-row items-center gap-2">
            <Button
              onClick={() => voteToKick(playerToKick.id, true)}
              title={t("vote-started.kick-button.title")}
              variant="small"
            >
              {t("vote-started.kick-button.label")}
            </Button>
            <Button
              onClick={() => dismiss()}
              title={t("vote-started.dismiss-button.title")}
              variant="small"
              className="bg-gray-200"
            >
              {t("vote-started.dismiss-button.label")}
            </Button>
          </div>
        ),
        duration: 30000, // 30 seconds to vote
      })
    }
  }

  const onKickVoteFailed = ({ playerToKickId }: KickVote) => {
    const playerToKick = game?.players.find((p) => p.id === playerToKickId)
    if (!playerToKick) return

    const isPlayerToKick = playerToKick.id === player.id
    if (isPlayerToKick) {
      toast({
        title: t("you-were-not-kicked.title"),
        description: t("you-were-not-kicked.description"),
        duration: 5000,
      })
    } else {
      toast({
        title: t("vote-failed.title", { playerName: playerToKick.name }),
        description: t("vote-failed.description", {
          playerName: playerToKick.name,
        }),
        duration: 5000,
      })
    }
  }

  const onKickVoteSuccess = ({ playerToKickId }: KickVote) => {
    const playerToKick = game?.players.find((p) => p.id === playerToKickId)
    if (!playerToKick) return

    const isPlayerToKick = playerToKick.id === player.id
    if (isPlayerToKick) {
      onYouWereKicked()
    } else {
      toast({
        title: t("player-kicked.title", { playerName: playerToKick.name }),
        description: t("player-kicked.description", {
          playerName: playerToKick.name,
        }),
        duration: 5000,
      })
    }
  }

  const onYouWereKicked = () => {
    toast({
      title: t("you-were-kicked.title"),
      description: t("you-were-kicked.description"),
      duration: 5000,
    })
    router.replace("/")
  }

  const initKickVoteListeners = () => {
    socket!.on("kick:vote", onKickVote)
    socket!.on("kick:vote-success", onKickVoteSuccess)
    socket!.on("kick:vote-failed", onKickVoteFailed)
  }

  const destroyKickVoteListeners = () => {
    socket!.off("kick:vote", onKickVote)
    socket!.off("kick:vote-success", onKickVoteSuccess)
    socket!.off("kick:vote-failed", onKickVoteFailed)
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
