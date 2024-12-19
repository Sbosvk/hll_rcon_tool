'use client'

import {useMemo, useState} from 'react'
import {DataTable} from './game-table'
import {Player, PlayerWithStatus, TeamEnum} from '@/types/player'
import useMediaQuery from '@/hooks/use-media-query'
import {ColumnDef} from '@tanstack/react-table'
import PlayerGameDetail from './player'
import {MobilePlayerGameDetail, NoPlayerGameDetail} from './player-detail'
import {Route, Routes} from "react-router";
import {TeamStats} from "@/components/game/statistics/team/team-stats";
import {calcTeam} from './utils'

export default function GameStats({
  stats,
  getColumns,
  gameId,
  live,
}: {
  stats: Player[] | PlayerWithStatus[]
  getColumns: (handlePlayerClick: (id: string) => void) => ColumnDef<Player | PlayerWithStatus>[]
  gameId: string
  live: boolean
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>()
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const isSmallScreen = useMediaQuery('screen and (max-width: 1023px)')

  const handlePlayerClick = (id: string) => {
    setSelectedPlayerId(id)
    setOpenDrawer(true)
  }

  const selectedPlayer = useMemo(
    () => stats.find((player) => player.player_id === selectedPlayerId),
    [stats, selectedPlayerId],
  )

  const statsWithTeam: Player[] | null = useMemo(
    () => live ? null : stats.map(player => {
      return {...player, team: calcTeam(player.kills, player.weapons)}
    }),
    [stats]
  );

  return (
    <section id={`game-statistics-${gameId}`}>
      <h2 className="sr-only">End of game statistics</h2>
      <div className="relative flex flex-col-reverse lg:flex-row">
        <article className="w-full lg:w-2/3">
          <Routes>
            <Route index element={<DataTable columns={getColumns(handlePlayerClick)} data={statsWithTeam ?? stats} tableId={gameId} />} />
            <Route path={"charts"} element={<TeamStats stats={statsWithTeam ?? []} handlePlayerClick={handlePlayerClick}/>} />
          </Routes>
        </article>
        <aside className="hidden w-full lg:block lg:w-1/3 min-h-32">
          {selectedPlayer ? <PlayerGameDetail player={selectedPlayer} /> : <NoPlayerGameDetail />}
        </aside>
      </div>
      {isSmallScreen && selectedPlayer && (
        <MobilePlayerGameDetail open={openDrawer} setOpen={setOpenDrawer} player={selectedPlayer} />
      )}
    </section>
  )
}
