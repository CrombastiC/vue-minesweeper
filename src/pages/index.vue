<script setup lang="ts">


interface BlockState {
  x: number,
  y: number,
  revealed?: boolean,
  mine?: boolean,
  flagged?: boolean,
  adjacentMines: number
}
const WIDTH = 10
const HEIGHT = 10
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH },
      (_, x): BlockState => ({
        x, y, adjacentMines: 0, revealed: false
      })
    ),
  ),
)

function genarateMines(initial: BlockState) {
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
  updateNumbers()
}

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1]
]

const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-red-500',
  'text-pink-500',
  'text-orange-500',
  'text-yellow-500',
  'text-indigo-500',
  'text-purple-500',

]

function updateNumbers() {
  state.forEach((row) => {
    row.forEach((block) => {
      if (block.mine)
        return

      getSibLings(block).forEach((b) => {
        if (b.mine)
          block.adjacentMines++
      })
    })
  })
}

function getSibLings(block: BlockState) {
  return directions.map(([dx, dy]) => {
    const x2 = block.x + dx;
    const y2 = block.y + dy;
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
      return undefined;

    return state[y2][x2]
  })
    .filter(Boolean) as BlockState[]

}

function expendZero(block: BlockState) {
  if (block.adjacentMines)
    return

  getSibLings(block).forEach((s) => {
    if (!s.revealed){
    s.revealed = true
    expendZero(s)
    }
  })

}

let mineGenarated = false
const dev = true
function onClick(block: BlockState) {
  if (!mineGenarated) {
    genarateMines(block)
    mineGenarated = true
  }
  block.revealed = true
  if (block.mine) {
    alert('Game Over')
  }
  expendZero(block)
}

function getBlockClass(block: BlockState) {
  if (!block.revealed) {
    return 'bg-gray-500/10'
  }
  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
}


updateNumbers()
</script>

<template>
  <div>
    Minesweeper
    <div p5>
      <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
        <button v-for="(block, x) in row" :key="x" flex="~" items-center justify-center h-10 w-10 m="0.5"
          hover="bg-gray/10" border=" 1 gray-400/10 " :class="getBlockClass(block)" @click="onClick(block)">
          <template v-if="block.revealed || dev">
            <div v-if="block.mine" i-mdi-mine>x</div>
            <div v-else>{{ block.adjacentMines }}</div>
          </template>

        </button>
      </div>
    </div>
  </div>
</template>
