<template>
  <transition name="fade-out">
    <div class="start-overlay" v-if="isLoading" @click="startFlipAnimation">
      <div class="content-container">
      <!-- 上方艺术字 - 水墨晕开+溶解效果 -->
      <div class="ink-text-container">
        <div class="ink-text top-text" :class="{ 'show': showTopText }">
          <span v-for="(char, index) in 'XAM LOVE ZSY'" :key="index" 
                class="char" 
                :style="{ animationDelay: index * 0.15 + 's' }">
            {{ char }}
          </span>
        </div>
        <!-- 溶解粒子效果 -->
        <div class="dissolve-particles" :class="{ 'show': showTopText }">
          <span v-for="i in 30" :key="i" class="particle" :style="getParticleStyle(i, 'top')"></span>
        </div>
        <div class="ink-blot ink-blot-1" :class="{ 'show': showTopText }"></div>
        <div class="ink-blot ink-blot-2" :class="{ 'show': showTopText }"></div>
        <div class="ink-blot ink-blot-3" :class="{ 'show': showTopText }"></div>
      </div>
      
      <!-- 中间加载动画 - X爱心Y -->
      <div class="loader-container">
        <!-- X -->
        <div class="loader loader-x">
          <svg viewBox="0 0 60 60">
            <path d="M10 10 L50 50 M50 10 L10 50"></path>
          </svg>
        </div>

        <div class="loader loader-heart">
          <svg viewBox="0 0 60 60">
            <path d="M30 50 C10 30, 5 20, 15 10 C25 0, 30 15, 30 20 C30 15, 35 0, 45 10 C55 20, 50 30, 30 50 Z"/>
          </svg>
        </div>

        <!-- Y -->
        <div class="loader loader-y">
          <svg viewBox="0 0 60 60">
            <path d="M10 10 L30 30 L50 10 M30 30 L30 50"></path>
          </svg>
        </div>
      </div>
      
      <!-- 下方艺术字 - 水墨晕开+溶解效果 -->
      <div class="ink-text-container">
        <div class="ink-text bottom-text" :class="{ 'show': showBottomText }">
          <span v-for="(char, index) in `I'm waiting`" :key="index" 
                class="char" 
                :style="{ animationDelay: (index * 0.1 + 1.5) + 's' }">
            {{ char }}
          </span>
        </div>
        <!-- 溶解粒子效果 -->
        <div class="dissolve-particles" :class="{ 'show': showBottomText }">
          <span v-for="i in 25" :key="i" class="particle" :style="getParticleStyle(i, 'bottom')"></span>
        </div>
        <div class="ink-blot ink-blot-4" :class="{ 'show': showBottomText }"></div>
        <div class="ink-blot ink-blot-5" :class="{ 'show': showBottomText }"></div>
      </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Start',
  data() {
    return {
      isLoading: true,
      showTopText: false,
      showBottomText: false,
      isFading: false
    }
  },
  mounted() {
    // 触发水墨入场动画
    setTimeout(() => {
      this.showTopText = true
    }, 300)
    
    setTimeout(() => {
      this.showBottomText = true
    }, 800)
  },
  methods: {
    startFlipAnimation() {
      // 淡出加载画面
      this.isFading = true

      // 等待淡出完成后通知父组件显示翻页容器
      setTimeout(() => {
        this.$emit('show-flipbook')
        this.isLoading = false
      }, 1000)
    },
    getParticleStyle(index, position) {
      const randomX = Math.random() * 100
      const randomY = Math.random() * 60 - 30
      const randomDelay = Math.random() * 0.8
      const randomSize = Math.random() * 4 + 2
      const baseDelay = position === 'top' ? 0 : 1.5
      
      return {
        left: randomX + '%',
        top: randomY + 'px',
        width: randomSize + 'px',
        height: randomSize + 'px',
        animationDelay: (baseDelay + randomDelay) + 's'
      }
    }
  }
}
</script>

<style scoped>
.start-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.content-container {
  text-align: center;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

/* 水墨文字容器 */
.ink-text-container {
  position: relative;
  display: inline-block;
}

/* 水墨文字样式 */
.ink-text {
  font-family: 'STKaiti', 'KaiTi', 'SimKaiti', 'Microsoft YaHei', serif;
  font-size: 52px;
  font-weight: bold;
  letter-spacing: 12px;
  color: #fff;
  text-shadow: 
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 20px rgba(255, 255, 255, 0.6),
    0 0 30px rgba(255, 255, 255, 0.4);
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  filter: blur(10px);
  transition: all 0.1s ease;
}

.ink-text.show {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

.ink-text .char {
  display: inline-block;
  opacity: 0;
  transform: scale(2) rotate(10deg);
  filter: blur(20px);
  animation: inkSpread 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes inkSpread {
  0% {
    opacity: 0;
    transform: scale(2) rotate(10deg);
    filter: blur(20px);
  }
  30% {
    opacity: 0.3;
    transform: scale(1.5) rotate(5deg);
    filter: blur(15px);
  }
  60% {
    opacity: 0.7;
    transform: scale(1.1) rotate(2deg);
    filter: blur(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    filter: blur(0);
  }
}

.bottom-text {
  font-size: 40px;
  letter-spacing: 8px;
}

/* 溶解粒子效果 */
.dissolve-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
}

.dissolve-particles.show {
  opacity: 1;
}

.dissolve-particles .particle {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  border-radius: 50%;
  opacity: 0;
  animation: dissolve 1.5s ease-out forwards;
}

@keyframes dissolve {
  0% {
    opacity: 0;
    transform: scale(0) translate(0, 0);
    filter: blur(0);
  }
  20% {
    opacity: 0.8;
    transform: scale(1.5) translate(var(--tx, 10px), var(--ty, -10px));
    filter: blur(1px);
  }
  50% {
    opacity: 0.5;
    transform: scale(2) translate(var(--tx2, 20px), var(--ty2, -20px));
    filter: blur(3px);
  }
  100% {
    opacity: 0;
    transform: scale(3) translate(var(--tx3, 40px), var(--ty3, -40px));
    filter: blur(8px);
  }
}

/* 水墨晕染斑点 */
.ink-blot {
  position: absolute;
  background: radial-gradient(ellipse at center, 
    rgba(255, 255, 255, 0.15) 0%, 
    rgba(255, 255, 255, 0.1) 30%, 
    rgba(255, 255, 255, 0.05) 60%, 
    transparent 100%);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}

.ink-blot.show {
  animation: blotSpread 2s ease-out forwards;
}

.ink-blot-1 {
  width: 120px;
  height: 80px;
  top: -20px;
  left: -40px;
  animation-delay: 0.2s;
}

.ink-blot-2 {
  width: 80px;
  height: 60px;
  top: 10px;
  right: -30px;
  animation-delay: 0.5s;
}

.ink-blot-3 {
  width: 60px;
  height: 40px;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  animation-delay: 0.8s;
}

.ink-blot-4 {
  width: 100px;
  height: 70px;
  top: -15px;
  left: -30px;
  animation-delay: 1.7s;
}

.ink-blot-5 {
  width: 70px;
  height: 50px;
  bottom: -5px;
  right: -20px;
  animation-delay: 2s;
}

@keyframes blotSpread {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
}

/* 加载动画容器 */
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
}

/* 通用 Loader 样式 */
.loader {
  --path: #fff;
  --dot: #ff69b4;
  --duration: 2.5s;
  width: 60px;
  height: 60px;
  position: relative;
}

.loader svg {
  width: 100%;
  height: 100%;
}

.loader path {
  fill: none;
  stroke: var(--path);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: draw var(--duration) ease-in-out infinite;
}

/* 小球 - 粉色发光 */
.loader::before,
.loader::after {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dot);
  position: absolute;
  box-shadow: 
    0 0 10px var(--dot),
    0 0 20px var(--dot),
    0 0 30px var(--dot),
    0 0 40px rgba(255, 105, 180, 0.5);
}

/* 第二个小球（拖尾感） */
.loader::after {
  animation-delay: -1.2s;
}

/* 路径绘制动画 */
@keyframes draw {
  0% {
    stroke-dashoffset: 200;
    opacity: 0.3;
  }
  50% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  100% {
    stroke-dashoffset: -200;
    opacity: 0.3;
  }
}

/* ===== X ===== */
.loader-x::before,
.loader-x::after {
  offset-path: path("M10 10 L50 50 M50 10 L10 50");
  animation: move linear infinite;
  animation-duration: var(--duration);
}

/* ===== 爱心 ===== */
.loader-heart::before,
.loader-heart::after {
  offset-path: path("M30 50 C10 30, 5 20, 15 10 C25 0, 30 15, 30 20 C30 15, 35 0, 45 10 C55 20, 50 30, 30 50 Z");
  animation: moveHeart ease-in-out infinite;
  animation-duration: var(--duration);
}

/* ===== Y ===== */
.loader-y::before,
.loader-y::after {
  offset-path: path("M10 10 L30 30 L50 10 M30 30 L30 50");
  animation: move linear infinite;
  animation-duration: var(--duration);
}

/* 动画 */
@keyframes move {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}

@keyframes moveHeart {
  0% {
    offset-distance: 0%;
    transform: scale(0.8);
  }
  50% {
    offset-distance: 100%;
    transform: scale(1.2);
  }
  100% {
    offset-distance: 0%;
    transform: scale(0.8);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .ink-text {
    font-size: 40px;
    letter-spacing: 8px;
  }
  
  .bottom-text {
    font-size: 32px;
    letter-spacing: 6px;
  }
  
  .content-container {
    gap: 30px;
  }
  
  .loader {
    width: 48px;
    height: 48px;
  }
  
  .loader-container {
    gap: 30px;
  }
  
  .ink-blot-1 {
    width: 90px;
    height: 60px;
  }
  
  .ink-blot-2 {
    width: 60px;
    height: 45px;
  }
  
  .ink-blot-3 {
    width: 45px;
    height: 30px;
  }
  
  .ink-blot-4 {
    width: 75px;
    height: 52px;
  }
  
  .ink-blot-5 {
    width: 52px;
    height: 37px;
  }
}

@media (max-width: 480px) {
  .ink-text {
    font-size: 32px;
    letter-spacing: 6px;
  }
  
  .bottom-text {
    font-size: 26px;
    letter-spacing: 4px;
  }
  
  .content-container {
    gap: 20px;
  }
  
  .loader {
    width: 40px;
    height: 40px;
  }
  
  .loader-container {
    gap: 20px;
  }
  
  .ink-blot-1 {
    width: 70px;
    height: 47px;
  }
  
  .ink-blot-2 {
    width: 47px;
    height: 35px;
  }
  
  .ink-blot-3 {
    width: 35px;
    height: 23px;
  }
  
  .ink-blot-4 {
    width: 58px;
    height: 40px;
  }
  
  .ink-blot-5 {
    width: 40px;
    height: 28px;
  }
}

/* 淡出过渡动画 */
.fade-out-enter-active,
.fade-out-leave-active {
  transition: opacity 1s ease;
}

.fade-out-enter,
.fade-out-leave-to {
  opacity: 0;
}
</style>
