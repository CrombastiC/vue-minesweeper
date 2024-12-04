// 导入 BlockState 类型
import type { BlockState } from '~/types'

// 定义八个方向
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

// 定义游戏状态接口
interface GameState {
  board: BlockState[][] // 二维数组
  mineGenarated: boolean
  gameState: 'play' | 'won' | 'lost'
  startMs: number
}

// 导出 GamePlay 类
export class GamePlay {
  state = ref() as Ref<GameState>

  // 构造函数初始化宽度和高度，并重置游戏
  constructor(
    public width: number,
    public height: number,
    public mines: number,
  ) {
    this.reset()
  }

  // 获取当前棋盘状态
  get board() {
    return this.state.value?.board
  }

  get blocks() {
    return this.state.value.board.flat()
  }

  // 重置游戏状态
  reset(
    width = this.width,
    height = this.height,
    mines = this.mines,
  ) {
    this.width = width
    this.height = height
    this.mines = mines
    this.state.value = {
      startMs: +Date.now(),
      mineGenarated: false,
      gameState: 'play',
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from({ length: this.width }, (_, x): BlockState => ({
          x,
          y,
          adjacentMines: 0,
          revealed: false,
        }))),
    }
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.random(min, max))
  }

  // 生成地雷，避免初始点击位置
  genarateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]
      if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1)
        return false

      if (block.mine)
        return false
      block.mine = true
      return true
    }
    Array.from({ length: this.mines }, () => null).forEach(() => {
      let placed = false
      while (!placed) {
        placed = placeRandom()
      }
    })

    this.updateNumbers()
  }

  // 更新每个方块周围的地雷数量
  updateNumbers() {
    this.board.forEach((row) => {
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

  // 扩展显示周围没有地雷的方块
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

  // 右键点击标记或取消标记地雷
  onRightClick(block: BlockState) {
    // 移除右键默认事件

    if (this.state.value.gameState !== 'play') {
      return
    }
    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  // 左键点击揭示方块
  onClick(block: BlockState) {
    if (this.state.value.gameState === 'lost' || block.revealed) {
      return
    }

    if (!this.state.value.mineGenarated) {
      this.genarateMines(this.board, block)
      this.state.value.mineGenarated = true
    }

    block.revealed = true

    if (block.mine) {
      this.state.value.gameState = 'lost'
      this.showAllMines()
    }
    else {
      this.expendZero(block)
    }
  }

  // 获取当前方块的所有邻居
  getSibLings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined

      return this.board[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  // 显示所有地雷
  showAllMines() {
    this.board.flat().forEach((i) => {
      if (i.mine)
        i.revealed = true
    })
  }

  // 检查游戏是否已获胜或失败
  checkGameState() {
    if (!this.state.value.mineGenarated) {
      return
    }
    const blocks = this.board.flat() // flat() 将嵌套的数组展平
    if (blocks.every(block => block.revealed || block.flagged)) {
      if (blocks.some(block => block.flagged && !block.mine)) {
        this.state.value.gameState = 'lost'
        this.showAllMines()
      }
      else {
        this.state.value.gameState = 'won'
      }
    }
  }
}
