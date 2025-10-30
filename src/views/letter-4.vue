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
    <div v-if="!tearAnimationCompleted" class="tear-instruction">向右拉动鼠标撕开信纸...</div>
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
        { text: "top7是你亲手做的礼物。特别是那束花。", speaker: "我说", fontSize: '23px', marginTop: '15px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "我不会在做那个花了，真麻烦。", speaker: "她说", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "我很喜欢你做的那些礼物，都说那是把自己的时间转换成思念，你的情绪、念想与爱的具象化。", speaker: "我答道", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "没事，我能用那个花你的钱哈哈哈哈哈哈。", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
      ],
      displayedTextLines: [],
      cursorInterval: null,
      // Canvas撕拉动画相关状态
      tearAnimationCompleted: false,
      isTearing: false,
      startX: 0,
      currentX: 0,
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

        // 添加一些随机波动来模拟撕纸的不规则边缘，但确保基本位置在鼠标位置
        const baseX = this.currentX // 使用鼠标当前位置作为基准
        for (let y = 0; y <= canvas.height; y += 10) {
          // 减小随机偏移，让撕拉痕迹更贴近鼠标位置
          const randomOffset = Math.sin(y * 0.01) * 8 + Math.random() * 6 - 3
          const x = baseX + randomOffset
          ctx.lineTo(x, y)
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(canvas.width, 0)
        ctx.closePath()

        // 设置渐变效果模拟纸张厚度
        const gradient = ctx.createLinearGradient(baseX, 0, baseX + 20, 0)
        gradient.addColorStop(0, 'rgba(255, 245, 238, 0.95)')
        gradient.addColorStop(1, 'rgba(255, 245, 238, 0.4)')
        ctx.fillStyle = gradient
        ctx.fill()

        // 绘制撕裂痕迹
        ctx.strokeStyle = 'rgba(200, 190, 180, 0.5)'
        ctx.lineWidth = 2
        ctx.stroke()

        // 检查是否完成撕裂
        if (baseX > canvas.width * 0.8) {
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
      this.startX = event.clientX
      this.currentX = event.clientX
    },

    handleMouseMove(event) {
      if (this.isTearing) {
        // 只允许向右拉动
        const newX = Math.max(this.startX, event.clientX)
        if (newX > this.currentX) {
          this.currentX = newX
          this.drawTearEffect()
        }
      }
    },

    handleMouseUp() {
      if (this.isTearing) {
        // 如果拉动距离不够，重置
        if (this.currentX - this.startX < 100) {
          this.currentX = this.startX
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
  background-image: url('../assets/letters/letter-4.png');
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
  top: 50%;
  left: 50%;
  transform: translateY(-50%);
  z-index: 11;
  font-family: 'Write', cursive, 'Microsoft YaHei', sans-serif;
  font-size: 20px;
  color: #8b4513;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  opacity: 0.8;
  animation: fadeInOut 2s infinite;
  pointer-events: none;
  writing-mode: vertical-rl;
  text-orientation: upright;
  display: inline-block;
}

@keyframes fadeInOut {

  0%,
  100% {
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