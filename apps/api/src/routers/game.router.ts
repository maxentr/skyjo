import { GameService } from "@/services/game.service"
import { socketErrorHandlerWrapper } from "@/utils/socketErrorHandlerWrapper"
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
  socket.on(
    "get",
    socketErrorHandlerWrapper(async () => {
      await instance.onGet(socket)
    }),
  )

  socket.on(
    "play:reveal-card",
    socketErrorHandlerWrapper(async (data: PlayRevealCard) => {
      const turnCardData = playRevealCard.parse(data)
      await instance.onRevealCard(socket, turnCardData)
    }),
  )

  socket.on(
    "play:pick-card",
    socketErrorHandlerWrapper(async (data: PlayPickCard) => {
      const playData = playPickCard.parse(data)
      await instance.onPickCard(socket, playData)
    }),
  )

  socket.on(
    "play:replace-card",
    socketErrorHandlerWrapper(async (data: PlayReplaceCard) => {
      const playData = playReplaceCard.parse(data)
      await instance.onReplaceCard(socket, playData)
    }),
  )

  socket.on(
    "play:discard-selected-card",
    socketErrorHandlerWrapper(async () => {
      await instance.onDiscardCard(socket)
    }),
  )

  socket.on(
    "play:turn-card",
    socketErrorHandlerWrapper(async (data: PlayTurnCard) => {
      const playData = playTurnCard.parse(data)
      await instance.onTurnCard(socket, playData)
    }),
  )

  socket.on(
    "replay",
    socketErrorHandlerWrapper(async () => {
      await instance.onReplay(socket)
    }),
  )
}

export { gameRouter }
