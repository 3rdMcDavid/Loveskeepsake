export interface Seat {
  id: string
  name: string
}

export interface SeatingTableData {
  id: string
  type: 'round' | 'square'
  name: string
  x: number
  y: number
  seatCount: number
  seats: Seat[]
}
