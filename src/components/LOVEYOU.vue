<template>
  <div class="love-container" @click="generateMessages">
    <div class="central-text">我想你了</div>
    <div v-for="(message, index) in messages" :key="index" 
         class="floating-message"
         :style="{
           left: message.x + 'px',
           top: message.y + 'px',
           opacity: message.opacity,
           color: message.color,
           transform: `translate(-50%, -50%) scale(${message.scale})`,
           animationDelay: message.delay + 's',
           textShadow: `1px 1px 2px ${message.shadowColor}`
         }">
      我也想你了！
    </div>
  </div>
</template>

<script>
export default {
  name: 'LOVEYOU',
  data() {
    return {
      messages: [],
      // 恋爱主题颜色数组
      loveColors: [
        '#FF6B6B', '#FF8E8E', '#FF69B4', '#FF1493', '#DB7093',
        '#FFA07A', '#FF7F50', '#FF4500', '#FFD700', '#FFA500',
        '#FF6347', '#FFB6C1', '#FFC0CB', '#FFE4E1', '#FFB7C5'
      ]
    }
  },
  methods: {
    generateMessages() {
      // 清空之前的消息
      this.messages = [];
      
      // 生成随机位置的消息
      const count = 50; // 消息数量
      const container = this.$el;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      for (let i = 0; i < count; i++) {
        // 随机位置
        const x = Math.random() * containerWidth;
        const y = Math.random() * containerHeight;
        
        // 随机动画参数
        const opacity = 0.7 + Math.random() * 0.3; // 0.7-1.0的不透明度
        const scale = 0.5 + Math.random() * 0.5; // 0.5-1.0的缩放
        const delay = Math.random() * 0.5; // 0-0.5秒的延迟
        
        // 随机颜色
        const randomColorIndex = Math.floor(Math.random() * this.loveColors.length);
        const color = this.loveColors[randomColorIndex];
        
        // 生成对应的阴影颜色（稍微深一点）
        const shadowColor = this.darkenColor(color, 0.3);
        
        this.messages.push({ x, y, opacity, scale, delay, color, shadowColor });
        
        // 自动移除消息以避免DOM堆积
        setTimeout(() => {
          this.messages = this.messages.filter((msg, idx) => idx !== i);
        }, 3000 + Math.random() * 2000); // 3-5秒后移除
      }
    },
    // 将颜色调暗的辅助函数
    darkenColor(color, factor) {
      // 移除#号
      color = color.replace('#', '');
      
      // 解析RGB值
      let r = parseInt(color.substring(0, 2), 16);
      let g = parseInt(color.substring(2, 4), 16);
      let b = parseInt(color.substring(4, 6), 16);
      
      // 调暗颜色
      r = Math.floor(r * (1 - factor));
      g = Math.floor(g * (1 - factor));
      b = Math.floor(b * (1 - factor));
      
      // 确保值在有效范围内
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));
      
      // 转换回十六进制格式
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    }
  }
}
</script>

<style scoped>
.love-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  /* 恋爱主题渐变背景 */
  background: linear-gradient(135deg, #fff1f8 0%, #ffe8f0 50%, #ffd5e5 100%);
  cursor: pointer;
  overflow: hidden;
  /* 添加细微的动态效果 */
  animation: bgShift 10s ease-in-out infinite alternate;
}

/* 背景渐变动画 */
@keyframes bgShift {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.central-text {
  font-size: 48px;
  color: #FF6B6B;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
  transition: transform 0.3s ease, text-shadow 0.3s ease;
  /* 添加光晕效果 */
  filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.5));
}

.love-container:hover .central-text {
  transform: scale(1.1);
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.15);
  filter: drop-shadow(0 0 15px rgba(255, 107, 107, 0.7));
}

.floating-message {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  pointer-events: none;
  z-index: 2;
  animation: floatUp 3s ease-out forwards;
}

@keyframes floatUp {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -100px) scale(0.5);
    opacity: 0;
  }
}
</style>