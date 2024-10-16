import { GameDb } from "@/db/game.db.js"
import { PlayerDb } from "@/db/player.db.js"
import { BaseService } from "@/services/base.service.js"
import type { SkyjoSocket } from "@/types/skyjoSocket.js"
import { TEST_SOCKET_ID } from "@tests/constants-test.js"
import { vi } from "vitest"

const mockPlayerDb = () => {
  return {
    createPlayer: vi.fn(),
    updatePlayer: vi.fn(),
    updateSocketId: vi.fn(),
    removePlayer: vi.fn(),
    canReconnect: vi.fn(),
    updateDisconnectionDate: vi.fn(),
    reconnectPlayer: vi.fn(),
    getPlayersByGameId: vi.fn(),
  } satisfies PlayerDb
}

const mockGameDb = () => {
  return {
    playerDb: mockPlayerDb(),
    createGame: vi.fn(),
    updateGame: vi.fn(),
    updateSettings: vi.fn(),
    updateAdmin: vi.fn(),
    getGamesByRegion: vi.fn(),
    getGameById: vi.fn(),
    getGameByCode: vi.fn(),
    getPublicGameWithFreePlace: vi.fn(),
    isPlayerInGame: vi.fn(),
    retrieveGameByCode: vi.fn(),
    removeGame: vi.fn(),
    removeInactiveGames: vi.fn(),
  } satisfies Omit<GameDb, "formatSkyjo"> as unknown as GameDb
}

export const mockBaseService = () => {
  // this prevent the beforeStart method to be called
  BaseService["firstInit"] = false
  BaseService["games"] = []

  BaseService["playerDb"] = mockPlayerDb()
  BaseService["gameDb"] = mockGameDb()
}

export const mockSocket = (id: string = TEST_SOCKET_ID) => {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    join: vi.fn(),
    to: vi.fn(() => ({ emit: vi.fn() })),
    leave: vi.fn(),
    data: {},
    id,
    connected: true,
    disconnected: false,
    recovered: true,
  } as unknown as SkyjoSocket
}
