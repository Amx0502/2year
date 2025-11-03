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
    <!-- 绘制L动画Canvas -->
    <canvas v-if="!lAnimationCompleted" ref="tearCanvas" class="tear-canvas"></canvas>
    <div v-if="!lAnimationCompleted" class="tear-instruction">请画出大写L打开信纸...</div>
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
      // Canvas绘制L相关状态
      lAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      canvasContext: null,
      lineSegments: [],
      errorCount: 0 // 错误绘制计数
    }
  },
  mounted() {
    this.loadLoveFont()
    // 先初始化绘制L动画Canvas
    this.$nextTick(() => {
      this.initDrawLCanvas()
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
    // 初始化绘制L动画Canvas
    initDrawLCanvas() {
      const canvas = this.$refs.tearCanvas
      if (!canvas) return

      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      this.canvasContext = canvas.getContext('2d')

      // 绘制初始覆盖层
      this.drawLOverlay()

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

    // 绘制初始覆盖层
    drawLOverlay() {
      if (!this.canvasContext) return

      const canvas = this.$refs.tearCanvas
      const ctx = this.canvasContext

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 填充覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)' // 浅米色半透明
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制淡色L作为视觉提示
      this.drawTemplateL()
    },

    // 绘制淡色L模板作为视觉提示
    drawTemplateL() {
      if (!this.canvasContext) return

      const canvas = this.$refs.tearCanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2 - canvas.width * 0.25
      const centerY = canvas.height / 2
      const lSize = Math.min(canvas.width, canvas.height) * 0.6

      // 设置虚线样式
      ctx.setLineDash([10, 5])
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)' // 淡棕色虚线
      ctx.lineWidth = 4
      ctx.lineCap = 'round'

      // 绘制虚线L
      ctx.beginPath()

      // 竖线（从上到下）
      ctx.moveTo(centerX - lSize / 4, centerY - lSize / 2)
      ctx.lineTo(centerX - lSize / 4, centerY + lSize / 2)

      // 横线（从左到右）
      ctx.moveTo(centerX - lSize / 4, centerY + lSize / 2)
      ctx.lineTo(centerX + lSize / 4, centerY + lSize / 2)

      ctx.stroke()

      // 重置线条样式
      ctx.setLineDash([])
    },

    // 绘制用户当前的笔画
    drawUserPath() {
      if (!this.canvasContext || this.drawingPath.length < 2) return

      const ctx = this.canvasContext

      // 重绘覆盖层（会自动包含淡色L模板）
      this.drawLOverlay()

      // 绘制用户笔画
      ctx.beginPath()
      ctx.moveTo(this.drawingPath[0].x, this.drawingPath[0].y)

      for (let i = 1; i < this.drawingPath.length; i++) {
        ctx.lineTo(this.drawingPath[i].x, this.drawingPath[i].y)
      }

      ctx.strokeStyle = '#8b4513' // 棕色线条
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    },

    // 分析笔画是否形成L形状
    analyzeLShape() {
      if (this.lineSegments.length < 1) return false

      // 简单的L形状检测：寻找一条竖线和一条横线的组合
      const validLines = this.lineSegments.filter(segment => {
        // 只考虑有足够长度的线段
        const dx = segment.end.x - segment.start.x
        const dy = segment.end.y - segment.start.y
        const length = Math.sqrt(dx * dx + dy * dy)
        return length > Math.min(window.innerWidth, window.innerHeight) * 0.15
      })

      if (validLines.length < 1) return false

      // 检查是否有竖线和横线的组合
      let hasVertical = false
      let hasHorizontal = false

      validLines.forEach(segment => {
        const dx = segment.end.x - segment.start.x
        const dy = segment.end.y - segment.start.y

        // 判断是否为竖线（dy > dx * 2）
        if (Math.abs(dy) > Math.abs(dx) * 2) {
          hasVertical = true
        }
        // 判断是否为横线（dx > dy * 2）
        if (Math.abs(dx) > Math.abs(dy) * 2) {
          hasHorizontal = true
        }
      })

      // 对于L形状，可以是一条线段形成的近似L（带有转折点）
      if (this.lineSegments.length === 1) {
        const segment = this.lineSegments[0]
        const dx = segment.end.x - segment.start.x
        const dy = segment.end.y - segment.start.y

        // 检查是否有明显的转折点
        const hasCorner = this.drawingPath.some((point, index) => {
          if (index > 0 && index < this.drawingPath.length - 1) {
            const prevPoint = this.drawingPath[index - 1]
            const nextPoint = this.drawingPath[index + 1]

            const angle1 = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x)
            const angle2 = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x)

            const angleDiff = Math.abs(angle1 - angle2)
            // 检查角度变化是否接近90度（允许一定误差）
            return angleDiff > Math.PI / 3 && angleDiff < 2 * Math.PI / 3
          }
          return false
        })

        // 如果有转折点，并且线段既有水平又有垂直分量，也视为L
        if (hasCorner && Math.abs(dx) > 50 && Math.abs(dy) > 50) {
          return true
        }
      }

      // 需要同时满足竖线和横线条件（对于两条线段的情况）
      return hasVertical && hasHorizontal
    },

    // 完成绘制L动画
    completeDrawLAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.tearCanvas
      if (canvas) {
        // 先绘制完成的L动画
        this.drawCompletedL()

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

        // 获取提示文字元素并添加过渡效果
        const instruction = document.querySelector('.tear-instruction')
        if (instruction) {
          instruction.style.transition = 'opacity 0.8s ease-out'
          instruction.style.opacity = '0'
        }
      }

      // 延迟设置lAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.lAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },

    // 绘制完成的L效果
    drawCompletedL() {
      if (!this.canvasContext) return

      const canvas = this.$refs.tearCanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2 - canvas.width * 0.25
      const centerY = canvas.height / 2
      const lSize = Math.min(canvas.width, canvas.height) * 0.6

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 保持原覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制完成的L
      ctx.beginPath()

      // 竖线（从上到下）
      ctx.moveTo(centerX - lSize / 4, centerY - lSize / 2)
      ctx.lineTo(centerX - lSize / 4, centerY + lSize / 2)

      // 横线（从左到右）
      ctx.moveTo(centerX - lSize / 4, centerY + lSize / 2)
      ctx.lineTo(centerX + lSize / 4, centerY + lSize / 2)

      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 8
      ctx.stroke()
    },

    // 鼠标事件处理
    handleMouseDown(event) {
      this.isDrawing = true
      this.drawingPath = [{ x: event.clientX - 830, y: event.clientY - 20 }]
    },

    handleMouseMove(event) {
      if (this.isDrawing) {
        this.drawingPath.push({ x: event.clientX - 830, y: event.clientY - 20 })
        this.drawUserPath()
      }
    },

    handleMouseUp() {
      if (this.isDrawing && this.drawingPath.length > 5) {
        // 分析是否形成L形状
        if (this.analyzeLShape()) {
          // 形成L形状，完成动画
          this.completeDrawLAnimation()
        } else {
          // 增加错误计数
          this.errorCount++
          // 检查是否错误3次
          if (this.errorCount >= 3) {
            // 错误3次，直接成功
            this.completeDrawLAnimation()
          } else {
            // 继续绘制
            this.drawingPath = []
          }
        }
      } else {
        // 清除太短的路径
        this.drawingPath = []
        this.drawLOverlay()
      }

      this.isDrawing = false
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
  background-image: url('../../assets/letters/letter-4.png');
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
  writing-mode: horizontal-tb;
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
  left: 95%;
  top: 50%;
  transform: translate(-95%, -50%);
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