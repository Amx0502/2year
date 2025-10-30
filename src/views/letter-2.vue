<template>
  <div class="envelope-container">
    <div class="letter-container">
      <div class="letter-content">
        <div class="dialogue-wrapper" ref="dialogueRef">
          <div v-for="(line, index) in displayedTextLines" :key="index" class="dialogue-line"
            :class="{ 'she': line.speaker === 'she', 'me': line.speaker === 'me' }"
            :style="{ fontSize: line.fontSize, marginTop: line.marginTop, marginBottom: line.marginBottom, paddingLeft: line.paddingLeft, paddingRight: line.paddingRight }">
            <div v-if="line.speaker" class="speaker">{{ line.speaker }}：</div>
            <span class="text">{{ line.text }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 纸撕拉动画Canvas -->
    <canvas v-if="!tearAnimationCompleted" ref="tearCanvas" class="tear-canvas"></canvas>
    <div v-if="!tearAnimationCompleted" class="tear-instruction">向下拉动鼠标撕开信纸...</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isTyping: false,
      currentLineIndex: 0,
      currentCharIndex: 0,
      textProgress: 0,
      displaySpeed: 30, // 打字速度（毫秒）
      lineDelay: 500, // 行间隔延迟（毫秒）
      cursorBlinkSpeed: 500, // 光标闪烁速度（毫秒）
      showCursor: false,
      fontLoaded: false,
      textLines: [
        { text: "确实。那top9呢？", speaker: "她答道", fontSize: '23px', marginTop: '15px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "top9是汽车站。", speaker: "我说", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "你当时来汽车站接我是我没想到的，我以为只是在学校门口。", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "小事更能体现我对你的重视。", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "那你说哪里印象深刻？", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "在去接你的路上，我满脑子想的是你见到我时的模样，期待", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "伴随着心中的澎湃，直至", fontSize: '23px', marginTop: '-10px', marginBottom: '10px', paddingLeft: '114px', paddingRight: '0px' },
        { text: "遇见你的那一刻。", fontSize: '23px', marginTop: '-10px', marginBottom: '10px', paddingLeft: '114px', paddingRight: '0px' },
      ],
      displayedTextLines: [],
      cursorInterval: null,
      // Canvas撕拉动画相关状态
      tearAnimationCompleted: false,
      isTearing: false,
      startY: 0,
      currentY: 0,
      tearPath: [],
      canvasContext: null
    }
  },
  mounted() {
    this.loadLoveFont()
    // 先初始化撕拉动画Canvas
    this.$nextTick(() => {
      this.initTearCanvas()
    })
  },
  beforeDestroy() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer)
    }
  },
  methods: {
    loadLoveFont() {
      // 加载Love字体
      const font = new FontFace('Write', `url(${require('@/assets/fonts/谦度手写楷体.ttf')})`)
      font.load().then((loadedFont) => {
        document.fonts.add(loadedFont)
        this.fontLoaded = true
      }).catch((error) => {
        console.error('字体加载失败:', error)
        // 降级使用系统字体
        this.fontLoaded = true
      })
    },
    // 初始化撕拉动画Canvas
    initTearCanvas() {
      const canvas = this.$refs.tearCanvas
      if (!canvas) return
      
      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      this.canvasContext = canvas.getContext('2d')
      
      // 绘制初始覆盖层
      this.drawTearEffect()
      
      // 绑定鼠标事件
      canvas.addEventListener('mousedown', this.handleMouseDown)
      canvas.addEventListener('mousemove', this.handleMouseMove)
      canvas.addEventListener('mouseup', this.handleMouseUp)
      canvas.addEventListener('mouseleave', this.handleMouseUp)
      
      // 绑定触摸事件（移动端支持）
      canvas.addEventListener('touchstart', this.handleTouchStart)
      canvas.addEventListener('touchmove', this.handleTouchMove)
      canvas.addEventListener('touchend', this.handleTouchEnd)
    },
    
    // 绘制撕拉效果
    drawTearEffect() {
      if (!this.canvasContext) return
      
      const canvas = this.$refs.tearCanvas
      const ctx = this.canvasContext
      
      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 填充覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)' // 浅米色半透明
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      if (this.isTearing) {
        // 创建撕拉效果路径
      ctx.beginPath()
      ctx.moveTo(0, 0)
      
      // 添加一些随机波动来模拟撕纸的不规则边缘
      const baseY = Math.max(this.currentY, canvas.height * 0.2) // 限制最小撕裂高度
        for (let x = 0; x <= canvas.width; x += 10) {
          const randomOffset = Math.sin(x * 0.01 + this.currentY * 0.001) * 15 + 
                             Math.random() * 10 - 5
          const y = baseY + randomOffset
          ctx.lineTo(x, y)
      }
      
      ctx.lineTo(canvas.width, 0)
      ctx.lineTo(0, 0)
      ctx.closePath()
      
      // 设置渐变效果模拟纸张厚度
      const gradient = ctx.createLinearGradient(0, baseY, 0, baseY + 20)
      gradient.addColorStop(0, 'rgba(255, 245, 238, 0.95)')
      gradient.addColorStop(1, 'rgba(255, 245, 238, 0.4)')
        ctx.fillStyle = gradient
        ctx.fill()
        
        // 绘制撕裂痕迹
        ctx.strokeStyle = 'rgba(200, 190, 180, 0.5)'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // 检查是否完成撕裂
      if (baseY > canvas.height * 0.8) {
        this.completeTearAnimation()
      }
      }
    },
    
    // 完成撕拉动画
    completeTearAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.tearCanvas
      if (canvas) {
        // 设置Canvas的过渡效果
        canvas.style.transition = 'opacity 0.8s ease-out'
        canvas.style.opacity = '0'
        
        // 移除事件监听器
        canvas.removeEventListener('mousedown', this.handleMouseDown)
        canvas.removeEventListener('mousemove', this.handleMouseMove)
        canvas.removeEventListener('mouseup', this.handleMouseUp)
        canvas.removeEventListener('mouseleave', this.handleMouseUp)
        canvas.removeEventListener('touchstart', this.handleTouchStart)
        canvas.removeEventListener('touchmove', this.handleTouchMove)
        canvas.removeEventListener('touchend', this.handleTouchEnd)
        
        // 获取撕拉提示文字元素并添加过渡效果
        const instruction = document.querySelector('.tear-instruction')
        if (instruction) {
          instruction.style.transition = 'opacity 0.8s ease-out'
          instruction.style.opacity = '0'
        }
      }
      
      // 延迟设置tearAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.tearAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },
    
    // 鼠标事件处理
    handleMouseDown(event) {
      this.isTearing = true
      this.startY = event.clientY
      this.currentY = event.clientY
    },
    
    handleMouseMove(event) {
      if (this.isTearing) {
        // 只允许向下拉动
        const newY = Math.max(this.startY, event.clientY)
        if (newY > this.currentY) {
          this.currentY = newY
          this.drawTearEffect()
        }
      }
    },
    
    handleMouseUp() {
      if (this.isTearing) {
        // 如果拉动距离不够，重置
        if (this.currentY - this.startY < 100) {
          this.currentY = this.startY
          this.drawTearEffect()
        }
        this.isTearing = false
      }
    },
    
    // 触摸事件处理（移动端支持）
    handleTouchStart(event) {
      event.preventDefault()
      const touch = event.touches[0]
      this.handleMouseDown(touch)
    },
    
    handleTouchMove(event) {
      event.preventDefault()
      const touch = event.touches[0]
      this.handleMouseMove(touch)
    },
    
    handleTouchEnd() {
      this.handleMouseUp()
    },
    startTypingAnimation() {
      if (this.currentLineIndex >= this.textLines.length) {
        this.isTyping = false
        return
      }

      this.isTyping = true
      const currentLine = this.textLines[this.currentLineIndex]

      if (!this.displayedTextLines[this.currentLineIndex]) {
        // 复制所有属性，包括样式属性
        this.displayedTextLines.push({
          ...currentLine,
          text: '',
          fontSize: currentLine.fontSize,
          marginTop: currentLine.marginTop,
          marginBottom: currentLine.marginBottom,
          paddingLeft: currentLine.paddingLeft,
          paddingRight: currentLine.paddingRight
        })
      }

      if (this.currentCharIndex < currentLine.text.length) {
        // 逐字显示当前行文本
        this.displayedTextLines[this.currentLineIndex].text = currentLine.text.substring(0, this.currentCharIndex + 1)
        this.currentCharIndex++

        // 继续下一个字符
        this.typingTimer = setTimeout(() => this.startTypingAnimation(), this.displaySpeed)
      } else {
        // 当前行文本显示完成，准备下一行
        this.currentLineIndex++
        this.currentCharIndex = 0

        // 行间隔延迟
        this.typingTimer = setTimeout(() => this.startTypingAnimation(), this.lineDelay)
      }
    }
  }
}
</script>

<style scoped>
.envelope-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  margin-bottom: 50px;
  background-image: url('../assets/letters/letter-2.png');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.letter-container {
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  background-color: transparent;
  padding: 50px;
  overflow-y: auto;
  position: relative;
  text-align: left;
  display: block;
}

.letter-content {
  font-family: 'Write', cursive, 'Microsoft YaHei', sans-serif;
  color: #333;
}

.dialogue-wrapper {
  line-height: 1.8;
  font-size: 20px;
  height: auto;
  min-height: 100%;
}

.dialogue-line {
  margin-bottom: 20px;
  opacity: 0.95;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-start;
  word-break: break-word;
}

.dialogue-line:hover {
  opacity: 1;
}

.speaker {
  font-weight: bold;
  margin-right: 5px;
  min-width: 60px;
}

.text {
  flex: 1;
  white-space: pre-wrap;
}

.she {
  color: #e91e63;
}

.me {
  color: #1976d2;
}

/* 撕拉动画样式 */
.tear-canvas {
  position: fixed;
  top: 0;
  left: 50%;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: grab;
  pointer-events: all;
}

.tear-canvas:active {
  cursor: grabbing;
}

.tear-instruction {
  position: fixed;
  top: 50px;
  transform: translateX(-50%);
  z-index: 11;
  font-family: 'Write', cursive, 'Microsoft YaHei', sans-serif;
  font-size: 20px;
  color: #8b4513;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  opacity: 0.8;
  animation: fadeInOut 2s infinite;
  pointer-events: none;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
}

/* 滚动条样式 */
.letter-container::-webkit-scrollbar {
  width: 8px;
}

.letter-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.letter-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.letter-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .letter-container {
    width: 90%;
    padding: 20px;
  }

  .dialogue-wrapper {
    font-size: 18px;
  }
}
</style>