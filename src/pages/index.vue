<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const play = new GamePlay(12, 12)
useStorage('vuesweeper-state', play.state)
const state = computed(() => play.board)
</script>

<template>
  <div>
    Minesweeper

    <div p5>
      <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
        <MineBlock
          v-for="(block, x) in row" :key="x" :block="block" @click="play.onClick(block)"
          @contextmenu="play.onRightClick(block)"
        />
      </div>
    </div>
    <div flex="~ gap-1" justify-center>
      <button btn @click="($event) => toggleDev()">
        {{ isDev ? 'DEV' : 'NORAML' }}
      </button>
      <button btn @click="($event) => play.reset()">
        REST
      </button>
    </div>
  </div>
</template>
