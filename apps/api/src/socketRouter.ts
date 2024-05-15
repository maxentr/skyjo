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
  SendChatMessage,
  sendChatMessage,
} from "shared/validations/chatMessage"
import { DisconnectReason, Server } from "socket.io"
import { SkyjoPlayer } from "./class/SkyjoPlayer"
import skyjoController from "./controller"
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
        // Check if the player is valid
        createPlayer.parse(player)

        instance.create(socket, player)
      } catch (error) {
        console.error(`Error while creating a game : ${error}`)
      }
    })

    socket.on("find", async (player: CreatePlayer) => {
      try {
        // Check if the player is valid
        createPlayer.parse(player)

        const game = instance.getGameWithFreePlace()
        const newPlayer = new SkyjoPlayer(
          player.username,
          socket.id,
          player.avatar,
        )

        if (game) await instance.onJoin(socket, game.id, newPlayer)
        else await instance.create(socket, player, false)
      } catch (error) {
        console.error(`Error while finding a game : ${error}`)
      }
    })

    socket.on("join", async (data: JoinGame) => {
      try {
        // Check if the data is valid
        const { gameId, player } = joinGame.parse(data)

        const newPlayer = new SkyjoPlayer(
          player.username,
          socket.id,
          player.avatar,
        )

        await instance.onJoin(socket, gameId, newPlayer)
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

    socket.on("start", async () => {
      try {
        instance.startGame(socket)
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

        instance.playRevealCard(socket, turnCardData)
      } catch (error) {
        console.error(`Error while turning a card : ${error}`)
      }
    })

    socket.on("play:pick-card", async (data: PlayPickCard) => {
      try {
        const playData = playPickCard.parse(data)

        await instance.pickCard(socket, playData)
      } catch (error) {
        console.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("play:replace-card", async (data: PlayReplaceCard) => {
      try {
        const playData = playReplaceCard.parse(data)

        await instance.replaceCard(socket, playData)
      } catch (error) {
        console.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("play:discard-selected-card", async () => {
      try {
        await instance.discardCard(socket)
      } catch (error) {
        console.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("play:turn-card", async (data: PlayTurnCard) => {
      try {
        const playData = playTurnCard.parse(data)
        await instance.turnCard(socket, playData)
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
