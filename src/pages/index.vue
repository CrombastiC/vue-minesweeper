<script setup lang="ts">
import { GamePlay } from '~/composables/logic'

const play = new GamePlay(6, 6, 3)
const now = ref(useNow())

const timerMS = computed(() => Math.round((+now.value - play.state.value.startMs) / 1000))
useStorage('vuesweeper-state', play.state)
const state = computed(() => play.board)

const mineRest = computed(() => {
  if (!play.state.value.mineGenarated)
    return play.mines
  return play.blocks.reduce((a, b) => a
    + (b.mine ? 1 : 0) - (b.flagged ? 1 : 0), 0)
})

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(9, 9, 10)
      break
    case 'medium':
      play.reset(16, 16, 40)
      break
    case 'hard':
      play.reset(16, 30, 99)
      break
  }
}
watchEffect(() => {
  play.checkGameState()
})
</script>

<template>
  <div>
    Minesweeper
    <div flex="~ gap1" justify-center p4>
      <button btn @click="play.reset()">
        New Game
      </button>
      <button btn @click="newGame('easy')">
        Easy
      </button>
      <button btn @click="newGame('medium')">
        Medium
      </button>
      <button btn @click="newGame('hard')">
        Hard
      </button>
    </div>

    <div flex="~" justify-center gap10>
      <div flex="~" item-center gap-1 text-2xl font-mono>
        <div i="carbon-timer" />
        <div>{{ timerMS }}</div>
      </div>
      <div flex="~" item-center gap-1 text-2xl font-mono>
        <div i="mdi-mine" />
        <div>{{ mineRest }}</div>
      </div>
    </div>

    <div w-full overflow-auto p5>
      <div
        v-for="row, y in state"
        :key="y"
        flex="~"
        ma w-max items-center justify-center
      >
        <MineBlock
          v-for="(block, x) in row"
          :key="x"
          :block="block"
          @click="play.onClick(block)"
          @dblclick="play.autoExpand(block)"
          @contextmenu.prevent="play.onRightClick(block)"
        />
      </div>
    </div>

    <!-- <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>
    </div> -->
    <Confetti :passed="play.state.value.gameState === 'won'" />
  </div>
</template>
