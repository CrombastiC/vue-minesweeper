import type{ BlockState } from "~/types"

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]
export class GamePlay {


  state = ref<BlockState[][]>([])
  mineGenarated = false
  constructor(public width: number, public height: number) {

    this.reset()
  }
  reset() {
    this.mineGenarated = false
    this.state.value = Array.from({ length: this.height }, (_, y) =>
      Array.from({ length: this.width }, (_, x): BlockState => ({
        x,
        y,
        adjacentMines: 0,
        revealed: false,
      }))
    )
  }

  genarateMines(state: BlockState[][], initial: BlockState) {
    for (const row of state) {
      for (const block of row) {
        if (Math.abs(initial.x - block.x) < 1) {
          continue
        }
        if (Math.abs(initial.y - block.y) < 1) {
          continue
        }
        block.mine = Math.random() < 0.2
      }
    }
    this.updateNumbers()
  }



  updateNumbers() {
    this.state.value.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          return

        this.getSibLings(block).forEach((b) => {
          if (b.mine)
            block.adjacentMines++
        })
      })
    })
  }

  getSibLings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined

      return this.state.value[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  expendZero(block: BlockState) {
    if (block.adjacentMines)
      return

    this.getSibLings(block).forEach((s) => {
      if (!s.revealed) {
        s.revealed = true
        this.expendZero(s)
      }
    })
  }



  onRightClick(block: BlockState) {
    if (block.revealed)
      return
    block.flagged = !block.flagged
  }
  onClick(block: BlockState) {
    if (!this.mineGenarated) {
      this.genarateMines(this.state.value, block)
      this.mineGenarated = true
    }
    block.revealed = true
    if (block.mine) {
      alert('Game Over')
    }
    this.expendZero(block)
  }



  checkGameState() {
    if (!this.mineGenarated) {
      return
    }
    const blocks = this.state.value.flat()// flat() 将嵌套的数组展平
    if (blocks.every(block => block.revealed || block.flagged)) {
      if (blocks.some(block => block.flagged && block.mine)) {
        alert('U Cheat!')
      }
      else {
        alert('You Win')
      }
    }
  }
}
