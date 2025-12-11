<template>
  <div class="home">
    <!-- 背景视频 -->
    <div class="video-background">
      <video autoplay loop muted playsinline class="bg-video">
        <source src="/image/sakura.mp4" type="video/mp4">
      </video>
    </div>
    <div class="turnClass">
      <div id="flipbook">
        <LoveTree_1 />
        <div class="calendar_2"></div>
        <Foreword_3 />
        <LoveFlipTimer_45 />
        <div class="transparent-page"></div>
        <Say_6 />
        <HeartAnimation_7 />
        <!-- <LOVEYOU /> -->
        <!-- <div class="_4_good"></div> -->
        <letter1_8 />
        <letter2_9 />
        <letter3_10 />
        <letter4_11 />
        <letter5_12 />
        <letter6_13 />
        <letter7_14 />
        <letter8_15 />
        <letter9_16 />
        <letter10_17 />
        <CatBlack_18 />
        <CatWhite_19 />
        <Say2_20 />
        <div class="good_21"></div>
        <ToBeContinue_22 />
        <love_23 />
        <InTheEnd_24 />
        <!-- <div v-for="n in 1" :key="n" class="blank-page"></div> -->
      </div>
    </div>
    <div class="page-info">
      第 {{ currentPage }} / {{ totalPages }} 页
    </div>
    <div class="navigation-buttons">
      <button class="prev-btn" @click="goToPreviousPage">
        上一页
        <div class="heart1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path>
          </svg>
        </div>
        <div class="heart2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path>
          </svg>
        </div>
        <div class="heart3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path>
          </svg>
        </div>
      </button>
      <button class="next-btn" @click="goToNextPage">
        下一页
        <div class="heart1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path>
          </svg>
        </div>
        <div class="heart2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path>
          </svg>
        </div>
        <div class="heart3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path>
          </svg>
        </div>
      </button>
    </div>
    <MusicPlayer />
  </div>
</template>

<script>
import '../js/turn.js'
import '../js/APlayer.min.js'
import '../js/APlayer.min.css'

import LoveTree_1 from '@/components/LoveTree.vue'
import Foreword_3 from './foreword.vue'
import LoveFlipTimer_45 from '@/components/LoveFlipTimer.vue'
import Say_6 from './say.vue'
import HeartAnimation_7 from './HeartAnimation.vue'
import letter1_8 from './letter/letter-1-X.vue'
import letter2_9 from './letter/letter-2-A.vue'
import letter3_10 from './letter/letter-3-M.vue'
import letter4_11 from './letter/letter-4-L.vue'
import letter5_12 from './letter/letter-5-O.vue'
import letter6_13 from './letter/letter-6-V.vue'
import letter7_14 from './letter/letter-7-E.vue'
import letter8_15 from './letter/letter-8-Z.vue'
import letter9_16 from './letter/letter-9-S.vue'
import letter10_17 from './letter/letter-10-Y.vue'
import CatBlack_18 from './cat-black.vue'
import CatWhite_19 from './cat-white.vue'
import Say2_20 from './say2.vue'
import ToBeContinue_22 from './To be continue.vue'
import love_23 from './love.vue'
import InTheEnd_24 from './In the end.vue'

import MusicPlayer from '@/components/MusicPlayer.vue'

export default {
  name: 'Home',
  components: {
    LoveTree_1,
    Foreword_3,
    LoveFlipTimer_45,
    Say_6,
    HeartAnimation_7,
    letter1_8,
    letter2_9,
    letter3_10,
    letter4_11,
    letter5_12,
    letter6_13,
    letter7_14,
    letter8_15,
    letter9_16,
    letter10_17,
    CatBlack_18,
    CatWhite_19,
    Say2_20,
    ToBeContinue_22,
    love_23,
    InTheEnd_24,

    MusicPlayer
  },
  data() {
    return {
      currentPage: 1,
      totalPages: 0,
      heartPositions: {},
      // Three.js相关变量
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      heartGroup: null,
      animationId: null
    }
  },
  methods: {
    onTurn() {
      this.$nextTick(() => {
        $("#flipbook").turn({
          autoCenter: true,
          height: 650,
          width: 1300,
          duration: 1000, // 适当缩短翻页动画时长
          acceleration: true, // 开启硬件加速
          when: {
            turned: () => {
              // 页面翻转后更新当前页码
              this.currentPage = this.getCurrentPage();
            }
          }
        });
        // 初始化页码信息
        this.totalPages = this.getTotalPages();
        this.currentPage = this.getCurrentPage();
      })
    },
    // 获取总页数
    getTotalPages() {
      return $("#flipbook").turn("pages");
    },
    // 获取当前页码
    getCurrentPage() {
      return $("#flipbook").turn("page");
    },
    // 下一页
    goToNextPage() {
      $("#flipbook").turn("next");
      this.currentPage = this.getCurrentPage();
    },
    // 上一页
    goToPreviousPage() {
      $("#flipbook").turn("previous");
      this.currentPage = this.getCurrentPage();
    },
    // 跳转到指定页
    goToPage(pageNum) {
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        $("#flipbook").turn("page", pageNum);
        this.currentPage = pageNum;
      }
    },
  },
  mounted() {
    this.onTurn();

    // 启动全局樱花效果
    if (window.startSakura) {
      window.startSakura();
    }
  },

  beforeDestroy() {
    // 清理turn.js实例
    if ($("#flipbook").turn("is")) {
      $("#flipbook").turn("destroy");
    }
    // 清理Three.js资源
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }

    // 停止全局樱花效果
    if (window.stopSakura) {
      window.stopSakura();
    }
  },

  // 窗口大小变化处理
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
</script>
<style lang="less">
* {
  margin: 0;
  padding: 0;
}

.home {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  // 视频背景样式
  .video-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
  }

  .bg-video {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    transform: translate(-50%, -50%);
    filter: brightness(1); // 提高视频亮度
  }

  .turnClass {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1200px;
    height: 646px;
    position: relative;
  }

  #flipbook {
    z-index: 1;
    border-radius: 20px;

    .calendar_2 {
      width: 100%;
      height: 100%;
      background-color: #f5f5f5;
      background-image: url('../../public/image/calendar.png');
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;
    }

    .good_21 {
      width: 100%;
      height: 100%;
      background-color: #f5f5f5;
      background-image: url('../../public/image/good.gif');
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;
    }

    .blank-page {
      width: 100%;
      height: 100%;
      background-color: #f5f5f5;
      position: relative;
      overflow: hidden;
    }

    .transparent-page {
      width: 100%;
      height: 100%;
      background-color: transparent;
      position: relative;
      overflow: hidden;
    }

    @keyframes floatHeart {

      0%,
      100% {
        transform: translate(-50%, -50%) rotate(45deg) translateY(0px);
        opacity: 0;
      }

      50% {
        transform: translate(-50%, -50%) rotate(45deg) translateY(-10px);
        opacity: 0.8;
      }
    }
  }

  .navigation-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    gap: 50px;
    width: 100%;
    z-index: 100;
  }

  .prev-btn,
  .next-btn {
    font-size: 2.2rem;
    padding: 0.7rem 2.4rem;
    letter-spacing: .3rem;
    border-radius: 1.5rem;
    background-color: transparent;
    color: rgb(255, 255, 255);
    border: none;
    text-shadow: 0 0 3px #ffc0cb;
    overflow: hidden;
    cursor: pointer;
    transition: 0.7s;
    z-index: 2;
    font-family: 'Write', cursive, 'Comic Sans MS', sans-serif;
    font-weight: bold;
    user-select: none;
    /* 禁止文字被选中 */
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .prev-btn .heart1 svg,
  .next-btn .heart1 svg,
  .prev-btn .heart2 svg,
  .next-btn .heart2 svg,
  .prev-btn .heart3 svg,
  .next-btn .heart3 svg {
    position: absolute;
    opacity: 0;
    fill: rgb(255, 0, 43);
    stroke: none;
    transition: 0.7s;
    animation: moveHeart 5s ease-in-out infinite alternate-reverse;
  }

  .prev-btn .heart1 svg,
  .next-btn .heart1 svg {
    left: 4.5rem;
    top: 1.8rem;
    width: 2rem;
    height: 2rem;
  }

  .prev-btn .heart2 svg,
  .next-btn .heart2 svg {
    left: 0.8rem;
    top: 0.3rem;
    width: 1.5rem;
    height: 1.5rem;
    transform: rotate(-20deg);
  }

  .prev-btn .heart3 svg,
  .next-btn .heart3 svg {
    right: 1rem;
    top: 0.5rem;
    width: 1.4rem;
    height: 1.4rem;
    transform: rotate(20deg);
    z-index: -1;
  }

  @keyframes moveHeart {
    0% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-10px);
    }

    100% {
      transform: translateY(0);
    }
  }

  .prev-btn:hover .heart1 svg,
  .next-btn:hover .heart1 svg,
  .prev-btn:hover .heart2 svg,
  .next-btn:hover .heart2 svg,
  .prev-btn:hover .heart3 svg,
  .next-btn:hover .heart3 svg {
    opacity: 1;
    filter: drop-shadow(0 0 10px #ff6e6e);
  }

  .prev-btn:hover,
  .next-btn:hover {
    color: rgb(255, 255, 255);
    box-shadow: 0 0 10px inset #ff002b;
    scale: 105%;
  }

  .prev-btn:active,
  .next-btn:active {
    scale: 100%;
  }

  .page-info {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 18px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.3);
    padding: 8px 16px;
    border-radius: 20px;
    backdrop-filter: blur(5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 100;
  }
}
</style>
