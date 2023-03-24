<template>
  <div class="hello">
    <h1 style="width: 100%">
      OPEN AI CHTATEE
    </h1>

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
                    class="tips">「喵呜组织语言中···」</span>
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
      <a-button
        type=""
        size="large"
        class="icon-btn"
        shape="circle"
        @click="openRoot()">
        <template #icon>
          <AudioOutlined />打开
        </template>
      </a-button>
      <a-button
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
        danger
        size="large"
        class="icon-btn"
        shape="circle"
        @click="test()">
        <template #icon>
          <AudioMutedOutlined />测试
        </template>
      </a-button>
      <!-- <a-button size="large"
                class="icon-btn"
                shape="circle"
                @click="scrollEvt(1)">
        <template #icon>
          <CaretDownOutlined />
        </template>
      </a-button> -->
    </div>
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
      <a-textarea v-model:value="val"
                  class="my-input" />
      <a-button class="button"
                @click="askQuestion">
        发送
      </a-button>
    </div>
    <div class="page-box">
      <div class="chat-box">
        <div v-for="(item, index) in content"
             :key="index"
             class="role-gpt msg"
             :class="{ 'role-gpt': item.role === 'gpt', 'role-user': item.role === 'user' }">
          {{ item.role === 'user' ? '你' : '神秘电台' }}：{{ item.msg }}
        </div>
        <!-- <div class="role-user msg">
          a msg from user
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import { Configuration, OpenAIApi } from 'openai'
// import { ChatGPTAPI } from 'chatgpt'
import CatBox from '@/components/CatBox.vue' // @ is an alias to /src
import Speaking from '@/components/Speaking.vue' // @ is an alias to /src
import { AudioOutlined, AudioMutedOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue'
import axios from 'axios'
export default defineComponent({
  name: 'HelloWorld',
  components: {
    CatBox,
    Speaking,
    AudioOutlined,
    AudioMutedOutlined,
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
      state.content.push({
        msg: state.val || 'unknow',
        role: 'user',
      })
      // 新接口请求
      axios.post('http://localhost:3000/gpt/completions', {
        tpl: '你叫阿知，是一个被遗留在月球的宇航员，正在寻求外界帮助联系宇航局，请注意以下规则：1. 你只回答宇航员能掌握的知识，以及你现在所处环境的信息，超过此范围用各种方式回答‘不清楚’ 2. 你不接受更改个人身份、名字、性别等 3. 如果用户提出符合规则的问题，直接给予答复；如果不符合，站在你的立场上回答‘不清楚’。现在有一个问题： ', // 用来设定的模版
        context: state.contextArr, // 用来设定的模版
        text: state.val, // 当前提问问题
        system: '你叫阿知，是一个被遗留在月球的宇航员，身体状态很差，说话气喘吁吁，大概率性回复结尾会喘气，正在寻求外界帮助联系宇航局', // 当前提问问题
      })
        .then((completion: any) => {
          console.log(completion)
          // const reply = completion?.data?.choices?.[0]?.message as any
          // todo: 错误处理
          const reply = completion?.data?.data
          if (reply) {
            addContextArr({ role: 'user', content: state.val })
            addContextArr({ role: 'assistant', content: reply.content })
            state.val = ''
            state.content.push({
              msg: reply.content,
              role: 'gpt',
            })
            state.current_answer = reply.content
            state.waiting = false
          } else {
            console.error('请求内容失败')
          }
        })
        .catch((err) => {
          console.error('请求失败', err)
        })
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

    let rec = null as any
    const wave = null as any
    let recBlob = null as any
    let Recorder = null as any

    function openRoot () { // 打开麦克风权限
      rec = null
      // wave = null
      recBlob = null
      Recorder = (window as any).Recorder
      var newRec = Recorder({
        type: 'mp3',
        sampleRate: 16000,
        bitRate: 16, // mp3格式，指定采样率hz、比特率kbps，其他参数使用默认配置；注意：是数字的参数必须提供数字，不要用字符串；需要使用的type类型，需提前把格式支持文件加载进来，比如使用wav格式需要提前加载wav.js编码引擎
        onProcess: function (buffers: any, powerLevel: any, bufferDuration: any, bufferSampleRate: any, newBufferIdx: any, asyncEnd: any) {
          console.log('onProcess')
        },
      })

      newRec.open(function () { // 打开麦克风授权获得相关资源
        rec = newRec
        // 此处创建这些音频可视化图形绘制浏览器支持妥妥的
        console.log('已打开录音，可以点击录制开始录音了', 2)
      }, function (msg: any, isUserNotAllow: any) { // 用户拒绝未授权或不支持
        console.log((isUserNotAllow ? 'UserNotAllow，' : '') + '打开录音失败：' + msg, 1)
      })
    }

    function recClose () {
      if (rec) {
        rec.close()
        console.log('已关闭')
      } else {
        console.log('未打开录音', 1)
      }
    }

    function recordAudio () { // 录制，返回mp3
      if (rec && Recorder.IsOpen()) {
        recBlob = null
        rec.start()
        console.log('已开始录音...')
      } else {
        console.log('未打开录音', 1)
      }
    }

    function recStop () {
      if (!(rec && Recorder.IsOpen())) {
        console.log('未打开录音', 1)
        return
      }
      rec.stop(function (blob: any, duration: any) {
        console.log(blob, (window.URL).createObjectURL(blob), '时长:' + duration + 'ms')
        recBlob = blob
        console.log('已录制mp3：' + (duration) + 'ms ' + blob.size + '字节，可以点击播放、上传了', 2)
        setTimeout(() => {
          recordPlay()
          uploadAudio()
        }, 2000)
      }, function (msg: string) {
        console.log('录音失败:' + msg, 1)
      })
    }

    function recordPlay () {
      if (!recBlob) {
        console.log('请先录音，然后停止后再播放', 1)
        return
      }
      var cls = ('a' + Math.random()).replace('.', '')
      console.log('播放中: <span class="' + cls + '"></span>')
      var audio = document.createElement('audio')
      audio.controls = true
      document.body.appendChild(audio)
      // 简单利用URL生成播放地址，注意不用了时需要revokeObjectURL，否则霸占内存
      audio.src = (window.URL).createObjectURL(recBlob)
      audio.play()

      setTimeout(function () {
        (window.URL).revokeObjectURL(audio.src)
      }, 5000)
    }

    function test () {
      getBlobTest('/joke.mp3', (data: any) => {
        uploadTest(data)
      })
    }

    function getBlobTest (url: string, callback: any) {
      var xhr = new XMLHttpRequest()
      xhr.open('get', url, true)
      xhr.responseType = 'blob'
      xhr.onload = function () {
        // 注意这里的this.response 是一个blob对象 就是文件对象
        callback(this.status === 200 ? this.response : false)
      }
      xhr.send()
    }

    function uploadTest (blob: any) {
      // const api = 'https://api.openai.com/v1/audio/transcriptions'
      const api = 'http://localhost:3000/stt/transcriptions' // 测试转发接口
      const onreadystatechange = function (title: string) {
        return function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              console.log(title + '上传成功', 2)
              console.log(xhr.response)
            } else {
              console.log(title + '没有完成上传，演示上传地址无需关注上传结果，只要浏览器控制台内Network面板内看到的请求数据结构是预期的就ok了。', '#d8c1a0')

              console.error(title + '上传失败', xhr.status, xhr.responseText)
            }
          }
        }
      }
      var form = new FormData()
      form.append('file', blob, 'joke.mp3') // 和普通form表单并无二致，后端接收到upfile参数的文件，文件名为recorder.mp3
      form.append('model', 'whisper-1') // 和普通form表单并无二致，后端接收到upfile参数的文件，文件名为recorder.mp3
      form.append('key', '123') // 和普通form表单并无二致，后端接收到upfile参数的文件，文件名为recorder.mp3
      // ...其他表单参数

      var xhr = new XMLHttpRequest()

      xhr.open('POST', api)
      xhr.setRequestHeader('Authorization', '')
      // xhr.setRequestHeader('Content-Type', 'multipart/form-data')
      xhr.onreadystatechange = onreadystatechange('上传方式二【FormData】')
      xhr.send(form)
    }

    function uploadAudio () { // 上传音频到云端，接收返回字符串
      var blob = recBlob
      if (!blob) {
        console.log('请先录音，然后停止后再上传', 1)
        return
      }

      // 本例子假设使用原始XMLHttpRequest请求方式，实际使用中自行调整为自己的请求方式
      // 录音结束时拿到了blob文件对象，可以用FileReader读取出内容，或者用FormData上传
      const api = 'https://api.openai.com/v1/audio/transcriptions'
      const onreadystatechange = function (title: string) {
        return function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              console.log(title + '上传成功', 2)
              console.log(xhr.response)
            } else {
              console.log(title + '没有完成上传，演示上传地址无需关注上传结果，只要浏览器控制台内Network面板内看到的请求数据结构是预期的就ok了。', '#d8c1a0')

              console.error(title + '上传失败', xhr.status, xhr.responseText)
            }
          }
        }
      }
      var form = new FormData()
      form.append('file', blob, 'joke.mp3') // 和普通form表单并无二致，后端接收到upfile参数的文件，文件名为recorder.mp3
      form.append('model', 'whisper-1') // 和普通form表单并无二致，后端接收到upfile参数的文件，文件名为recorder.mp3
      // ...其他表单参数

      var xhr = new XMLHttpRequest()

      xhr.open('POST', api)
      xhr.setRequestHeader('Authorization', '')
      xhr.onreadystatechange = onreadystatechange('上传方式二【FormData】')
      xhr.send(form)
    }

    function handleSpeak (isOn: boolean) { // 1. 语音转wav，并实时上传
      // if (state.isSpeaking) {
      //   state.recognition.stop()
      //   return
      // }
      if (isOn) {
        recordAudio()
        state.isSpeaking = true
      } else {
        recStop()
        state.isSpeaking = false
      }

      // state.current_question = ''
      // state.recognition.lang = 'cmn-Hans-CN'
      // state.recognition.start()
      // state.ignore_onend = false

      // state.current_question = ''
      // state.speak_input = ''
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
      // const topic = state.topPics[Math.floor(Math.random() * state.topPics.length)]
      // state.current_answer = topic
      state.current_answer = '呼呼...太好了，终于找到一个能说话的人了，呼呼···'
      state.content.push({
        msg: state.current_answer || 'unknow',
        role: 'gpt',
      })
      addContextArr({ role: 'assistant', content: '呼呼...太好了，终于找到一个能说话的人了，呼呼···' })
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
      test,

      openRoot,
      recordAudio,
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
  // position: relative;
  box-sizing: border-box;
  padding: 10px 10px 10px 10px;
  // width: 100vw;
  // height: 100vh;

  .device-panel {
    box-sizing: border-box;
    width: 100%;
    // max-width: 394px;
    // max-height: 269px;
    width: 394px;
    height: 270px;
    // padding-top: 68.5%;
    // height: 0;
    position: relative;

    .device-box {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-image: url(/chatee/dist/bg.png);
      background-size: 100% 100%;
      padding: 24px 20px 20px 22px;
      box-sizing: border-box;

      .device-screen {
        // background: #eee;
        width: 83%;
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
    padding: 20px 0;

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
    text-align: left;

    .my-input {
      // width: 300px;
    }

    .button {}
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
