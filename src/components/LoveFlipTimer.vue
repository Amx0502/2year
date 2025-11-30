<template>
  <div class="love-flip-timer">
    <div id="loading-screen" :class="{ hidden: isLoaded }">
      <!-- 加载屏幕 -->
    </div>

    <div class="overlay-div">
      <div class="overlay-text">我们相恋了</div>
      <div class="clock-container">
        <div class="time-section">
          <div :class="{play: isPlay}">
            <ul class="flip">
              <li
                class="item"
                v-for="(item, key) in 10"
                :class="{active: timeArr[0] === key, before: key === before0}"
                :key="item"
              >
                <div class="up">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
                <div class="down">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
              </li>
            </ul>
          </div>
          <div :class="{play: isPlay}">
            <ul class="flip">
              <li
                class="item"
                v-for="(item, key) in 10"
                :class="{active: timeArr[1] === key, before: key === before1}"
                :key="item"
              >
                <div class="up">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
                <div class="down">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
              </li>
            </ul>
          </div>
          <div :class="{play: isPlay}">
            <ul class="flip">
              <li
                class="item"
                v-for="(item, key) in 10"
                :class="{active: timeArr[2] === key, before: key === before2}"
                :key="item"
              >
                <div class="up">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
                <div class="down">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
              </li>
            </ul>
          </div>
          <span class="unit">天</span>
        </div>
        <div class="time-section">
          <div :class="{play: isPlay}">
            <ul class="flip">
              <li
                class="item"
                v-for="(item, key) in 10"
                :class="{active: timeArr[3] === key, before: key === before3}"
                :key="item"
              >
                <div class="up">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
                <div class="down">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
              </li>
            </ul>
          </div>
          <div :class="{play: isPlay}">
            <ul class="flip">
              <li
                class="item"
                v-for="(item, key) in 10"
                :class="{active: timeArr[4] === key, before: key === before4}"
                :key="item"
              >
                <div class="up">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
                <div class="down">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
              </li>
            </ul>
          </div>
          <span class="unit">时</span>
        </div>
        <div class="time-section">
          <div :class="{play: isPlay}">
            <ul class="flip">
              <li
                class="item"
                v-for="(item, key) in 10"
                :class="{active: timeArr[5] === key, before: key === before5}"
                :key="item"
              >
                <div class="up">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
                <div class="down">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
              </li>
            </ul>
          </div>
          <div :class="{play: isPlay}">
            <ul class="flip">
              <li
                class="item"
                v-for="(item, key) in 10"
                :class="{active: timeArr[6] === key, before: key === before6}"
                :key="item"
              >
                <div class="up">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
                <div class="down">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
              </li>
            </ul>
          </div>
          <span class="unit">分</span>
        </div>
        <div class="time-section">
          <div :class="{play: isPlay}">
            <ul class="flip">
              <li
                class="item"
                v-for="(item, key) in 10"
                :class="{active: timeArr[7] === key, before: key === before7}"
                :key="item"
              >
                <div class="up">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
                <div class="down">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
              </li>
            </ul>
          </div>
          <div :class="{play: isPlay}">
            <ul class="flip">
              <li
                class="item"
                v-for="(item, key) in 10"
                :class="{active: timeArr[8] === key, before: key === before8}"
                :key="item"
              >
                <div class="up">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
                <div class="down">
                  <div class="shadow"></div>
                  <div class="inn">{{key}}</div>
                </div>
              </li>
            </ul>
          </div>
          <span class="unit">秒</span>
        </div>
      </div>
      <div class="start-date">起始日期：{{ startDate }}</div>
    </div>

    <section>
      <div class="images-gallery" ref="imagesGallery" id="images-gallery">
        <div class="column">
          <div v-for="(img, index) in column1Images" :key="`col1-${index}`">
            <template v-if="isVideoFile(img)">
              <video :src="img" autoplay loop muted playsinline @loadeddata="handleImageLoad"></video>
            </template>
            <template v-else>
              <img :src="getImageUrl(img)" alt="img" @load="handleImageLoad" @error="handleImageLoad">
            </template>
          </div>
        </div>
        <div class="column">
          <div v-for="(img, index) in column2Images" :key="`col2-${index}`">
            <template v-if="isVideoFile(img)">
              <video :src="img" autoplay loop muted playsinline @loadeddata="handleImageLoad"></video>
            </template>
            <template v-else>
              <img :src="getImageUrl(img)" alt="img" @load="handleImageLoad" @error="handleImageLoad">
            </template>
          </div>
        </div>
        <div class="column">
          <div v-for="(img, index) in column3Images" :key="`col3-${index}`">
            <template v-if="isVideoFile(img)">
              <video :src="img" autoplay loop muted playsinline @loadeddata="handleImageLoad"></video>
            </template>
            <template v-else>
              <img :src="getImageUrl(img)" alt="img" @load="handleImageLoad" @error="handleImageLoad">
            </template>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// 导入图片URL数组
const photoUrls = [
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/4.jpg',
  '/images/5.jpg',
  '/images/6.jpg',
  '/images/7.jpg',
  '/images/8.jpg',
  '/images/9.jpg',
  '/images/10.jpg',
  '/images/11.jpg',
  '/images/12.jpg',
  '/images/13.jpg',
  '/images/14.jpg',
  '/images/15.jpg',
  '/images/16.jpg',
  '/images/17.jpg',
  '/images/18.jpg',
  '/images/19.jpg',
  '/images/20.jpg',
  '/video/1.mp4',
  '/video/2.mp4',
  '/video/3.mp4',
  '/video/4.mp4',
  '/video/5.mp4',
  '/video/6.mp4',
];



// 工具函数：计算从2023.10.27到现在的时间差（倒计时）
function getTimeArr() {
  // 设置纪念日日期（2023.10.27 18:30）- 直接使用本地时间
  const anniversary = new Date(2023, 9, 27, 18, 30, 0) // 月份是从0开始的，10月对应9
  // 获取当前时间
  const now = new Date()

  // 计算时间差（毫秒）
  const diffMs = now - anniversary

  // 转换为天、时、分、秒
  const oneDay = 24 * 60 * 60 * 1000
  const oneHour = 60 * 60 * 1000
  const oneMinute = 60 * 1000

  // 精确计算天数（包含起始日，因此加1）
  const days = Math.floor(diffMs / oneDay) + 1
  
  // 计算剩余毫秒数
  const remainingMs = diffMs % oneDay
  
  // 计算小时数 - 确保正确计算
  const hours = Math.floor(remainingMs / oneHour)
  const remainingAfterHours = remainingMs % oneHour

  const minutes = Math.floor(remainingAfterHours / oneMinute)
  const seconds = Math.floor((remainingAfterHours % oneMinute) / 1000)

  // 拆分天数为百位、十位和个位（支持三位数天数）
  const dayHundreds = Math.floor(days / 100)
  const dayTens = Math.floor((days % 100) / 10)
  const dayOnes = days % 10

  // 返回天、时、分、秒的数组形式
  return [
    dayHundreds,
    dayTens,
    dayOnes,
    ...toArr(hours),
    ...toArr(minutes),
    ...toArr(seconds)
  ]
}

// 更换数组类型
function toArr(n) {
  return n >= 10 ? ('' + n).split('').map(item => Number(item)) : [0, n]
}

export default {
  name: 'LoveFlipTimer',
  data() {
    return {
      isLoaded: false,
      loadedImages: 0,
      totalImages: 12, // 3列 * 4张图片
      scrollSpeed: 0.7,
      autoScrollSpeed: 0.7,   // 自动滚动速度
      scrollPosition: 0,
      column1Images: [],
      column2Images: [],
      column3Images: [],
      animationId: null,
      // 倒计时相关数据
      timeArr: getTimeArr(),
      isPlay: false,
      before0: -1,
      before1: -1,
      before2: -1,
      before3: -1,
      before4: -1,
      before5: -1,
      before6: -1,
      before7: -1,
      before8: -1,
      timer: null,
      // 当前图片索引（用于轮流显示）
      currentImageIndex: 0,
      // 起始日期显示
      startDate: '2023.10.27 18:30'
    };
  },
  mounted() {
      // 初始化图片库
      this.initializeGallery();
      
      // 开始倒计时
      this.startTimer();
      
      // 添加鼠标滚轮事件监听
      this.addWheelListeners();
      
      // 添加页面可见性变化监听
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    },
    beforeUnmount() {
      // 清理资源
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      // 清理计时器
      this.stopTimer();
      
      // 移除鼠标滚轮事件监听
      this.removeWheelListeners();
      
      // 移除页面可见性变化监听
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    },
  watch: {
    // 监听时间数组变化，更新翻页效果
    timeArr: {
      handler(newVal, oldVal) {
        if (!newVal || !oldVal) return;
        
        // 更新所有位置的before值
        for (let i = 0; i < 9; i++) {
          if (newVal[i] !== oldVal[i]) {
            this[`before${i}`] = oldVal[i];
          }
        }
        
        if (!this.isPlay) {
          this.isPlay = true;
        }
      },
      deep: true
    }
  },
  methods: {
    // 开始计时器
    startTimer() {
      this.timer = setTimeout(() => {
        this.stopTimer();
        const newTimeArr = getTimeArr();
        this.timeArr = newTimeArr;
        this.startTimer();
      }, 1000);
    },
    
    // 停止计时器
    stopTimer() {
      clearTimeout(this.timer);
    },



    // 初始化图片库
    initializeGallery() {
      // 为每列填充4张图片（轮流显示），总共12张
      for (let i = 0; i < 4; i++) {
        this.column1Images.push(this.getNextImage());
        this.column2Images.push(this.getNextImage());
        this.column3Images.push(this.getNextImage());
      }
    },
    
    // 限制每列最大显示项数并清理离开视口过远的元素
    manageColumnElements() {
      const maxItemsPerColumn = 12;
      const gallery = this.$refs.imagesGallery;
      
      if (!gallery) return;
      
      const galleryRect = gallery.getBoundingClientRect();
      const cleanupThreshold = galleryRect.bottom + 500; // 离开视口底部500px的元素将被移除
      
      // 处理每一列
      this.cleanupColumn(this.column1Images, 0, maxItemsPerColumn, cleanupThreshold);
      this.cleanupColumn(this.column2Images, 1, maxItemsPerColumn, cleanupThreshold);
      this.cleanupColumn(this.column3Images, 2, maxItemsPerColumn, cleanupThreshold);
    },
    
    // 清理特定列中离开视口过远的元素
    cleanupColumn(columnImages, columnIndex, maxItems, cleanupThreshold) {
      const columns = this.$el.querySelectorAll('.column');
      const column = columns[columnIndex];
      
      if (!column) return;
      
      // 获取列中的所有子元素容器
      const containers = column.querySelectorAll('div:not(.column)');
      const elementsToRemove = [];
      
      // 检查哪些元素需要移除
      containers.forEach((container, index) => {
        const rect = container.getBoundingClientRect();
        if (rect.bottom < cleanupThreshold && index < columnImages.length - maxItems) {
          elementsToRemove.push(index);
        }
      });
      
      // 移除离开视口过远的元素
      if (elementsToRemove.length > 0) {
        // 从后往前移除，避免索引变化问题
        elementsToRemove.sort((a, b) => b - a).forEach(index => {
          columnImages.splice(index, 1);
        });
      }
    },
    
    // 处理页面可见性变化
    handleVisibilityChange() {
      if (document.hidden) {
        // 页面不可见时暂停动画和计时器
        this.pauseAnimations();
      } else {
        // 页面可见时恢复动画和计时器
        this.resumeAnimations();
      }
    },
    
    // 暂停动画和计时器
    pauseAnimations() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      
      this.stopTimer();
      
      // 暂停所有视频
      const videos = this.$el.querySelectorAll('video');
      videos.forEach(video => {
        if (!video.paused) {
          video.pause();
        }
      });
    },
    
    // 恢复动画和计时器
    resumeAnimations() {
      this.startTimer();
      if (this.isLoaded) {
        this.autoScroll();
      }
    },

    // 获取下一张图片（轮流显示）
    getNextImage() {
      const image = photoUrls[this.currentImageIndex];
      this.currentImageIndex = (this.currentImageIndex + 1) % photoUrls.length;
      return image;
    },

    // 获取图片URL - 添加图片处理参数，与HTML一致
    getImageUrl(img) {
      return img + '?x-oss-process=image/resize,p_20';
    },
    
    // 判断是否为视频文件
    isVideoFile(filePath) {
      const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm'];
      return videoExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
    },

    // 处理图片加载
    handleImageLoad() {
      this.loadedImages++;

      // 所有图片加载完成后，隐藏加载屏幕并开始自动滚动
      if (this.loadedImages === this.totalImages) {
        setTimeout(() => {
          this.isLoaded = true;
          this.autoScroll();
        }, 500);
      }
    },

    // 检查列是否触底
    checkColumns() {
      const columns = this.$el.querySelectorAll('.column');
      const maxItemsPerColumn = 12;
      
      columns.forEach((column, index) => {
        const rect = column.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.bottom < windowHeight + windowHeight / 2) {
          // 检查列是否未达到最大显示数量
          let currentColumnLength = 0;
          if (index === 0) currentColumnLength = this.column1Images.length;
          else if (index === 1) currentColumnLength = this.column2Images.length;
          else if (index === 2) currentColumnLength = this.column3Images.length;
          
          // 只有当列中的项目数小于最大值时才添加新图片
          if (currentColumnLength < maxItemsPerColumn) {
            if (index === 0) this.column1Images.push(this.getNextImage());
            else if (index === 1) this.column2Images.push(this.getNextImage());
            else if (index === 2) this.column3Images.push(this.getNextImage());
          }
        }
      });
    },

    // 处理鼠标滚轮事件，直接控制图片滚动的上下方向
    handleWheel(event) {
      // 阻止默认滚动行为
      event.preventDefault();
      
      // 定义滚动步长
      const scrollStep = 80; // 每次滚轮滚动的像素数
      
      // 滚轮向上滚动，页面向上移动（图片向下移动）
      // 滚轮向下滚动，页面向下移动（图片向上移动）
      const scrollDirection = event.deltaY > 0 ? 1 : -1;
      
      // 直接调整滚动位置
      this.scrollPosition += scrollStep * scrollDirection;
      
      // 确保滚动位置不会小于0
      this.scrollPosition = Math.max(0, this.scrollPosition);
      
      // 应用滚动位置
      const gallery = this.$refs.imagesGallery;
      if (gallery) {
        gallery.scrollTop = this.scrollPosition;
      }
      
      // 检查是否需要加载更多图片
      this.checkColumns();
    },
    
    // 获取视口中的媒体元素数量
    getVisibleMediaElements() {
      const gallery = this.$refs.imagesGallery;
      if (!gallery) return { images: 0, videos: 0 };
      
      let images = 0;
      let videos = 0;
      
      // 检查所有图片
      const imgElements = gallery.querySelectorAll('img');
      imgElements.forEach(img => {
        if (this.isElementInViewport(img)) {
          images++;
        }
      });
      
      // 检查所有视频
      const videoElements = gallery.querySelectorAll('video');
      videoElements.forEach(video => {
        if (this.isElementInViewport(video)) {
          videos++;
        }
      });
      
      return { images, videos };
    },
    
    // 检查元素是否在视口中
    isElementInViewport(element) {
      const rect = element.getBoundingClientRect();
      const gallery = this.$refs.imagesGallery;
      const galleryRect = gallery.getBoundingClientRect();
      
      return (
        rect.top >= galleryRect.top - 100 &&
        rect.bottom <= galleryRect.bottom + 100
      );
    },
    
    // 添加滚轮事件监听（兼容不同浏览器）
    addWheelListeners() {
      // 为图片库容器添加滚轮事件
      const gallery = this.$refs.imagesGallery;
      if (gallery) {
        gallery.addEventListener('wheel', this.handleWheel, { passive: false });
      }
      
      // 为整个窗口添加滚轮事件作为备用
      window.addEventListener('wheel', this.handleWheel, { passive: false });
    },
    
    // 移除滚轮事件监听
    removeWheelListeners() {
      const gallery = this.$refs.imagesGallery;
      if (gallery) {
        gallery.removeEventListener('wheel', this.handleWheel);
      }
      window.removeEventListener('wheel', this.handleWheel);
    },
    
    // 自动滚动
    autoScroll() {
      if (!this.isLoaded || document.hidden) return;

      this.checkColumns();
      // 定期清理离开视口过远的元素
      this.manageColumnElements();
      
      // 使用固定的自动滚动速度
      this.scrollPosition += this.autoScrollSpeed;
      const gallery = this.$refs.imagesGallery;
      if (gallery) {
        gallery.scrollTop = this.scrollPosition;
      }

      this.animationId = requestAnimationFrame(() => this.autoScroll());
    }
  }
};
</script>

<style scoped>
/* 基础样式 */
.love-flip-timer {
  position: relative;
  width: 100%;
  height: 100vh;
  font-family: 'romantic', sans-serif;
  overflow: hidden;
}

@font-face {
  font-family: 'romantic';
  src: url('@/assets/fonts/字语坊浪漫手写体.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

/* 加载屏幕 */
#loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  /* 纯白背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  color: black;
  z-index: 9999;
  transition: opacity 1s ease-out, visibility 1s ease-out;
}

#loading-screen.hidden {
  opacity: 0;
  visibility: hidden;
}



/* 覆盖层 */
.overlay-div {
  width: 100%;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgb(255, 255, 255);
  z-index: 2;
  text-align: center;
  vertical-align: middle;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.overlay-text {
  font-weight: bold;
  font-size: 5vw;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ff99cc, #ff8bc9, #f167f8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.start-date {
  font-size: 1.2vw;
  margin-top: 20px;
  background: #efefef;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* 翻页倒计时样式 */
.clock-container {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.time-section {
  display: flex;
  align-items: center;
  gap: 5px;
}

.unit {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 翻页组件样式 */
.flip {
  position: relative;
  margin: 5px;
  width: 60px;
  height: 90px;
  font-size: 80px;
  font-weight: bold;
  line-height: 87px;
  border-radius: 6px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3);
  .item {
    list-style: none;
    z-index: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    perspective: 200px;
    transition: opacity 0.3s;
    &.active {
      z-index: 2;
    }
    &:first-child {
      z-index: 2;
    }
    .up,
    .down {
      z-index: 1;
      position: absolute;
      left: 0;
      width: 100%;
      height: 50%;
      overflow: hidden;
    }
    .up {
      transform-origin: 50% 100%;
      top: 0;
      &:after {
        content: '';
        position: absolute;
        top: 43.5px;
        left: 0;
        z-index: 5;
        width: 100%;
        height: 3px;
        background-color: rgba(0, 0, 0, 0.2);
      }
    }
    .down {
      transform-origin: 50% 0%;
      bottom: 0;
      transition: opacity 0.3s;
    }
    .inn {
      position: absolute;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 200%;
      color: #333;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      text-align: center;
      background-color: #f5f5f5;
      border-radius: 6px;
    }
    .up .inn {
      top: 0;
    }
    .down .inn {
      bottom: 0;
    }
  }
}

.play {
  .item {
    &.before {
      z-index: 3;
    }
    &.active {
      animation: asd 0.5s 0.5s linear both;
      z-index: 2;
    }
    &.before .up {
      z-index: 2;
      animation: turn-up 0.5s linear both;
    }
    &.active .down {
      z-index: 2;
      animation: turn-down 0.5s 0.5s linear both;
    }
  }
}

@keyframes turn-down {
  0% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0deg);
  }
}

@keyframes turn-up {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-90deg);
  }
}

@keyframes asd {
  0% {
    z-index: 2;
  }
  5% {
    z-index: 4;
  }
  100% {
    z-index: 4;
  }
}

.play {
  .shadow {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 2;
  }
  .before .up .shadow {
    background: linear-gradient(rgba(255, 255, 255, 0.8) 0%, rgba(0, 0, 0, 0.3) 100%);
    animation: show 0.5s linear both;
  }
  .active .up .shadow {
    background: linear-gradient(rgba(255, 255, 255, 0.8) 0%, rgba(0, 0, 0, 0.3) 100%);
    animation: hide 0.5s 0.3s linear both;
  }
  .before .down .shadow {
    background: linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(255, 255, 255, 0.8) 100%);
    animation: show 0.5s linear both;
  }
  .active .down .shadow {
    background: linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(255, 255, 255, 0.8) 100%);
    animation: hide 0.5s 0.3s linear both;
  }
}

@keyframes show {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes hide {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* 背景和图片库 */
section {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

section::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.images-gallery {
  display: flex;
  align-items: flex-start;
  /* 让列的高度根据内容变化 */
  overflow: hidden;
  /* 隐藏滚动条 */
  height: 100vh;
}

.column {
  flex-grow: 1;
  width: 33.3333%;
}

.column:nth-child(odd) {
  padding-right: 0.1vw;
  padding-left: 0.1vw;
}

.column div {
  margin-top: 0.1vw;
  margin-bottom: 0.1vw;
}

.column img {
    width: 100%;
    display: block;
    transition: transform 0.3s ease;
  }

  .column img:hover {
    transform: scale(1.05);
  }
  
  .column video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: #000;
  }



/* 响应式设计 */
@media screen and (max-width: 768px) {
  .overlay-text {
    font-size: 7vw;
  }

  .fliptimer {
    height: 70px;
  }

  .fliptimer .rotor {
    font-size: 2.2rem;
    margin-right: 3px;
  }

  .fliptimer .rotor,
  .fliptimer .rotor-leaf,
  .fliptimer .rotor-leaf-front,
  .fliptimer .rotor-leaf-rear,
  .fliptimer .rotor-top,
  .fliptimer .rotor-bottom,
  .fliptimer .rotor:after {
    width: 30px;
  }

  .fliptimer .rotor-group {
    padding-right: 14px;
  }

  .fliptimer .rotor-group:last-child {
    padding-right: 0px;
  }

  .fliptimer .rotor-group-heading:before {
    font-size: 0.8rem;
    height: 20px;
    line-height: 20px;
  }

  .fliptimer .rotor-group:nth-child(n+2):nth-child(-n+3):before,
  .fliptimer .rotor-group:nth-child(n+2):nth-child(-n+3):after {
    left: 66px;
  }

  .fliptimer .rotor-group:nth-child(n+2):nth-child(-n+3):before {
    bottom: 13px;
    height: 8px;
    width: 8px;
  }

  .fliptimer .rotor-group:nth-child(n+2):nth-child(-n+3):after {
    bottom: 29px;
    height: 8px;
    width: 8px;
  }

  .fliptimer .rotor-leaf-front,
  .fliptimer .rotor-top {
    line-height: 50px;
  }

  .fliptimer .rotor-leaf,
  .fliptimer .rotor {
    height: 50px;
  }

  .fliptimer .rotor-leaf-front,
  .fliptimer .rotor-leaf-rear,
  .fliptimer .rotor-top,
  .fliptimer .rotor-bottom,
  .fliptimer .rotor:after {
    height: 25px;
  }
}

@media screen and (max-width: 576px) {
  .overlay-text {
    font-size: 8vw;
  }
}
</style>