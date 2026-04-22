'use client'

import { Stage, Layer, Group, Circle, Rect, Text } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { SeatingTableData } from './types'

const ROUND_RADIUS = 62
const ROUND_ORBIT = 84
const SQUARE_SIDE = 112
const SEAT_RADIUS = 11

function getRoundSeatPositions(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2
    return { x: Math.cos(angle) * ROUND_ORBIT, y: Math.sin(angle) * ROUND_ORBIT }
  })
}

function getSquareSeatPositions(count: number) {
  if (count === 0) return []
  const half = SQUARE_SIDE / 2
  const orbit = half + SEAT_RADIUS + 7
  const seg = SQUARE_SIDE
  const perimeter = seg * 4
  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * perimeter
    if (t < seg) return { x: t - half, y: -orbit }
    if (t < seg * 2) return { x: orbit, y: (t - seg) - half }
    if (t < seg * 3) return { x: half - (t - seg * 2), y: orbit }
    return { x: -orbit, y: half - (t - seg * 3) }
  })
}

interface TableGroupProps {
  table: SeatingTableData
  isSelected: boolean
  tool: 'select' | 'pan'
  onSelect: (e: KonvaEventObject<MouseEvent>) => void
  onDragEnd: (x: number, y: number) => void
  onSeatClick: (seatIdx: number, clientX: number, clientY: number) => void
}

function TableGroup({ table, isSelected, tool, onSelect, onDragEnd, onSeatClick }: TableGroupProps) {
  const seatPositions =
    table.type === 'round'
      ? getRoundSeatPositions(table.seatCount)
      : getSquareSeatPositions(table.seatCount)

  const tableFill = isSelected ? '#f5ede3' : '#fdf8f4'
  const tableStroke = isSelected ? '#3d2e28' : '#8a7060'
  const strokeWidth = isSelected ? 2 : 1.5

  return (
    <Group
      x={table.x}
      y={table.y}
      draggable={tool === 'select'}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect(e)
      }}
      onTap={(e) => {
        e.cancelBubble = true
        onSelect(e as unknown as KonvaEventObject<MouseEvent>)
      }}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
    >
      {/* Seats (rendered first so table body appears on top) */}
      {seatPositions.map((pos, idx) => {
        const seat = table.seats[idx]
        const assigned = !!seat?.name
        return (
          <Group
            key={idx}
            x={pos.x}
            y={pos.y}
            onClick={(e) => {
              e.cancelBubble = true
              onSeatClick(idx, e.evt.clientX, e.evt.clientY)
            }}
            onTap={(e) => {
              e.cancelBubble = true
              const touch = (e.evt as TouchEvent).changedTouches?.[0]
              if (touch) onSeatClick(idx, touch.clientX, touch.clientY)
            }}
          >
            <Circle
              radius={SEAT_RADIUS}
              fill={assigned ? '#c4956a' : '#e5dad3'}
              stroke={assigned ? '#a37352' : '#b8aaa3'}
              strokeWidth={1}
              perfectDrawEnabled={false}
            />
            {assigned && seat.name && (
              <Text
                text={seat.name.split(' ')[0].slice(0, 5)}
                fontSize={6.5}
                fill="white"
                fontStyle="bold"
                align="center"
                verticalAlign="middle"
                width={SEAT_RADIUS * 2}
                height={SEAT_RADIUS * 2}
                offsetX={SEAT_RADIUS}
                offsetY={SEAT_RADIUS}
                listening={false}
                perfectDrawEnabled={false}
              />
            )}
          </Group>
        )
      })}

      {/* Table body */}
      {table.type === 'round' ? (
        <Circle
          radius={ROUND_RADIUS}
          fill={tableFill}
          stroke={tableStroke}
          strokeWidth={strokeWidth}
          perfectDrawEnabled={false}
        />
      ) : (
        <Rect
          width={SQUARE_SIDE}
          height={SQUARE_SIDE}
          offsetX={SQUARE_SIDE / 2}
          offsetY={SQUARE_SIDE / 2}
          fill={tableFill}
          stroke={tableStroke}
          strokeWidth={strokeWidth}
          cornerRadius={3}
          perfectDrawEnabled={false}
        />
      )}

      {/* Table name */}
      <Text
        text={table.name}
        fontSize={11}
        fontStyle="bold"
        fill={tableStroke}
        align="center"
        verticalAlign="middle"
        width={110}
        height={22}
        offsetX={55}
        offsetY={14}
        listening={false}
        perfectDrawEnabled={false}
      />

      {/* Assigned count */}
      <Text
        text={`${table.seats.filter(s => s.name).length}/${table.seatCount}`}
        fontSize={9}
        fill="#c4956a"
        align="center"
        verticalAlign="middle"
        width={60}
        height={16}
        offsetX={30}
        offsetY={-3}
        listening={false}
        perfectDrawEnabled={false}
      />
    </Group>
  )
}

export interface SeatingCanvasProps {
  width: number
  height: number
  tables: SeatingTableData[]
  selectedTableId: string | null
  tool: 'select' | 'pan'
  stagePos: { x: number; y: number }
  stageScale: number
  onStageClick: () => void
  onWheelZoom: (scale: number, x: number, y: number) => void
  onStageDragEnd: (x: number, y: number) => void
  onSelectTable: (id: string) => void
  onTableDragEnd: (id: string, x: number, y: number) => void
  onSeatClick: (tableId: string, seatIdx: number, clientX: number, clientY: number) => void
}

export function SeatingCanvas({
  width, height, tables, selectedTableId, tool,
  stagePos, stageScale,
  onStageClick, onWheelZoom, onStageDragEnd,
  onSelectTable, onTableDragEnd, onSeatClick,
}: SeatingCanvasProps) {
  function handleWheel(e: KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    if (!stage) return
    const scaleBy = 1.06
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const newScale = Math.min(Math.max(
      e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy,
      0.15, 4
    ))
    const mouseWorldPos = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }
    onWheelZoom(newScale, pointer.x - mouseWorldPos.x * newScale, pointer.y - mouseWorldPos.y * newScale)
  }

  return (
    <Stage
      width={width}
      height={height}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePos.x}
      y={stagePos.y}
      draggable={tool === 'pan'}
      style={{ cursor: tool === 'pan' ? 'grab' : 'default' }}
      onClick={onStageClick}
      onTap={onStageClick}
      onWheel={handleWheel}
      onDragEnd={(e) => {
        if (e.target === e.target.getStage()) {
          onStageDragEnd(e.target.x(), e.target.y())
        }
      }}
    >
      <Layer>
        {tables.map(table => (
          <TableGroup
            key={table.id}
            table={table}
            isSelected={table.id === selectedTableId}
            tool={tool}
            onSelect={() => onSelectTable(table.id)}
            onDragEnd={(x, y) => onTableDragEnd(table.id, x, y)}
            onSeatClick={(idx, cx, cy) => onSeatClick(table.id, idx, cx, cy)}
          />
        ))}
      </Layer>
    </Stage>
  )
}
