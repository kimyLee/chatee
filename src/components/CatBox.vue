<template>
  <div class="cat-box" />
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import { Configuration, OpenAIApi } from 'openai'
// import { ChatGPTAPI } from 'chatgpt'

export default defineComponent({
  name: 'CatBox',
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.cat-box {
  width: 87px;
  height: 69px;
  background-color: #164110;
  background-image: url(/chatee/dist/cat.png);
  background-size: cover;
  background-repeat: no-repeat;
  // background-position: 0% 0%;
  animation: cat-animation 1s infinite steps(4);
  // animation-name: cat-animation;
  // animation-duration: 1s;
  // animation-timing-function: steps(4);
  // animation-iteration-count: infinite;

}

// 动画效果
@keyframes cat-animation {
   0% {
     background-position: 0% 0%;
   }
  //  25% {
  //    background-position: 33% 0%;
  //  }
  //  50% {
  //    background-position: 66% 0%;
  //  }
  //  75% {
  //    background-position: 100% 0%;
  //  }
   100% {
     background-position: 133% 0%;
   }
}

</style>
