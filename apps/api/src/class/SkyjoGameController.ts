import { SkyjoSettings } from "@/class/SkyjoSettings"
import { GameService } from "@/service/game.service"
import { PlayerService } from "@/service/player.service"
import { logger } from "@/utils/logs"
import cron from "node-cron"
import {
  CONNECTION_LOST_TIMEOUT_IN_MS,
  CONNECTION_STATUS,
  ERROR,
  GAME_STATUS,
  LEAVE_TIMEOUT_IN_MS,
  ROUND_STATUS,
  SERVER_MESSAGE_TYPE,
  TURN_STATUS,
  TurnStatus,
  USER_MESSAGE_TYPE,
} from "shared/constants"
import { ServerChatMessage, UserChatMessage } from "shared/types/chat"
import { ChangeSettings } from "shared/validations/changeSettings"
import {
  PlayPickCard,
  PlayReplaceCard,
  PlayRevealCard,
  PlayTurnCard,
} from "shared/validations/play"
import { CreatePlayer } from "shared/validations/player"
import { LastGame } from "shared/validations/reconnect"
import { SkyjoSocket } from "../types/skyjoSocket"
import { KickVoteController } from "./KickVoteController"
import { Skyjo } from "./Skyjo"
import { SkyjoPlayer } from "./SkyjoPlayer"

export default class SkyjoGameController {
  private gameService: GameService = new GameService()
  private playerService: PlayerService = new PlayerService()
  private kickVoteController: KickVoteController = new KickVoteController(
    this.playerService,
    this.gameService,
  )
  private static instance: SkyjoGameController

  private games: Skyjo[] = []

  static getInstance(test: boolean = false): SkyjoGameController {
    if (!SkyjoGameController.instance) {
      SkyjoGameController.instance = new SkyjoGameController()

      if (!test) SkyjoGameController.instance.beforeStart()
    }

    return SkyjoGameController.instance
  }

  //#region controllers

  async onGet(socket: SkyjoSocket) {
    const game = await this.getGame(socket.data.gameCode)

    socket.emit("game", game.toJson())
  }
  async onCreate(
    socket: SkyjoSocket,
    playerToCreate: CreatePlayer,
    isPrivateGame = true,
  ) {
    const { game, player } = await this.createGame(
      socket,
      playerToCreate,
      isPrivateGame,
    )

    await this.addPlayerToGame(socket, game, player)
    await this.joinGame(socket, game, player)
  }

  async onJoin(
    socket: SkyjoSocket,
    gameCode: string,
    playerToCreate: CreatePlayer,
  ) {
    const game = await this.getGame(gameCode)

    const player = new SkyjoPlayer(playerToCreate, socket.id)

    await this.addPlayerToGame(socket, game, player)
    await this.joinGame(socket, game, player)
  }

  async onFind(socket: SkyjoSocket, playerToCreate: CreatePlayer) {
    const game = await this.getPublicGameWithFreePlace()

    if (!game) {
      await this.onCreate(socket, playerToCreate, false)
    } else {
      await this.onJoin(socket, game.code, playerToCreate)
    }
  }

  async onSettingsChange(socket: SkyjoSocket, settings: ChangeSettings) {
    const game = await this.getGame(socket.data.gameCode)
    if (!game.isAdmin(socket.data.playerId)) throw new Error(ERROR.NOT_ALLOWED)

    game.settings.changeSettings(settings)
    game.updatedAt = new Date()

    const updateSettings = this.gameService.updateSettings(
      game.id,
      game.settings,
    )
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateSettings, broadcast])
  }

  async onGameStart(socket: SkyjoSocket) {
    const game = await this.getGame(socket.data.gameCode)
    if (!game.isAdmin(socket.data.playerId)) throw new Error(ERROR.NOT_ALLOWED)

    game.start()

    const updateGame = this.gameService.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  //#region game actions
  async onRevealCard(socket: SkyjoSocket, turnData: PlayRevealCard) {
    const { column, row } = turnData
    const gameCode = socket.data.gameCode

    const game = await this.getGame(gameCode)

    const player = game.getPlayerById(socket.data.playerId)
    if (!player) throw new Error(ERROR.PLAYER_NOT_FOUND)

    if (
      game.status !== GAME_STATUS.PLAYING ||
      game.roundStatus !== ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS
    )
      throw new Error(ERROR.NOT_ALLOWED)

    if (player.hasRevealedCardCount(game.settings.initialTurnedCount)) return

    player.turnCard(column, row)

    game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

    const updateGame = this.gameService.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  async onPickCard(socket: SkyjoSocket, { pile }: PlayPickCard) {
    const { game } = await this.checkPlayAuthorization(socket, [
      TURN_STATUS.CHOOSE_A_PILE,
    ])

    if (pile === "draw") game.drawCard()
    else game.pickFromDiscard()

    const updateGame = this.gameService.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  async onReplaceCard(socket: SkyjoSocket, { column, row }: PlayReplaceCard) {
    const { game } = await this.checkPlayAuthorization(socket, [
      TURN_STATUS.REPLACE_A_CARD,
      TURN_STATUS.THROW_OR_REPLACE,
    ])

    game.replaceCard(column, row)

    const updateGame = this.gameService.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])

    await this.finishTurn(socket, game)
  }

  async onDiscardCard(socket: SkyjoSocket) {
    const { game } = await this.checkPlayAuthorization(socket, [
      TURN_STATUS.THROW_OR_REPLACE,
    ])

    game.discardCard(game.selectedCardValue!)

    const updateGame = this.gameService.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  async onTurnCard(socket: SkyjoSocket, { column, row }: PlayTurnCard) {
    const { game, player } = await this.checkPlayAuthorization(socket, [
      TURN_STATUS.TURN_A_CARD,
    ])

    game.turnCard(player, column, row)

    await this.broadcastGame(socket, game)

    await this.finishTurn(socket, game)
  }
  //#endregion

  async onReplay(socket: SkyjoSocket) {
    const game = await this.getGame(socket.data.gameCode)
    if (game.status !== GAME_STATUS.FINISHED) throw new Error(ERROR.NOT_ALLOWED)

    game.getPlayerById(socket.data.playerId)?.toggleReplay()

    game.restartGameIfAllPlayersWantReplay()

    const updateGame = this.gameService.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  async onReconnect(socket: SkyjoSocket, reconnectData: LastGame) {
    const isPlayerInGame = await this.gameService.isPlayerInGame(
      reconnectData.gameCode,
      reconnectData.playerId,
    )
    if (!isPlayerInGame) throw new Error(ERROR.PLAYER_NOT_FOUND)

    const canReconnect = await this.playerService.canReconnect(
      reconnectData.playerId,
    )
    if (!canReconnect) throw new Error(ERROR.CANNOT_RECONNECT)

    await this.playerService.updateSocketId(reconnectData.playerId, socket.id)

    const game = await this.getGame(reconnectData.gameCode)

    const player = game.getPlayerById(reconnectData.playerId)!

    if (player.disconnectionTimeout) clearTimeout(player.disconnectionTimeout)
    player.socketId = socket.id
    player.connectionStatus = CONNECTION_STATUS.CONNECTED

    const updatePlayer = this.playerService.reconnectPlayer(player)
    const joinGame = this.joinGame(socket, game, player, true)

    await Promise.all([updatePlayer, joinGame])
  }

  async onLeave(socket: SkyjoSocket, timeout: boolean = false) {
    const game = await this.getGame(socket.data.gameCode)

    const player = game.getPlayerById(socket.data.playerId)
    if (!player) throw new Error(ERROR.PLAYER_NOT_FOUND)

    player.connectionStatus = timeout
      ? CONNECTION_STATUS.CONNECTION_LOST
      : CONNECTION_STATUS.LEAVE
    await this.playerService.updatePlayer(player)

    if (game.isAdmin(player.id)) await this.changeAdmin(game)

    if (
      game.status === GAME_STATUS.LOBBY ||
      game.status === GAME_STATUS.FINISHED ||
      game.status === GAME_STATUS.STOPPED
    ) {
      game.removePlayer(player.id)
      await this.playerService.removePlayer(game.id, player.id)

      // TODO do a function to clean up players. It will remove every player that are disconnected

      game.restartGameIfAllPlayersWantReplay()

      const promises: Promise<void>[] = []

      if (game.getConnectedPlayers().length === 0) {
        const removeGame = this.removeGame(game.code)
        promises.push(removeGame)
      } else {
        const updateGame = this.gameService.updateGame(game)
        promises.push(updateGame)
      }

      const broadcast = this.broadcastGame(socket, game)
      promises.push(broadcast)

      await Promise.all(promises)
    } else {
      this.startDisconnectionTimeout(player, timeout, () =>
        this.updateGameAfterTimeoutExpired(socket, game),
      )
    }

    socket.to(game.code).emit("message:server", {
      id: crypto.randomUUID(),
      username: player.name,
      message: SERVER_MESSAGE_TYPE.PLAYER_LEFT,
      type: SERVER_MESSAGE_TYPE.PLAYER_LEFT,
    })

    await socket.leave(game.code)
  }

  async onMessage(
    socket: SkyjoSocket,
    { username, message }: Omit<UserChatMessage, "id" | "type">,
  ) {
    const game = await this.getGame(socket.data.gameCode)

    if (!game.getPlayerById(socket.data.playerId))
      throw new Error(ERROR.PLAYER_NOT_FOUND)

    game.updatedAt = new Date()

    const newMessage: UserChatMessage = {
      id: crypto.randomUUID(),
      username,
      message,
      type: USER_MESSAGE_TYPE,
    }

    socket.to(game.code).emit("message", newMessage)
    socket.emit("message", newMessage)
  }

  async onInitiateKickVote(socket: SkyjoSocket, playerToKickId: string) {
    const game = await this.getGame(socket.data.gameCode)
    await this.kickVoteController.initiateKickVote(socket, game, playerToKickId)
  }

  async onVoteToKick(
    socket: SkyjoSocket,
    playerToKickId: string,
    vote: boolean,
  ) {
    const game = await this.getGame(socket.data.gameCode)
    await this.kickVoteController.voteToKick(socket, game, playerToKickId, vote)
  }
  //#endregion

  //#region private methods
  async beforeStart() {
    await this.gameService.removeInactiveGames()
    this.games = await this.gameService.getGamesByRegion()

    this.startCronJob()
  }

  private startCronJob() {
    cron.schedule("* * * * *", () => {
      this.removeInactiveGames()
    })
  }

  private async removeInactiveGames() {
    logger.info("Remove inactive games")
    const deletedGameIds = await this.gameService.removeInactiveGames()

    this.games = this.games.filter((game) => !deletedGameIds.includes(game.id))
  }

  private async createGame(
    socket: SkyjoSocket,
    playerToCreate: CreatePlayer,
    isPrivateGame: boolean,
  ) {
    const player = new SkyjoPlayer(playerToCreate, socket.id)
    const game = new Skyjo(player.id, new SkyjoSettings(isPrivateGame))
    this.games.push(game)
    await this.gameService.createGame(game)

    return { player, game }
  }

  private async getGame(gameCode: string) {
    let game = this.games.find((game) => game.code === gameCode)

    if (!game) {
      game = await this.gameService.retrieveGameByCode(gameCode)
      if (!game) throw new Error(ERROR.GAME_NOT_FOUND)
    }

    this.games.push(game)
    return game
  }

  private async getPublicGameWithFreePlace() {
    const MAX_GAME_INACTIVE_TIME_IN_MS = 5 * 60 * 1000
    const BASE_NEW_GAME_CHANCE = 0.05
    const MAX_NEW_GAME_CHANCE = 0.2
    const IDEAL_LOBBY_GAME_COUNT = 3 // Number of lobby wanted at the same time

    const now = new Date().getTime()

    const eligibleGames = this.games.filter((game) => {
      const hasRecentActivity =
        now - game.updatedAt.getTime() < MAX_GAME_INACTIVE_TIME_IN_MS

      return (
        !game.settings.private &&
        game.status === GAME_STATUS.LOBBY &&
        !game.isFull() &&
        hasRecentActivity
      )
    })

    // Adjust new game chance based on number of eligible games
    const missingLobbyGameCount = Math.max(
      0,
      IDEAL_LOBBY_GAME_COUNT - eligibleGames.length,
    )
    const additionalChance = BASE_NEW_GAME_CHANCE * missingLobbyGameCount
    const newGameChance = Math.min(
      MAX_NEW_GAME_CHANCE,
      BASE_NEW_GAME_CHANCE + additionalChance,
    )

    const shouldCreateNewGame =
      Math.random() < newGameChance || eligibleGames.length === 0
    if (shouldCreateNewGame) return null

    const randomGameIndex = Math.floor(Math.random() * eligibleGames.length)
    return eligibleGames[randomGameIndex]
  }

  private async addPlayerToGame(
    socket: SkyjoSocket,
    game: Skyjo,
    player: SkyjoPlayer,
  ) {
    if (game.status !== GAME_STATUS.LOBBY)
      throw new Error(ERROR.GAME_ALREADY_STARTED)

    game.addPlayer(player)
    const createPlayer = this.playerService.createPlayer(
      game.id,
      socket.id,
      player,
    )
    game.updatedAt = new Date()
    const updateGame = this.gameService.updateGame(game, false)

    await Promise.all([createPlayer, updateGame])
  }

  private async joinGame(
    socket: SkyjoSocket,
    game: Skyjo,
    player: SkyjoPlayer,
    reconnection: boolean = false,
  ) {
    await socket.join(game.code)

    socket.data = {
      gameCode: game.code,
      playerId: player.id,
    }

    socket.emit("join", game.toJson(), player.id)

    const messageType = reconnection
      ? SERVER_MESSAGE_TYPE.PLAYER_RECONNECT
      : SERVER_MESSAGE_TYPE.PLAYER_JOINED
    const message: ServerChatMessage = {
      id: crypto.randomUUID(),
      username: player.name,
      message: messageType,
      type: messageType,
    }
    socket.to(game.code).emit("message:server", message)
    socket.emit("message:server", message)

    const updateGame = this.gameService.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  private async broadcastGame(socket: SkyjoSocket, game: Skyjo) {
    socket.emit("game", game.toJson())

    socket.to(game.code).emit("game", game.toJson())
  }

  private async checkPlayAuthorization(
    socket: SkyjoSocket,
    allowedStates: TurnStatus[],
  ) {
    const game = await this.getGame(socket.data.gameCode)

    if (
      game.status !== GAME_STATUS.PLAYING ||
      (game.roundStatus !== ROUND_STATUS.PLAYING &&
        game.roundStatus !== ROUND_STATUS.LAST_LAP)
    )
      throw new Error(ERROR.NOT_ALLOWED)

    const player = game.getPlayerById(socket.data.playerId)
    if (!player) throw new Error(`player-not-found`)

    if (!game.checkTurn(player.id)) throw new Error(`not-your-turn`)

    if (allowedStates.length > 0 && !allowedStates.includes(game.turnStatus))
      throw new Error(ERROR.INVALID_TURN_STATE)

    return { player, game }
  }

  private async finishTurn(socket: SkyjoSocket, game: Skyjo) {
    game.nextTurn()
    const player = game.getCurrentPlayer()
    this.playerService.updatePlayer(player)

    if (
      game.roundStatus === ROUND_STATUS.OVER &&
      game.status !== GAME_STATUS.FINISHED
    ) {
      setTimeout(() => {
        game.startNewRound()
        this.broadcastGame(socket, game)
      }, 10000)
    }

    const updateGame = this.gameService.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  private startDisconnectionTimeout(
    player: SkyjoPlayer,
    connectionLost: boolean,
    callback: (...args: unknown[]) => Promise<unknown>,
  ) {
    player.connectionStatus = connectionLost
      ? CONNECTION_STATUS.CONNECTION_LOST
      : CONNECTION_STATUS.LEAVE
    this.playerService.updateDisconnectionDate(player, new Date())

    player.disconnectionTimeout = setTimeout(
      () => {
        player.connectionStatus = CONNECTION_STATUS.DISCONNECTED
        callback()
      },
      connectionLost ? CONNECTION_LOST_TIMEOUT_IN_MS : LEAVE_TIMEOUT_IN_MS,
    )
  }

  private async updateGameAfterTimeoutExpired(
    socket: SkyjoSocket,
    game: Skyjo,
  ) {
    if (!game.haveAtLeastMinPlayersConnected()) {
      game.status = GAME_STATUS.STOPPED

      const removeGame = this.removeGame(game.code)
      const broadcast = this.broadcastGame(socket, game)

      await Promise.all([removeGame, broadcast])
      return
    }

    if (game.getCurrentPlayer()?.id === socket.data.playerId) game.nextTurn()

    if (game.roundStatus === ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS)
      game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
    else if (
      game.roundStatus === ROUND_STATUS.LAST_LAP &&
      game.allConnectedPlayersHavePlayedLastTurn()
    ) {
      game.endRound()
    }

    const updateGame = this.gameService.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  private async removeGame(gameCode: string) {
    this.games = this.games.filter((game) => game.code !== gameCode)
    await this.gameService.removeGame(gameCode)
  }

  private async changeAdmin(game: Skyjo) {
    const players = game.getConnectedPlayers([game.adminId])
    if (players.length === 0) return

    const player = players[0]
    await this.gameService.updateAdmin(game.id, player.id)

    game.adminId = player.id
  }

  //#endregion
}
