import { JoinGame, joinGame } from "shared/validations/joinGame.js"
import {
  PlayDiscardSelectedCard,
  PlayPickCard,
  PlayReplaceCard,
  PlayRevealCard,
  PlayTurnCard,
  playDiscardSelectedCard,
  playPickCard,
  playReplaceCard,
  playRevealCard,
  playTurnCard,
} from "shared/validations/play.js"
import { CreatePlayer, createPlayer } from "shared/validations/player.js"
import { StartGame, startGame } from "shared/validations/start.js"
import { Namespace } from "socket.io"
import { SkyjoPlayer } from "./class/SkyjoPlayer.js"
import skyjoController from "./controller.js"
import { SkyjoSocket } from "./types/skyjoSocket.js"

const instance = skyjoController.getInstance()

const skyjoRouter = (namespace: Namespace) => {
  namespace.on("connection", (socket: SkyjoSocket) => {
    console.log("Socket connected!", socket.id)

    socket.on("createPrivate", (player: CreatePlayer) => {
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
      } catch (error) {
        console.error(`Error while joining a game : ${error}`)

        socket.emit("errorJoin", error)
      }
    })

    socket.on("get", async (gameId: string) => {
      try {
        await instance.onGet(socket, gameId)
      } catch (error) {
        console.error(`Error while getting a game : ${error}`)
      }
    })

    socket.on("start", async (data: StartGame) => {
      try {
        const startGameData = startGame.parse(data)

        instance.startGame(socket, startGameData.gameId)
      } catch (error) {
        console.error(`Error while getting a game : ${error}`)
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

    socket.on(
      "play:discard-selected-card",
      async (data: PlayDiscardSelectedCard) => {
        try {
          const playData = playDiscardSelectedCard.parse(data)

          await instance.discardCard(socket, playData)
        } catch (error) {
          console.error(`Error while playing a game : ${error}`)
        }
      },
    )

    socket.on("play:turn-card", async (data: PlayTurnCard) => {
      try {
        const playData = playTurnCard.parse(data)

        await instance.turnCard(socket, playData)
      } catch (error) {
        console.error(`Error while playing a game : ${error}`)
      }
    })

    socket.on("replay", async (gameId: string) => {
      try {
        await instance.onReplay(socket, gameId)
      } catch (error) {
        console.error(`Error while replaying a game : ${error}`)
      }
    })

    socket.on("disconnect", () => {
      try {
        console.log("Socket disconnected!", socket.id)
        instance.onLeave(socket)
      } catch (error) {
        console.error(`Error while leaving a game : ${error}`)
      }
    })
  })
}

export default skyjoRouter
