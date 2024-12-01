<script setup lang="ts">
import { isDev } from '~/composables'
import type { BlockState } from '~/types'

const props = defineProps<{
  block: BlockState
}>()

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

function getBlockClass(block: BlockState) {
  if (block.flagged) {
    return 'bg-gray-500/10'
  }
  if (!block.revealed) {
    return 'bg-gray-500/10 hover:bg-gray-500/20'
  }
  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
}
</script>

<template>
  <button
    flex="~" h-10 w-10 items-center justify-center m="0.5"
    border=" 1 gray-400/10 " :class="getBlockClass(block)"
  >
    <template v-if="block.flagged">
      <div i-mdi-flag text-red />
    </template>
    <template v-else-if="block.revealed || isDev">
      <div v-if="block.mine" i-mdi-mine>
        x
      </div>
      <div v-else>
        {{ block.adjacentMines }}
      </div>
    </template>
  </button>
</template>
