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
    <!-- 绘制V动画Canvas -->
    <canvas v-if="!vAnimationCompleted" ref="drawVCanvas" class="draw-v-canvas"></canvas>
    <div v-if="!vAnimationCompleted" class="draw-v-instruction">请画出大写V打开信纸...</div>
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
        { text: "top5是奶茶店。", speaker: "我说", fontSize: '23px', marginTop: '-5px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "奶茶店？", speaker: "她很疑惑问", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "对，是我们第一次外出去买天官周边的古茗。", speaker: "我答道", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "哦~！那好像是你第一次发朋友圈", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "是啊，那可是我的第一次~你可要对我负责。", speaker: "我调皮说", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "咦~好好好。", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
      ],
      displayedTextLines: [],
      cursorInterval: null,
      // Canvas绘制V相关状态
      vAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      canvasContext: null,
      lineSegments: [],
      errorCount: 0 // 错误绘制计数
    }
  },
  mounted() {
    this.loadLoveFont()
    // 先初始化绘制V动画Canvas
    this.$nextTick(() => {
      this.initDrawVCanvas()
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
    // 初始化绘制V动画Canvas
    initDrawVCanvas() {
      const canvas = this.$refs.drawVCanvas
      if (!canvas) return

      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      this.canvasContext = canvas.getContext('2d')

      // 绘制初始覆盖层
      this.drawVOverlay()

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
    drawVOverlay() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawVCanvas
      if (!canvas) return
      
      const ctx = this.canvasContext

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 填充覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)' // 浅米色半透明
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制淡色V作为视觉提示
      this.drawTemplateV()
    },

    // 绘制淡色V模板作为视觉提示
    drawTemplateV() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawVCanvas
      if (!canvas) return
      
      const ctx = this.canvasContext
      const centerX = canvas.width / 2 - canvas.width * 0.25
      const centerY = canvas.height / 2
      const vSize = Math.min(canvas.width, canvas.height) * 0.6

      // 设置虚线样式
      ctx.setLineDash([10, 5])
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)' // 淡棕色虚线
      ctx.lineWidth = 4
      ctx.lineCap = 'round'

      // 绘制虚线V
      ctx.beginPath()
      
      // V的顶点在底部
      const vertexY = centerY + vSize / 3
      
      // 左侧斜线
      ctx.moveTo(centerX - vSize / 3, centerY - vSize / 3)
      ctx.lineTo(centerX, vertexY)
      
      // 右侧斜线
      ctx.moveTo(centerX, vertexY)
      ctx.lineTo(centerX + vSize / 3, centerY - vSize / 3)

      ctx.stroke()

      // 重置线条样式
      ctx.setLineDash([])
    },

    // 绘制用户当前的笔画
    drawUserPath() {
      if (!this.canvasContext || this.drawingPath.length < 2) return

      const ctx = this.canvasContext

      // 重绘覆盖层（会自动包含淡色V模板）
      this.drawVOverlay()

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

      // 绘制已完成的线段
      this.lineSegments.forEach(segment => {
        ctx.beginPath()
        ctx.moveTo(segment.start.x, segment.start.y)
        ctx.lineTo(segment.end.x, segment.end.y)
        ctx.strokeStyle = '#8b4513'
        ctx.lineWidth = 5
        ctx.stroke()
      })
    },

    // 简化的V形状判断方法，更容易识别
    analyzeVShape() {
      // 降低点数量要求，确保V形状顶点在底部
      if (this.lineSegments.length < 1) return false

      // 对于单条线段的V形状检测（用户可能一次性画出V）
      if (this.lineSegments.length === 1) {
        // 检查是否有明显的转折点（V的底部顶点）
        const hasVertex = this.drawingPath.some((point, index) => {
          if (index > 0 && index < this.drawingPath.length - 1) {
            const prevPoint = this.drawingPath[index - 1]
            const nextPoint = this.drawingPath[index + 1]

            // 简化的转折点检测：特别关注向下的顶点（V的底部）
            if (point.y > prevPoint.y && point.y > nextPoint.y) {
              return true // 向下的顶点（V的底部）
            }
            return false
          }
          return false
        })

        // 简化的上下趋势检测
        let hasUpDownPattern = false
        let minY = Infinity
        let maxY = -Infinity
        
        // 找到最高点和最低点
        this.drawingPath.forEach(point => {
          minY = Math.min(minY, point.y)
          maxY = Math.max(maxY, point.y)
        })
        
        // 只要路径有一定的垂直高度变化，就认为可能有V形状
        const heightDiff = maxY - minY
        if (heightDiff > Math.min(window.innerHeight, window.innerWidth) * 0.1) {
          hasUpDownPattern = true
        }

        // 放宽条件：优先检测有向下顶点的情况，更符合正V形状
        return hasVertex || hasUpDownPattern
      }

      // 对于两条线段的情况，简化判断，优先检测V形底部
      if (this.lineSegments.length >= 1) {
        // 简单检查：只要有线段有一定的长度和垂直变化，就认为可能是V的一部分
        const hasValidSegments = this.lineSegments.some(segment => {
          const dy = segment.end.y - segment.start.y
          const dx = segment.end.x - segment.start.x
          const length = Math.sqrt(dx * dx + dy * dy)
          
          // 线段需要有一定长度，并且有明显的垂直变化，更倾向于检测V形底部
          return length > Math.min(window.innerHeight, window.innerWidth) * 0.1 && 
                 Math.abs(dy) > Math.abs(dx) * 0.3
        })
        
        if (hasValidSegments) {
          return true
        }
      }

      return false
    },

    // 完成绘制V动画
    completeDrawVAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.drawVCanvas
      if (canvas) {
        // 先绘制完成的V动画
        this.drawCompletedV()

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
        const instruction = document.querySelector('.draw-v-instruction')
        if (instruction) {
          instruction.style.transition = 'opacity 0.8s ease-out'
          instruction.style.opacity = '0'
        }
      }

      // 延迟设置lAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.vAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },

    // 绘制完成的V效果
    drawCompletedV() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawVCanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2 - canvas.width * 0.25
      const centerY = canvas.height / 2
      const vSize = Math.min(canvas.width, canvas.height) * 0.6

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 保持原覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制完成的V
      ctx.beginPath()
      
      // V的顶点在底部
      const vertexY = centerY + vSize / 3
      
      // 左侧斜线
      ctx.moveTo(centerX - vSize / 3, centerY - vSize / 3)
      ctx.lineTo(centerX, vertexY)
      
      // 右侧斜线
      ctx.moveTo(centerX, vertexY)
      ctx.lineTo(centerX + vSize / 3, centerY - vSize / 3)

      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 8
      ctx.stroke()
    },

    // 鼠标事件处理
    handleMouseDown(event) {
      this.isDrawing = true
      this.drawingPath = [{ x: event.clientX - 840, y: event.clientY - 20}]
    },

    handleMouseMove(event) {
      if (this.isDrawing) {
        this.drawingPath.push({ x: event.clientX - 840, y: event.clientY - 20})
        this.drawUserPath()
      }
    },

    handleMouseUp() {
      if (this.isDrawing && this.drawingPath.length > 5) {
        // 保存完成的线段
        const startPoint = this.drawingPath[0]
        const endPoint = this.drawingPath[this.drawingPath.length - 1]

        this.lineSegments.push({ start: startPoint, end: endPoint })

        // 分析是否形成V形状
        if (this.analyzeVShape()) {
          // 形成V形状，完成动画
          this.completeDrawVAnimation()
        } else {
          // 增加错误计数
          this.errorCount++
          // 检查是否错误3次
          if (this.errorCount >= 3) {
            // 错误3次，直接成功
            this.completeDrawVAnimation()
          } else if (this.lineSegments.length > 2) {
            // 如果画了太多线条但没形成L，重置部分线条
            this.lineSegments = this.lineSegments.slice(-1) // 保留最近的一条线段
            this.drawUserPath()
          } else {
            // 继续绘制
            this.drawingPath = []
          }
        }
      } else {
        // 清除太短的路径
        this.drawingPath = []
        this.drawVOverlay()
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
  background-image: url('../../assets/letters/letter-6.png');
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

/* 绘制V动画样式 */
.draw-v-canvas {
  position: fixed;
  top: 0;
  left: 50%;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: grab;
  pointer-events: all;
}

.draw-v-canvas:active {
  cursor: grabbing;
}

.draw-v-instruction {
  position: fixed;
  top: 30%;
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