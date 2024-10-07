import { Skyjo } from "@/class/Skyjo"
import { SkyjoPlayer } from "@/class/SkyjoPlayer"
import { SkyjoSettings } from "@/class/SkyjoSettings"
import { BaseService } from "@/services/base.service"
import { SkyjoSocket } from "@/types/skyjoSocket"
import { ERROR, GAME_STATUS } from "shared/constants"
import { ChangeSettings } from "shared/validations/changeSettings"
import { CreatePlayer } from "shared/validations/player"

export class LobbyService extends BaseService {
  private readonly MAX_GAME_INACTIVE_TIME = 300000 // 5 minutes
  private readonly BASE_NEW_GAME_CHANCE = 0.05 // 5%
  private readonly MAX_NEW_GAME_CHANCE = 0.2 // 20%
  private readonly IDEAL_LOBBY_GAME_COUNT = 3 // Number of lobby wanted at the same time

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

    const updateSettings = this.gameDb.updateSettings(game.id, game.settings)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateSettings, broadcast])
  }

  async onGameStart(socket: SkyjoSocket) {
    const game = await this.getGame(socket.data.gameCode)
    if (!game.isAdmin(socket.data.playerId)) throw new Error(ERROR.NOT_ALLOWED)

    game.start()

    const updateGame = this.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  async onReplay(socket: SkyjoSocket) {
    const game = await this.getGame(socket.data.gameCode)
    if (game.status !== GAME_STATUS.FINISHED) throw new Error(ERROR.NOT_ALLOWED)

    game.getPlayerById(socket.data.playerId)?.toggleReplay()

    game.restartGameIfAllPlayersWantReplay()

    const updateGame = this.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  //#region private methods
  private async createGame(
    socket: SkyjoSocket,
    playerToCreate: CreatePlayer,
    isprotectedGame: boolean,
  ) {
    const player = new SkyjoPlayer(playerToCreate, socket.id)
    const game = new Skyjo(player.id, new SkyjoSettings(isprotectedGame))
    this.games.push(game)
    await this.gameDb.createGame(game)

    return { player, game }
  }

  private async getPublicGameWithFreePlace() {
    const now = new Date().getTime()

    const eligibleGames = this.games.filter((game) => {
      const hasRecentActivity =
        now - game.updatedAt.getTime() < this.MAX_GAME_INACTIVE_TIME

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
      this.IDEAL_LOBBY_GAME_COUNT - eligibleGames.length,
    )
    const additionalChance = this.BASE_NEW_GAME_CHANCE * missingLobbyGameCount
    const newGameChance = Math.min(
      this.MAX_NEW_GAME_CHANCE,
      this.BASE_NEW_GAME_CHANCE + additionalChance,
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
    const createPlayer = this.playerDb.createPlayer(game.id, socket.id, player)
    game.updatedAt = new Date()
    const updateGame = this.gameDb.updateGame(game, false)

    await Promise.all([createPlayer, updateGame])
  }
  //#endregion
}
