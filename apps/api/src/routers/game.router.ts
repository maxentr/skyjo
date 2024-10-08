import { GameService } from "@/services/game.service"
import { logger } from "@/utils/logs"
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
import { SkyjoSocket } from "../types/skyjoSocket"

const instance = new GameService()

const gameRouter = (socket: SkyjoSocket) => {
  socket.on("get", async () => {
    try {
      await instance.onGet(socket)
    } catch (error) {
      logger.error(`Error while getting a game : ${error}`)
    }
  })

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
}

export { gameRouter }
