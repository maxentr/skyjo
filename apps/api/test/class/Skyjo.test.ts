import { Skyjo } from "@/class/Skyjo"
import { SkyjoCard } from "@/class/SkyjoCard"
import { SkyjoPlayer } from "@/class/SkyjoPlayer"
import { SkyjoSettings } from "@/class/SkyjoSettings"
import { GameStatus } from "shared/types/game"
import { Move, RoundState, TurnState } from "shared/types/skyjo"

import { beforeEach, describe, expect, it } from "vitest"

const TOTAL_CARDS = 150
const CARD_PER_PLAYER = 12

describe("Skyjo", () => {
  let skyjo: Skyjo
  let player: SkyjoPlayer
  let settings: SkyjoSettings
  let opponent: SkyjoPlayer

  beforeEach(() => {
    player = new SkyjoPlayer("player1", "socketId123", "bee")
    settings = new SkyjoSettings()
    skyjo = new Skyjo(player, settings)
    skyjo.addPlayer(player)

    opponent = new SkyjoPlayer("player2", "socketId123", "elephant")
    skyjo.addPlayer(opponent)
  })

  //#region initialize card piles
  it("should initialize card piles", () => {
    skyjo.initializeCardPiles()

    expect(skyjo["_drawPile"]).toHaveLength(TOTAL_CARDS)
    expect(skyjo["_discardPile"]).toHaveLength(0)
  })
  //#endregion

  //#region start
  it("should start the game with default settings", () => {
    skyjo.start()

    expect(skyjo.status).toBe<GameStatus>("playing")
    expect(skyjo.roundState).toBe<RoundState>(
      "waitingPlayersToTurnInitialCards",
    )
  })

  it("should start the game and set the round status to playing if there is no card to turn at the beginning of the game", () => {
    skyjo.settings.initialTurnedCount = 0
    skyjo.start()

    expect(skyjo.status).toBe<GameStatus>("playing")
    expect(skyjo.roundState).toBe<RoundState>("playing")
  })
  //#endregion

  //#region give players cards
  it("should give players cards", () => {
    skyjo.initializeCardPiles()
    skyjo.givePlayersCards()

    expect(skyjo["_drawPile"]).toHaveLength(TOTAL_CARDS - CARD_PER_PLAYER * 2)
    skyjo.players.forEach((player) => {
      expect(player.cards.flat()).toHaveLength(CARD_PER_PLAYER)
    })
  })
  //#endregion

  //#region check all players revealed cards
  it("should check all players revealed cards and not start the game", () => {
    skyjo.checkAllPlayersRevealedCards(skyjo.settings.initialTurnedCount)
    expect(skyjo.roundState).toBe<RoundState>(
      "waitingPlayersToTurnInitialCards",
    )
  })

  it("should check all players revealed cards, start the game and make the player with the highest current score start", () => {
    skyjo.initializeCardPiles()
    skyjo.givePlayersCards()

    // player 1 has 10 and player 2 has 9 for the second card
    skyjo.players.forEach((player, i) => {
      player.cards[0][0] = new SkyjoCard(10, true)
      player.cards[0][1] = new SkyjoCard(1 - i, true)
    })

    skyjo.checkAllPlayersRevealedCards(skyjo.settings.initialTurnedCount)

    expect(skyjo.roundState).toBe<RoundState>("playing")
    expect(skyjo.turn).toBe(0)
  })

  it("should check all players revealed cards, start the game and make the player with the highest card start when two players have the same current score", () => {
    skyjo.initializeCardPiles()
    skyjo.givePlayersCards()

    skyjo.players[0].cards[0][0] = new SkyjoCard(10, true)
    skyjo.players[0].cards[0][1] = new SkyjoCard(10, true)

    skyjo.players[1].cards[0][0] = new SkyjoCard(9, true)
    skyjo.players[1].cards[0][1] = new SkyjoCard(11, true)

    skyjo.checkAllPlayersRevealedCards(skyjo.settings.initialTurnedCount)

    expect(skyjo.roundState).toBe<RoundState>("playing")
    expect(skyjo.turn).toBe(1)
  })

  it("should check all players revealed cards, start the game and make the player with the highest card start while ignoring players who are not connected", () => {
    const opponent2 = new SkyjoPlayer("player3", "socketId123", "elephant")
    skyjo.addPlayer(opponent2)

    const opponent3 = new SkyjoPlayer("player4", "socketId123", "elephant")
    skyjo.addPlayer(opponent3)

    skyjo.initializeCardPiles()
    skyjo.givePlayersCards()

    skyjo.players[0].connectionStatus = "disconnected"
    skyjo.players[0].cards[0][0] = new SkyjoCard(10, true)
    skyjo.players[0].cards[0][1] = new SkyjoCard(10, true)

    skyjo.players[1].cards[0][0] = new SkyjoCard(12, true)
    skyjo.players[1].cards[0][1] = new SkyjoCard(12, true)

    skyjo.players[2].connectionStatus = "disconnected"
    skyjo.players[2].cards[0][0] = new SkyjoCard(9, true)
    skyjo.players[2].cards[0][1] = new SkyjoCard(11, true)

    skyjo.players[3].cards[0][0] = new SkyjoCard(9, true)
    skyjo.players[3].cards[0][1] = new SkyjoCard(12, true)

    skyjo.checkAllPlayersRevealedCards(skyjo.settings.initialTurnedCount)

    expect(skyjo.roundState).toBe<RoundState>("playing")
    expect(skyjo.turn).toBe(1)
  })
  //#endregion

  //#region draw card
  it("should draw card", () => {
    skyjo.initializeCardPiles()

    expect(skyjo.selectedCard).toBeNull()
    expect(skyjo.turnState).toBe<TurnState>("chooseAPile")

    skyjo.drawCard()

    expect(skyjo.selectedCard).toBeInstanceOf(SkyjoCard)
    expect(skyjo.turnState).toBe<TurnState>("throwOrReplace")
    expect(skyjo.lastMove).toBe<Move>("pickFromDrawPile")
  })

  it("should draw card and reload the draw pile", () => {
    skyjo.initializeCardPiles()
    skyjo["_discardPile"] = [...skyjo["_drawPile"]]
    skyjo["_drawPile"] = []

    expect(skyjo.selectedCard).toBeNull()
    expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
    expect(skyjo["_drawPile"]).toHaveLength(0)
    expect(skyjo["_discardPile"]).toHaveLength(TOTAL_CARDS)

    skyjo.drawCard()

    expect(skyjo.selectedCard).toBeInstanceOf(SkyjoCard)
    expect(skyjo.turnState).toBe<TurnState>("throwOrReplace")
    expect(skyjo.lastMove).toBe<Move>("pickFromDrawPile")
    expect(skyjo["_drawPile"]).toHaveLength(TOTAL_CARDS - 2)
    expect(skyjo["_discardPile"]).toHaveLength(1)
  })
  //#endregion

  //#region pick from discard pile
  it("should pick a card from the discard pile", () => {
    skyjo.initializeCardPiles()
    skyjo["_discardPile"].push(skyjo["_drawPile"].splice(0, 1)[0])

    expect(skyjo.selectedCard).toBeNull()
    expect(skyjo.turnState).toBe<TurnState>("chooseAPile")

    skyjo.pickFromDiscard()

    expect(skyjo.selectedCard).toBeInstanceOf(SkyjoCard)
    expect(skyjo.turnState).toBe<TurnState>("replaceACard")
    expect(skyjo.lastMove).toBe<Move>("pickFromDiscardPile")
  })

  it("should not pick a card from the discard pile if it's empty", () => {
    skyjo.initializeCardPiles()
    skyjo["_discardPile"] = []

    expect(skyjo.selectedCard).toBeNull()
    expect(skyjo.turnState).toBe<TurnState>("chooseAPile")

    skyjo.pickFromDiscard()

    expect(skyjo.selectedCard).toBeNull()
    expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
  })
  //#endregion

  //#region discard card
  it("should discard card", () => {
    skyjo.discardCard(new SkyjoCard(10))

    expect(skyjo.selectedCard).toBeNull()
    expect(skyjo["_discardPile"]).toHaveLength(1)
    expect(skyjo.turnState).toBe<TurnState>("turnACard")
    expect(skyjo.lastMove).toBe<Move>("throw")
  })
  //#endregion

  //#region replace card
  it("should replace a card", () => {
    skyjo.initializeCardPiles()
    skyjo.givePlayersCards()

    const oldCard = player.cards[0][0]
    const selectedCard = new SkyjoCard(10, true)
    skyjo.selectedCard = selectedCard

    expect(player.cards[0][0]).toBe(oldCard)

    skyjo.replaceCard(0, 0)

    expect(player.cards[0][0]).toBe(selectedCard)
    expect(player.cards[0][0]).not.toBe(oldCard)
    expect(skyjo.selectedCard).toBeNull()
    expect(player.cards[0][0].isVisible).toBeTruthy()
    expect(skyjo.lastMove).toBe<Move>("replace")
  })
  //#endregion

  //#region turn card
  it("should turn card", () => {
    skyjo.initializeCardPiles()
    skyjo.givePlayersCards()
    const card = player.cards[0][0]
    expect(card.isVisible).toBeFalsy()

    skyjo.turnCard(player, 0, 0)

    expect(card.isVisible).toBeTruthy()
    expect(skyjo.lastMove).toBe<Move>("turn")
  })
  //#endregion

  //#region next turn
  it("should set next turn", () => {
    const currentTurn = skyjo.turn
    skyjo.nextTurn()

    expect(skyjo.turn).not.toBe(currentTurn)
    expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
  })

  it("should set next turn and handle disconnected players", () => {
    const opponent2 = new SkyjoPlayer("player3", "socketId123", "elephant")
    opponent2.connectionStatus = "disconnected"
    skyjo.addPlayer(opponent2)
    skyjo.turn = 1

    skyjo.nextTurn()

    expect(skyjo.turn).toBe(0)
    expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
  })
  //#endregion

  //#region check if player finished
  it("should check if player finished and return false when player has not all cards revealed", () => {
    skyjo.initializeCardPiles()
    skyjo.givePlayersCards()

    expect(skyjo.checkIfPlayerFinished(player)).toBeFalsy()
  })

  it("should check if player finished and return true when player has all cards revealed", () => {
    skyjo.initializeCardPiles()
    skyjo.givePlayersCards()
    player.turnAllCards()

    expect(skyjo.checkIfPlayerFinished(player)).toBeTruthy()
  })
  //#endregion

  //#region check end of round
  it("should check end of round and not end round when there is no first player to finish", () => {
    skyjo.firstPlayerToFinish = null

    expect(skyjo.checkEndOfRound()).toBeFalsy()
  })

  it("should check end of round and double score of the first player", () => {
    skyjo.initializeCardPiles()
    skyjo.givePlayersCards()
    player.cards = [
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(3, true)],
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(3, true)],
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(3, true)],
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(3, true)],
    ]
    opponent.cards = [
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(2, true)],
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(2, true)],
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(2, true)],
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(2, true)],
    ]
    skyjo.firstPlayerToFinish = player
    skyjo.turn = 1

    skyjo.checkEndOfRound()

    expect(skyjo.roundState).toBe<RoundState>("over")
    expect(player.score).toBe(20 * 2)
  })

  it("should check end of round and not double score of the first player", () => {
    skyjo.initializeCardPiles()
    skyjo.givePlayersCards()
    player.cards = [
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(3, true)],
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(3, true)],
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(3, true)],
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(3, true)],
    ]
    opponent.cards = [
      [new SkyjoCard(12, true), new SkyjoCard(1, true), new SkyjoCard(2, true)],
      [new SkyjoCard(12, true), new SkyjoCard(1, true), new SkyjoCard(2, true)],
      [new SkyjoCard(12, true), new SkyjoCard(1, true), new SkyjoCard(2, true)],
      [new SkyjoCard(12, true), new SkyjoCard(1, true), new SkyjoCard(2, true)],
    ]
    skyjo.firstPlayerToFinish = player
    skyjo.turn = 1

    skyjo.checkEndOfRound()

    expect(skyjo.roundState).toBe<RoundState>("over")
    expect(player.score).toBe(20)
  })
  //#endregion

  //#region start new round
  it("should start a new round and wait for players to turn initial cards if there is a card to turn at the beginning of the game", () => {
    skyjo.roundNumber = 1
    skyjo.firstPlayerToFinish = player
    skyjo.selectedCard = new SkyjoCard(1, true)
    skyjo.lastMove = "pickFromDrawPile"
    player.cards = [
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(3, true)],
    ]

    skyjo.startNewRound()

    expect(skyjo.roundNumber).toBe(2)
    expect(skyjo.firstPlayerToFinish).toBeNull()
    expect(skyjo.selectedCard).toBeNull()
    expect(skyjo.lastMove).toBe<Move>("turn")
    skyjo.players.forEach((player) => {
      expect(player.cards.flat()).toHaveLength(CARD_PER_PLAYER)
      expect(player.hasRevealedCardCount(0)).toBeTruthy()
    })
    expect(skyjo.roundState).toBe<RoundState>(
      "waitingPlayersToTurnInitialCards",
    )
    expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
  })

  it("should start a new round and not wait for players to turn initial cards if there is no card to turn at the beginning of the game", () => {
    skyjo.settings.initialTurnedCount = 0
    skyjo.roundNumber = 1
    skyjo.firstPlayerToFinish = player
    skyjo.selectedCard = new SkyjoCard(1, true)
    skyjo.lastMove = "pickFromDrawPile"
    player.cards = [
      [new SkyjoCard(1, true), new SkyjoCard(1, true), new SkyjoCard(3, true)],
    ]

    skyjo.startNewRound()

    expect(skyjo.roundNumber).toBe(2)
    expect(skyjo.firstPlayerToFinish).toBeNull()
    expect(skyjo.selectedCard).toBeNull()
    expect(skyjo.lastMove).toBe<Move>("turn")
    skyjo.players.forEach((player) => {
      expect(player.cards.flat()).toHaveLength(CARD_PER_PLAYER)
      expect(player.hasRevealedCardCount(0)).toBeTruthy()
    })
    expect(skyjo.roundState).toBe<RoundState>("playing")
    expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
  })
  //#endregion

  //#region check end of game
  it("should check end of game and not end game", () => {
    skyjo.status = "playing"
    skyjo.players[0].score = 99

    skyjo.checkEndGame()

    expect(skyjo.status).toBe<GameStatus>("playing")
  })

  it("should check end of game and end game", () => {
    skyjo.status = "playing"
    skyjo.players[0].score = 100

    skyjo.checkEndGame()

    expect(skyjo.status).toBe<GameStatus>("finished")
    expect(skyjo.roundState).toBe<RoundState>("over")
  })
  //#endregion

  //#region reset game
  it("should reset the game", () => {
    skyjo.roundNumber = 10
    skyjo.players.forEach((player) => {
      player.scores = [10, 20]
      player.score = 30
      player.wantReplay = true
    })

    skyjo.reset()

    expect(skyjo.roundNumber).toBe(1)
    skyjo.players.forEach((player) => {
      expect(player.scores).toStrictEqual([])
      expect(player.score).toBe(0)
      expect(player.wantReplay).toBeFalsy()
    })
  })
  //#endregion

  //#region to json
  it("should return json", () => {
    const gameToJson = skyjo.toJson()

    expect(gameToJson).toStrictEqual({
      id: skyjo.id,
      status: "lobby",
      roundState: "waitingPlayersToTurnInitialCards",
      admin: player.toJson(),
      players: skyjo.players.map((player) => player.toJson()),
      selectedCard: undefined,
      lastDiscardCardValue: skyjo["_discardPile"][["_discardPile"].length - 1],
      lastMove: "turn",
      turn: 0,
      turnState: "chooseAPile",
      settings: skyjo.settings.toJson(),
    })
  })
  //#endregion
})
