import OpponentBoard from "@/components/OpponentBoard"
import UserAvatar from "@/components/UserAvatar"
import { useSkyjo } from "@/contexts/SkyjoContext"
import {
  getCurrentWhoHasToPlay,
  getNextPlayer,
  isCurrentUserTurn,
} from "@/lib/skyjo"
import { AnimatePresence, m } from "framer-motion"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { GAME_STATUS } from "shared/constants"

const OpponentsMobileView = () => {
  const { opponents, game, player } = useSkyjo()
  const t = useTranslations("components.OpponentsMobileView")
  const flattenOpponents = opponents.flat()

  const [selectedOpponents, setSelectedOpponents] = useState(
    getNextPlayer(game),
  )

  //TODO in the future, this functionnality can be disabled with a setting
  useEffect(() => {
    const setNewSelectedOpponents = () => {
      if (isCurrentUserTurn(game, player.socketId))
        setSelectedOpponents(getNextPlayer(game))
      else {
        const currentWhoHasToPlay = getCurrentWhoHasToPlay(game)
        if (currentWhoHasToPlay) setSelectedOpponents(currentWhoHasToPlay)
      }
    }
    setTimeout(setNewSelectedOpponents, 1500)
  }, [game.turn])

  useEffect(() => {
    if (game.status === GAME_STATUS.PLAYING)
      setSelectedOpponents(getNextPlayer(game))
  }, [game.status])

  if (flattenOpponents.length === 0) return null

  const opponentsWithoutSelected = flattenOpponents.filter(
    (opponent) =>
      selectedOpponents && opponent.socketId !== selectedOpponents.socketId,
  )

  return (
    <AnimatePresence>
      <div className="flex md:hidden flex-row grow">
        <div className="flex flex-col w-20 gap-2 max-h-52">
          <p>{t("opponents-list.title")}</p>
          {opponentsWithoutSelected.map((opponent) => (
            <m.button
              key={opponent.socketId}
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ display: "none", transition: { duration: 0 } }}
              onClick={() => setSelectedOpponents(opponent)}
            >
              <UserAvatar
                avatar={opponent.avatar}
                pseudo={opponent.name}
                size="small"
              />
            </m.button>
          ))}
        </div>
        <div className="flex grow justify-center items-center">
          {selectedOpponents && (
            <m.div
              key={selectedOpponents.socketId}
              initial={{ opacity: 0, scale: 0.8, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ display: "none", transition: { duration: 0 } }}
            >
              <OpponentBoard
                opponent={selectedOpponents}
                isPlayerTurn={isCurrentUserTurn(
                  game,
                  selectedOpponents.socketId,
                )}
                className="w-fit h-fit snap-center"
              />
            </m.div>
          )}
        </div>
        <div className="w-10"></div>
      </div>
    </AnimatePresence>
  )
}

export default OpponentsMobileView
