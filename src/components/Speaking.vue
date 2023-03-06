<template>
  <div class="speaking">
    <div class="show-msg">
      {{ msg }}
    </div>
    <div class="time-box">
      <span class="start-taste-line">
        <hr class="hr1" />
        <hr class="hr2" />
        <hr class="hr3" />
        <hr class="hr4" />
        <hr class="hr5" />
        <hr class="hr6" />
        <hr class="hr7" />
        <hr class="hr8" />
        <!-- <hr class="hr9" />
        <hr class="hr10" /> -->
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import { Configuration, OpenAIApi } from 'openai'
// import { ChatGPTAPI } from 'chatgpt'

export default defineComponent({
  name: 'CatBox',
  props: {
    msg: {
      type: String,
      default: '',
    },
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.speaking {
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, .2);
  backdrop-filter: blur(4px);

  .show-msg {
    position: absolute;
    bottom: 20px;
    left: 20px;
    color: #ddd;
  }
  // background: ;
  .time-box .start-taste-line {
    display: flex;
    align-items: center;
    hr {
      background-color: #fff;  //声波颜色
      width: 10px;
      height: 15px;
      margin: 5px;
      border-radius: 4px;
      display: inline-block;
      border: none;
      animation: note .3s ease-in-out;
      animation-iteration-count: infinite;
      animation-direction: alternate;
    }

    .hr1 {
      animation-delay: -1s;
      background-color: rgba(255, 255, 255, .4);
    }

    .hr2 {
      animation-delay: -0.9s;
      background-color: rgba(255, 255, 255, .8);
    }

    .hr3 {
      animation-delay: -0.8s;
      background-color: rgba(255, 255, 255, .6);
    }

    .hr4 {
      animation-delay: -0.7s;
      background-color: rgba(255, 255, 255, .5);
    }

    .hr5 {
      animation-delay: -0.6s;
      background-color: rgba(255, 255, 255, .4);
    }

    .hr6 {
      animation-delay: -0.5s;
      background-color: rgba(255, 255, 255, .2);
    }

    .hr7 {
      animation-delay: -0.4s;
      background-color: rgba(255, 255, 255, .7);
    }

    .hr8 {
      animation-delay: -0.3s;
      background-color: rgba(255, 255, 255, .3);
    }
    }

    // .hr9 {
    //   animation-delay: -0.2s;
    // }

    // .hr10 {
    //   animation-delay: -0.1s;
    // }

    @keyframes note {
      from {
        // transform: scaleY(1);
        height: 15px;
      }
      to {
        height: 60px;
        // transform: scaleY(4);
      }
    }

}
</style>
