<template>
  <div class="room-container" v-if="activeModel.id">
    <div class="title">
      {{ activeModel.id }}
    </div>

    <div class="message-container">
      <div
        :class="['bubble-container', item.from ? 'you' : 'me']"
        v-for="(item, index) in data"
        :key="index"
      >
        <div class="avatar">
          <img src="/avatar.jpg" alt="" v-if="item.from === 0" />
          <img src="/chatgpt.svg" alt="" v-if="item.from === 1" />
        </div>
        <div class="message">
          <pre
            class="bubble-box"
            :key="item.message"
            v-html="item.message"
          ></pre>
        </div>
      </div>
    </div>
    <div class="input-part">
      <textarea
        class="input"
        v-model="words"
        :placeholder="
          receiving ? 'Receiving data, please wait.' : 'Write something'
        "
        @keypress.enter="chat"
      ></textarea>
    </div>
  </div>
  <div class="tips-container" v-else>
    <img src="/start-illustration.svg" class="tip-svg" alt="" />
    <div class="text">Choose a model first</div>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import moment from "moment";
import qs from "qs";

const props = defineProps({
  activeModel: {
    type: Object,
    default: () => ({}),
  },
});

const data = ref([]);
const words = ref("");
const receiving = ref(false);
const chating = ref(false);

const dbhandler = {
  readDbSheet(sheetName) {
    try {
      const res = JSON.parse(localStorage.getItem("chatgpt-db"));
      return res instanceof Object ? res[sheetName] || [] : [];
    } catch (error) {
      return [];
    }
  },
  setDbSheet(sheetName, obj) {
    let res = {};
    try {
      res = JSON.parse(localStorage.getItem("chatgpt-db"));
    } finally {
      const db = res instanceof Object ? res || {} : {};
      db[sheetName] = obj;
      localStorage.setItem("chatgpt-db", JSON.stringify(db));
    }
  },
};

watch(
  () => props.activeModel,
  () => {
    data.value = dbhandler.readDbSheet(props.activeModel.id);
  }
);

const chat = (e) => {
  if (e.shiftKey) {
    return;
  }
  if (chating.value) {
    return;
  }
  e.preventDefault();
  const w = words.value;
  const newMes = {
    time: moment().format("yyyy-MM-dd HH:mm:ss"),
    message: w,
    from: 0,
  };
  data.value.unshift(newMes);
  dbhandler.setDbSheet(props.activeModel.id, data.value);
  words.value = "";

  chating.value = true;

  let prompt = "";
  // 只提取前4句
  for (let i = 4; i >= 0; i--) {
    const m = data.value[i];
    if (!m) {
      continue;
    }
    prompt += `${m.message} \n`;
  }
  
  const { token } = qs.parse(location.search.slice(1));
  
  const sse = new EventSource(
    `/api-chatgpt-integrate/completion?token=${token}&model=${props.activeModel.id}&prompt=${prompt}`
  );
  const complition = ref({
    time: moment().format("yyyy-MM-dd HH:mm:ss"),
    message: "",
    from: 1,
  });
  sse.onerror = () => {
    chating.value = false;
  };
  sse.addEventListener("message", (e) => {
    if (e.data === "[DONE]") {
      sse.close();
      dbhandler.setDbSheet(props.activeModel.id, data.value);
      receiving.value = false;
      chating.value = false;
      return;
    }
    try {
      const d = JSON.parse(e.data).choices[0].text;
      if (!receiving.value) {
        receiving.value = true;
        data.value.unshift(complition.value);
      }
      complition.value.message += d;
    } catch (error) {
      console.error(error);
    }
  });
};
</script>
<style lang="less" scoped>
.room-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  .title {
    height: 46px;
    border-bottom: 1px solid rgb(223, 223, 223);
    font-size: 20px;
    text-align: left;
    display: flex;
    color: #000;
    align-items: center;
    padding-left: 1em;
  }

  .message-container {
    flex: 1;
    padding: 1em;
    display: flex;
    flex-direction: column-reverse;
    overflow: auto;

    &::-webkit-scrollbar-thumb {
      background: #ffffff;
    }
    &:hover::-webkit-scrollbar-thumb {
      background: #dbdbdb;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #d1d1d1;
    }

    .bubble-container {
      display: flex;
      margin: 0.5em;
      .avatar {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-content: center;
        justify-content: center;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 100%;
          height: 100%;
        }
      }
      &.me {
        flex-direction: row-reverse;
        .bubble-box {
          --bubble-c: rgb(106, 241, 119);
          &::after {
            content: " ";
            position: absolute;
            width: 0;
            height: 0;
            /* 箭头靠右边 */
            top: 10px;
            right: -5px;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-left: 5px solid var(--bubble-c);
          }
        }
      }

      &.you {
        flex-direction: row;
        .bubble-box {
          --bubble-c: rgb(228, 228, 228);
          &::after {
            content: " ";
            position: absolute;
            width: 0;
            height: 0;
            /* 箭头靠右边 */
            top: 10px;
            left: -5px;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-right: 5px solid var(--bubble-c);
          }
        }
      }

      .message {
        margin: 5px 10px;
        max-width: 200px;

        .bubble-box {
          color: #000;
          padding: 8px;
          background: var(--bubble-c);
          text-align: left;
          white-space: pre-wrap;
          word-break: break-word;
          border-radius: 4px;
          position: relative;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          font-size: 14px;
          line-height: 18px;
        }
      }
    }
  }

  .input-part {
    height: 150px;
    box-sizing: content-box;
    margin: 0 18px;
    border-top: 1px solid rgb(223, 223, 223);
    display: flex;
    padding: 12px 0;
    .input {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      border: none;
      flex: 1;
      font-size: 14px;
      line-height: 18px;
      resize: none;
      &:focus-visible {
        outline: none;
      }
      &:disabled {
        background-color: #f9f9f9;
      }
    }
  }
}

.tips-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .tip-svg {
    width: 200px;
  }

  .text {
    margin-top: 40px;
    font-size: 36px;
    font-family: fantasy;
  }
}
</style>
