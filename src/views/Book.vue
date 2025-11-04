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
        <LoveTree />
        <div class="cover-page"></div>
        <Foreword />
        <LoveFlipTimer />
        <div class="transparent-page"></div>
        <Six />
        <HeartAnimation />
        <!-- <LOVEYOU /> -->
        <!-- <div class="cover-page7"></div> -->
        <letter1 />
        <letter2 />
        <letter3 />
        <letter4 />
        <letter5 />
        <letter6 />
        <letter7 />
        <letter8 />
        <letter9 />
        <letter10 />
        <Start />
        <div v-for="n in 4" :key="n" class="blank-page">
        </div>
      </div>
    </div>
    <div class="page-info">
      第 {{ currentPage }} / {{ totalPages }} 页
    </div>
    <div class="navigation-buttons">
      <button class="prev-btn" @click="goToPreviousPage">上一页</button>
      <button class="next-btn" @click="goToNextPage">下一页</button>
    </div>
    <MusicPlayer />
  </div>
</template>

<script>
import '../js/turn.js'
import '../js/APlayer.min.js'
import '../js/APlayer.min.css'

import LoveTree from '@/components/LoveTree.vue'
import Foreword from './foreword.vue'
import LoveFlipTimer from '@/components/LoveFlipTimer.vue'
import LOVEYOU from './LOVEYOU.vue'
import HeartAnimation from './HeartAnimation.vue'
import Six from './six.vue'
import letter1 from './letter/letter-1-X.vue'
import letter2 from './letter/letter-2-A.vue'
import letter3 from './letter/letter-3-M.vue'
import letter4 from './letter/letter-4-L.vue'
import letter5 from './letter/letter-5-O.vue'
import letter6 from './letter/letter-6-V.vue'
import letter7 from './letter/letter-7-E.vue'
import letter8 from './letter/letter-8-Z.vue'
import letter9 from './letter/letter-9-S.vue'
import letter10 from './letter/letter-10-Y.vue'

import Start from './love.vue'

import MusicPlayer from '@/components/MusicPlayer.vue'

export default {
  name: 'Home',
  components: {
    LoveTree,
    Foreword,
    LoveFlipTimer,
    LOVEYOU,
    HeartAnimation,
    Six,
    letter1,
    letter2,
    letter3,
    letter4,
    letter5,
    letter6,
    letter7,
    letter8,
    letter9,
    letter10,
    Start,

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
          // pages: 13,
          duration: 1000,
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

    // 获取随机的粉色调颜色
    getRandomPinkColor() {
      const pinks = [
        'rgba(255, 105, 180, 0.5)',
        'rgba(255, 182, 193, 0.5)',
        'rgba(255, 192, 203, 0.5)',
        'rgba(255, 228, 225, 0.5)',
        'rgba(255, 160, 122, 0.5)'
      ];
      return pinks[Math.floor(Math.random() * pinks.length)];
    },
    // 创建翻页时的特效
  },
  mounted() {
    this.onTurn();

    // 启动全局樱花效果
    if (window.startSakura) {
      window.startSakura();
    }
  },

  beforeDestroy() {
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

    .cover-page {
      width: 100%;
      height: 100%;
      background-color: #f5f5f5;
      background-image: url('../../public/image/calendar.png');
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;
    }

    .cover-page7 {
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
    gap: 30px;
    width: 300px;
    z-index: 100;
  }

  .prev-btn,
  .next-btn {
    width: 100px;
    height: 40px;
    background: transparent;
    color: #ffffff;
    border: 2px solid #5d4037;
    cursor: pointer;
    font-size: 20px;
    border-radius: 8px;
    position: relative;
    transform: rotate(-1deg);
    box-shadow: 3px 3px 0 #5d4037;
    font-family: 'Write', cursive, 'Comic Sans MS', sans-serif;
    transition: all 0.2s ease;
    z-index: 1;
  }
  
  .prev-btn:hover,
  .next-btn:hover {
    transform: rotate(0deg) translateY(-0.5px);
    box-shadow: 4px 4px 0 #5d4037;
  }
  
  .prev-btn:active,
  .next-btn:active {
    transform: rotate(0deg) translateY(0);
    box-shadow: 1px 1px 0 #5d4037;
  }

  .prev-btn::before,
  .next-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  }

  .prev-btn:hover,
  .next-btn:hover {
    box-shadow: 0 8px 16px rgba(238, 90, 111, 0.5);
  }

  .prev-btn:hover::before,
  .next-btn:hover::before {
    left: 100%;
  }

  .prev-btn:active,
  .next-btn:active {
    box-shadow: 0 2px 4px rgba(238, 90, 111, 0.3);
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
