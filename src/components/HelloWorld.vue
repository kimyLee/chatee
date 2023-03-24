<template>
  <div class="hello">
    <h1 style="width: 100%"
        class="header-text h1">
      ChatyCat
    </h1>
    <h4 class="header-text">
      Your AI buddy powerd by ChatGPT
    </h4>

    <!-- 模拟器 -->
    <div class="device-panel"
         size="large">
      <div class="device-box">
        <div class="device-screen">
          <Speaking v-show="isSpeaking"
                    :msg="speak_input" />
          <!-- <Speaking :msg="speak_input" /> -->
          <div class="question-box">
            <cat-box class="cat-box" />
            <div class="question-text">
              {{ current_question }}
              <span v-show="!waiting"
                    class="my-cursor">|</span>
              <br />
              <span v-show="current_question && waiting"
                    class="tips">「组织语言中···」</span>
            </div>
          </div>
          <div />
          <div id="messageBox"
               class="current-answer-text">
            <span v-show="waiting"
                  class="my-cursor">|</span>
            {{ current_answer }}
          </div>
        </div>
      </div>
    </div>
    <div class="operation-box">
      <!-- 操作指示箭头 -->
      <div class="arrow" />
      <!-- 操作按钮 -->
      <!-- <div
        class="img-btn"
        :class="{ 'speak': !isSpeaking, 'speaking': isSpeaking }"
        @mousedown="handleSpeak(true)"
        @mouseup="handleSpeak(false)" /> -->
      <div v-show="!isSpeaking"
           class="img-btn speak"
           @click="handleSpeak(true)" />
      <div v-show="isSpeaking"
           class="img-btn speaking"
           @click="handleSpeak(false)" />
      <h2 style="font-weight: bold">
        Tap Me, Say Hi
      </h2>
      <!-- <a-button
        size="large"
        class="icon-btn"
        shape="circle"
        @click="scrollEvt(-1)">
        <template #icon>
          <CaretUpOutlined />
        </template>
      </a-button>
      <a-button v-show="!isSpeaking"
                :disabled="waiting"
                type=""
                size="large"
                class="icon-btn"
                shape="circle"
                @click="handleSpeak(true)">
        <template #icon>
          <AudioOutlined />
        </template>
      </a-button>
      <a-button
        v-show="isSpeaking"
        danger
        size="large"
        class="icon-btn"
        shape="circle"
        @click="handleSpeak(false)">
        <template #icon>
          <AudioMutedOutlined />
        </template>
      </a-button>
      <a-button
        size="large"
        class="icon-btn"
        shape="circle"
        @click="scrollEvt(1)">
        <template #icon>
          <CaretDownOutlined />
        </template>
      </a-button> -->
    </div>
    <!-- 描述的话 -->
    <!-- <div class="operation-box">
      <a-button

        size="large"
        class="icon-btn"
        shape="circle"
        @click="handleSendMsg()">
        <span>OK</span>
      </a-button>
    </div> -->

    <div class="input-box">
      <a-input class="mail-box"
               placeholder="Email" />
      <div class="mail-text">
        Subscribe to preorder Chatee.
      </div>
    </div>
    <!-- <div class="page-box">
      <div class="chat-box">
        <div v-for="(item, index) in content"
             :key="index"
             class="role-gpt msg"
             :class="{ 'role-gpt': item.role === 'gpt', 'role-user': item.role === 'user' }">
          {{ item.role === 'user' ? '你' : '喵喵' }}：{{ item.msg }}
        </div>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import { Configuration, OpenAIApi } from 'openai'
// import { ChatGPTAPI } from 'chatgpt'
import CatBox from '@/components/CatBox.vue' // @ is an alias to /src
import Speaking from '@/components/Speaking.vue' // @ is an alias to /src
import { AudioOutlined, AudioMutedOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  name: 'HelloWorld',
  components: {
    CatBox,
    Speaking,
    // AudioOutlined,
    // AudioMutedOutlined,
    // CaretDownOutlined,
    // CaretUpOutlined,
  },
  props: {
    msg: {
      type: String,
      default: '',
    },
  },

  setup () {
    const state = reactive({
      topPics: [
        '喵～你最近最遗憾的事情是什么呢？可以和本喵分享吗？',
        '嗷呜～气死喵了，今天出门忘记带零食了，你有猫粮吗？',
        '喵～本喵今天心情好，不知道屏幕前的你怎样。',
        '作为喵星人最具头脑的喵，我允许你跟本喵聊聊天',
        '怎样，找寡人有什么事？',
        '一看你就是下班的人了，不然不会还记得找本喵。',
        '啥？又有谁惹我铲屎官不开心了？',
        '不是吧，2023了还有人不认识本chatee喵',
        '对了，没事记得给我充充电，我虽然不食人间烟火，但是少了能量也会干涸～',
        '我觉得python才不是世界上最好的语言！',
      ],
      contextArr: [] as any[], // 保存4条会话记录
      isSpeaking: false,
      recognition: null as any,
      ignore_onend: false, // 出错了，需要忽略
      final_transcript: '',

      speak_input: '', // 当前提问的问题
      current_question: '', // 当前提问的问题
      current_answer: '',

      openai: null as any,
      val: '',
      content: [] as any[],

      waiting: false,
      messageBox: null as any,
      token: '',
    })

    async function getToken () {
      var xhr = new XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          state.token = xhr.responseText
        }
      }
      xhr.open('GET', 'https://cuby-chatee.oss-cn-hongkong.aliyuncs.com/joyo-cuby-chatte.txt', true)
      xhr.send(null)
    }

    async function askQuestion () {
      if (state.waiting) return
      state.waiting = true
      state.content.unshift({
        msg: state.val || 'unknow',
        role: 'user',
      })
      const configuration = new Configuration({
        apiKey: state.token,
      })
      const openai = new OpenAIApi(configuration)

      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '你是一只性格十分中二，语言很幽默，但是又很聪明的宠物猫，每句回复后面都会带上“喵～”或“嗷呜～。并且你会用较简短的话快速回复我”。' },
          ...state.contextArr,
          { role: 'user', content: state.val },
        ],
      })
      const reply = completion.data.choices[0].message as any
      addContextArr({ role: 'user', content: state.val })
      addContextArr({ role: 'assistant', content: reply.content })

      state.val = ''
      state.content.unshift({
        msg: reply.content,
        role: 'gpt',
      })

      // handleSpeakWord(reply.content)

      state.current_answer = reply.content
      state.waiting = false
    }

    function handleSpeakWord (text: string) { // 播放语音
      var utterThis = new SpeechSynthesisUtterance(text)
      const synth = window.speechSynthesis
      const voices = synth.getVoices()
      const name = 'Google 普通话（中国大陆）'
      for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === name) {
          utterThis.voice = voices[i]
        }
      }
      utterThis.pitch = 1
      utterThis.rate = 1
      synth.speak(utterThis)
    }

    function handleSendMsg () { // 发送消息
      if (state.waiting) return
      if (!state.current_question) return
      state.current_answer = ''
      state.val = state.current_question
      askQuestion()
    }

    function addContextArr (record: any) {
      state.contextArr.push(record)
      if (state.contextArr.length > 10) {
        state.contextArr.splice(0, 1)
      }
    }

    function handleSpeak (isOn: boolean) { //
      if (state.isSpeaking) {
        state.recognition.stop()
        return
      }
      state.current_question = ''
      state.recognition.lang = 'cmn-Hans-CN'
      state.recognition.start()
      state.ignore_onend = false

      state.current_question = ''
      state.speak_input = ''
    }

    function initSpeak () {
      if (!('webkitSpeechRecognition' in window)) {
        alert('抱歉设备不支持语音输入')
      } else {
        const WebkitSpeechRecognition = (window as any).webkitSpeechRecognition as any
        const recognition = new WebkitSpeechRecognition()
        state.recognition = recognition

        recognition.continuous = true // 持续监听
        recognition.interimResults = true // 输出中间的识别词

        recognition.onstart = function () {
          state.isSpeaking = true
        }

        recognition.onerror = function (event: any) {
          state.isSpeaking = false
          if (event.error === 'no-speech') {
            state.ignore_onend = true
            alert('no-speech') // 没识别到语音
          }
          if (event.error === 'audio-capture') {
            state.ignore_onend = true
            alert('no_microphone') // 没有麦克风
          }
          if (event.error === 'not-allowed') {
            state.ignore_onend = true
            alert('not-allowed') // 没有权限
          }
        }

        recognition.onend = function () {
          state.isSpeaking = false
        }

        recognition.onresult = function (event: any) {
          state.speak_input = ''
          if (typeof (event.results) === 'undefined') {
            recognition.onend = null
            recognition.stop()
            return
          }

          for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              state.current_question += event.results[i][0].transcript
              handleSendMsg()
            } else {
              state.speak_input += event.results[i][0].transcript
            }
          }
        }
      }
    }

    function scrollEvt (factor: number) { // 1 向下，-1向上
      const messageBox = state.messageBox
      messageBox.scrollTop = messageBox.scrollTop + 30 * factor
    }

    function generateTopic () {
      const topic = state.topPics[Math.floor(Math.random() * state.topPics.length)]
      state.current_answer = topic
      addContextArr({ role: 'assistant', content: topic })
    }

    onMounted(async () => {
      getToken()
      state.messageBox = document.getElementById('messageBox')
      initSpeak()
      generateTopic()
    })

    return {
      handleSpeak,
      handleSendMsg,
      askQuestion,
      scrollEvt,
      ...toRefs(state),
    }
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.hello {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  box-sizing: border-box;
  padding: 10px 10px 10px 10px;
  // background: linear-gradient(180deg, #686868 0%, #4C6975 0.01%, #6f868f 15%, rgba(217, 217, 217, 0) 100%);
  background: linear-gradient(180deg, #686868 0%, #4C6975 0.01%, rgba(217, 217, 217, 0) 100%);
  width: 100vw;
  height: 100vh;
  overflow-x:hidden;
  user-select:none;
.header-text {
  width: 100%;
  color: #fff;
  font-family: 微软雅黑;
  &.h1 {
    font-weight: 700;
    font-size: 32px;
    margin-bottom: 0;
  }
}
  .device-panel {
    box-sizing: border-box;
    width: 100%;
    padding-top: 100%;
    // height: 270px;
    // padding-top: 68.5%;
    position: relative;
    .device-box {
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      // width: 100%;
      // height: 100%;
      width: 375px;
      height: 375px;

      background-color: transparent;
      background-image: url(/chatee/dist/bg3.png);
      background-size: 100% 100%;
      // padding: 24px 20px 20px 22px;
      padding: 145px 105px 94px 105px;
      box-sizing: border-box;

      .device-screen {
        font-family: pixel, 微软雅黑, Helvetica, Arial, sans-serif;
        font-size: 12px;
        // background: #eee;
        width: 100%;
        height: 100%;
        position: relative;
        .question-box {
          padding: 10px;
          box-sizing: border-box;
          display: flex;
          flex-wrap: nowrap;
          .question-text {
            flex: 1;
            text-align: left;
            padding-left: 10px;
            box-sizing: border-box;
            color: rgba(255, 255, 255, .7);
            max-height: 100px;
            overflow: scroll;

            .tips {
              color: rgb(84, 246, 58, .6);
            }
          }
        }
      }
    }
  }

   .my-cursor {
      color: #54f63a;
      font-weight: bold;
      // text-shadow: 5px 5px 5px #54f63a;
      animation: 0.6s cursor-flicker infinite;
    }

  .operation-box {
    width: 100%;
    padding-top: 20px;
    position: relative;
    text-align: center;

    .arrow {
      position: absolute;
      width: 50px;
      height: 35px;
      left: 60px;
      top: 20px;
      background-image: url(/chatee/dist/arrow.png);
      background-size: 100% 100%;
    }
    .img-btn { // 图形按钮
      display: inline-block;
      width: 65px;
      height: 65px;
    }
    .speak {
       background-image: url(/chatee/dist/btn-unpressed.png);
       background-size: 100% 100%;
    }
    .speaking {
       background-image: url(/chatee/dist/btn-pressed.png);
       background-size: 100% 100%;
    }

    .icon-btn {
      margin: 0 20px;
      border-color: #444;
     &:focus {
        opacity: .8;
        transform: scale(1.1);
      }
    }
  }
  .page-box {
    width: 100%;
    text-align: center;

  }
  .chat-box {
    display: inline-block;
    // flex-wrap: wrap;
    width: 500px;
    background: #eeeeee;
    height: 500px;
    overflow-y: scroll;
    overflow-x: hidden;
    text-align: left;
    .msg {
      font-size: 16px;
      width: 100%;
      min-height: 50px;
      padding: 10px;
      box-sizing: border-box;
      // height: ;
    }
  }
  .input-box {
    width: 500px;
    text-align: center;
    .mail-box {
      text-align: left;
      width: 280px;
      height: 55px;
      background: linear-gradient(180deg, #050505 0%, #5E5E5E 100%);
      border: 2px solid #000000;
      border-radius: 15px;
      font-family: pixel, 微软雅黑, Helvetica, Arial, sans-serif;
      // color: #fff;
      color: rgb(84, 246, 58, .6);
    }
    .mail-text {
      margin-top: 5px;
    }
    .my-input {
      // width: 300px;
    }
    .button {

    }
  }
  .current-answer-text {
    padding: 0 10px;
    box-sizing: border-box;
    text-align: left;
    color: #eeeeee;
    max-height: calc(100% - 100px);
    overflow: scroll;
  }
}

@keyframes cursor-flicker {
  from {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

</style>
