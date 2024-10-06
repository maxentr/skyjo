import { logger } from "@/utils/logs"
import { ClientToServerEvents, ServerToClientEvents } from "shared/types/socket"
import {
  ChangeSettings,
  changeSettings,
} from "shared/validations/changeSettings"
import {
  SendChatMessage,
  sendChatMessage,
} from "shared/validations/chatMessage"
import { JoinGame, joinGame } from "shared/validations/joinGame"
import {
  PlayPickCard,
  PlayReplaceCard,
  PlayRevealCard,
  PlayTurnCard,
  playPickCard,
  playReplaceCard,
  playRevealCard,
  playTurnCard,
} from "shared/validations/play"
import { CreatePlayer, createPlayer } from "shared/validations/player"
import { LastGame, reconnect } from "shared/validations/reconnect"
import { DisconnectReason, Server } from "socket.io"
import skyjoController from "./class/SkyjoGameController"
import { SkyjoSocket } from "./types/skyjoSocket"

const instance = skyjoController.getInstance()

const skyjoRouter = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
  io.on("connection", (socket: SkyjoSocket) => {
    socket.on("create-private", (player: CreatePlayer) => {
      try {
        const parsedPlayer = createPlayer.parse(player)

        instance.onCreate(socket, parsedPlayer)
      } catch (error) {
        logger.error(`Error while creating a game : ${error}`)
      }
    })

    socket.on("find", async (player: CreatePlayer) => {
      try {
        const parsedPlayer = createPlayer.parse(player)

        await instance.onFind(socket, parsedPlayer)
      } catch (error) {
        logger.error(`Error while finding a game : ${error}`)
      }
    })

    socket.on("join", async (data: JoinGame) => {
      try {
        const { gameCode, player } = joinGame.parse(data)

        await instance.onJoin(socket, gameCode, player)
      } catch (error: unknown) {
        if (error instanceof Error) {
          socket.emit("error:join", error.message)
          logger.error(`Error while joining a game : ${error.message}`)
        }
      }
    })

    socket.on("get", async () => {
      try {
        await instance.onGet(socket)
      } catch (error) {
        logger.error(`Error while getting a game : ${error}`)
      }
    })

    socket.on("settings", async (data: ChangeSettings) => {
      try {
        const newSettings = changeSettings.parse(data)

        instance.onSettingsChange(socket, newSettings)
      } catch (error) {
        logger.error(`Error while changing the game settings : ${error}`)
      }
    })

    socket.on("start", async () => {
      try {
        await instance.onGameStart(socket)
      } catch (error) {
        logger.error(`Error while getting a game : ${error}`)
      }
    })

    socket.on("message", (data: SendChatMessage) => {
      try {
        const message = sendChatMessage.parse(data)

        instance.onMessage(socket, message)
      } catch (error) {
        logger.error(`Error while chatting : ${error}`)
      }
    })

    socket.on(
      "kick:initiate-vote",
      async (data: { playerToKickId: string }) => {
        try {
          const { playerToKickId } = data

          await instance.onInitiateKickVote(socket, playerToKickId)
        } catch (error) {
          logger.error(`Error while initiating a kick vote : ${error}`)
        }
      },
    )

    socket.on(
      "kick:vote",
      async (data: { playerToKickId: string; vote: boolean }) => {
        try {
          const { playerToKickId, vote } = data

          await instance.onVoteToKick(socket, playerToKickId, vote)
        } catch (error) {
          logger.error(`Error while voting to kick a player : ${error}`)
        }
      },
    )

    socket.on("play:reveal-card", (data: PlayRevealCard) => {
      try {
        const turnCardData = playRevealCard.parse(data)

        instance.onRevealCard(socket, turnCardData)
      } catch (error) {
        logger.error(`Error while turning a card : ${error}`)
      }
    })

    socket.on("play:pick-card", async (data: PlayPickCard) => {
      try {
        const playData = playPickCard.parse(data)

        await instance.onPickCard(socket, playData)
      } catch (error) {
        logger.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("play:replace-card", async (data: PlayReplaceCard) => {
      try {
        const playData = playReplaceCard.parse(data)

        await instance.onReplaceCard(socket, playData)
      } catch (error) {
        logger.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("play:discard-selected-card", async () => {
      try {
        await instance.onDiscardCard(socket)
      } catch (error) {
        logger.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("play:turn-card", async (data: PlayTurnCard) => {
      try {
        const playData = playTurnCard.parse(data)
        await instance.onTurnCard(socket, playData)
      } catch (error) {
        logger.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("replay", async () => {
      try {
        await instance.onReplay(socket)
      } catch (error) {
        logger.error(`Error while replaying a game : ${error}`)
      }
    })

    socket.on("leave", async () => {
      try {
        await instance.onLeave(socket)
        socket.emit("leave:success")
      } catch (error) {
        logger.error(`Error while leaving a game : ${error}`)
      }
    })

    socket.on("disconnect", async (reason: DisconnectReason) => {
      try {
        logger.info(`Socket ${socket.id} disconnected for reason ${reason}`)
        if (reason === "ping timeout") await instance.onLeave(socket, true)
        else await instance.onLeave(socket)
      } catch (error) {
        logger.error(`Error while disconnecting a game : ${error}`)
      }
    })

    socket.on("reconnect", async (reconnectData: LastGame) => {
      try {
        reconnect.parse(reconnectData)

        await instance.onReconnect(socket, reconnectData)
      } catch (error) {
        if (error instanceof Error) {
          socket.emit("error:reconnect", error.message)
          logger.error(`Error while reconnecting a game : ${error.message}`)
        }
      }
    })
  })
}

export default skyjoRouter
