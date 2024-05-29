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
import { ClientToServerEvents, ServerToClientEvents } from "shared/types/socket"
import {
  ChangeSettings,
  changeSettings,
} from "shared/validations/changeSettings"
import {
  SendChatMessage,
  sendChatMessage,
} from "shared/validations/chatMessage"
import { DisconnectReason, Server } from "socket.io"
import skyjoController from "./class/SkyjoGameController"
import { SkyjoSocket } from "./types/skyjoSocket"

const instance = skyjoController.getInstance()

const skyjoRouter = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
  io.on("connection", (socket: SkyjoSocket) => {
    if (socket.recovered) {
      instance.onReconnect(socket)
    }

    socket.on("create-private", (player: CreatePlayer) => {
      try {
        createPlayer.parse(player)

        instance.onCreate(socket, player)
      } catch (error) {
        console.error(`Error while creating a game : ${error}`)
      }
    })

    socket.on("find", async (player: CreatePlayer) => {
      try {
        createPlayer.parse(player)

        await instance.onFind(socket, player)
      } catch (error) {
        console.error(`Error while finding a game : ${error}`)
      }
    })

    socket.on("join", async (data: JoinGame) => {
      try {
        const { gameId, player } = joinGame.parse(data)

        await instance.onJoin(socket, gameId, player)
      } catch (error: any) {
        socket.emit("error:join", error.message)
        console.error(`Error while joining a game : ${error.message}`)
      }
    })

    socket.on("get", async () => {
      try {
        await instance.onGet(socket)
      } catch (error) {
        console.error(`Error while getting a game : ${error}`)
      }
    })

    socket.on("settings", async (data: ChangeSettings) => {
      try {
        const newSettings = changeSettings.parse(data)

        instance.onSettingsChange(socket, newSettings)
      } catch (error) {
        console.error(`Error while changing the game settings : ${error}`)
      }
    })

    socket.on("start", async () => {
      try {
        await instance.onGameStart(socket)
      } catch (error) {
        console.error(`Error while getting a game : ${error}`)
      }
    })

    socket.on("message", (data: SendChatMessage) => {
      try {
        const message = sendChatMessage.parse(data)

        instance.onMessage(socket, message)
      } catch (error) {
        console.error(`Error while chatting : ${error}`)
      }
    })

    socket.on("play:reveal-card", (data: PlayRevealCard) => {
      try {
        const turnCardData = playRevealCard.parse(data)

        instance.onRevealCard(socket, turnCardData)
      } catch (error) {
        console.error(`Error while turning a card : ${error}`)
      }
    })

    socket.on("play:pick-card", async (data: PlayPickCard) => {
      try {
        const playData = playPickCard.parse(data)

        await instance.onPickCard(socket, playData)
      } catch (error) {
        console.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("play:replace-card", async (data: PlayReplaceCard) => {
      try {
        const playData = playReplaceCard.parse(data)

        await instance.onReplaceCard(socket, playData)
      } catch (error) {
        console.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("play:discard-selected-card", async () => {
      try {
        await instance.onDiscardCard(socket)
      } catch (error) {
        console.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("play:turn-card", async (data: PlayTurnCard) => {
      try {
        const playData = playTurnCard.parse(data)
        await instance.onTurnCard(socket, playData)
      } catch (error) {
        console.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("replay", async () => {
      try {
        await instance.onReplay(socket)
      } catch (error) {
        console.error(`Error while replaying a game : ${error}`)
      }
    })

    socket.on("leave", async () => {
      try {
        await instance.onLeave(socket)
        socket.emit("leave:success")
      } catch (error) {
        console.error(`Error while leaving a game : ${error}`)
      }
    })

    socket.on("disconnect", async (reason: DisconnectReason) => {
      try {
        console.log(`Socket ${socket.id} disconnected for reason ${reason}`)
        if (reason === "ping timeout") await instance.onConnectionLost(socket)
        else await instance.onLeave(socket)
      } catch (error) {
        console.error(`Error while disconnecting a game : ${error}`)
      }
    })
  })
}

export default skyjoRouter
