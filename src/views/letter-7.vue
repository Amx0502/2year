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
    <!-- 绘制E动画Canvas -->
    <canvas v-if="!eAnimationCompleted" ref="drawECanvas" class="draw-e-canvas"></canvas>
    <div v-if="!eAnimationCompleted" class="draw-e-instruction">请画出大写E打开信纸...</div>
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
        { text: "top6是聊天。", speaker: "我说", fontSize: '23px', marginTop: '15px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "聊天？这有什么印象深刻的？", speaker: "她疑惑问", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "对话是交流的过程，是双方思想的碰撞，那瞬间比海过的烟花还要灿烂，我喜欢你找我分享，谈天说地从", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "清晨到傍晚，从细碎小事到决策大事。", fontSize: '23px', marginTop: '-10px', marginBottom: '0px', paddingLeft: '105px', paddingRight: '0px' },
        { text: "有句话怎么说来着，我想你就在，思绪万千汇聚成我的思念传达给你，哈哈哈哈哈哈有没有时不时打喷嚏。", speaker: "我想了想", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "好好好可能是有吧。", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
      ],
      displayedTextLines: [],
      cursorInterval: null,
      // Canvas绘制E相关状态
      eAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      canvasContext: null,
      lineSegments: []
    }
  },
  mounted() {
    this.loadLoveFont()
    // 先初始化绘制E动画Canvas
    this.$nextTick(() => {
      this.initDrawECanvas()
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
    // 初始化绘制E动画Canvas
    initDrawECanvas() {
      const canvas = this.$refs.drawECanvas
      if (!canvas) return

      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      this.canvasContext = canvas.getContext('2d')

      // 绘制初始覆盖层
      this.drawEOverlay()

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
    drawEOverlay() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawECanvas
      if (!canvas) return

      const ctx = this.canvasContext

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 填充覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)' // 浅米色半透明
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制淡色E作为视觉提示
      this.drawTemplateE()
    },

    // 绘制淡色E模板作为视觉提示
    drawTemplateE() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawECanvas
      if (!canvas) return

      const ctx = this.canvasContext
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const eWidth = Math.min(canvas.width, canvas.height) * 0.35
      const eHeight = eWidth * 1.5

      // E的起始位置
      const startX = centerX - eWidth / 2
      const startY = centerY - eHeight / 2

      // 设置虚线样式
      ctx.setLineDash([10, 5])
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)' // 淡棕色虚线
      ctx.lineWidth = 4
      ctx.lineCap = 'round'

      // 绘制虚线E
      ctx.beginPath()

      // 左边垂直线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX, startY + eHeight)

      // 顶部水平线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX + eWidth, startY)

      // 中间水平线
      ctx.moveTo(startX, startY + eHeight / 2)
      ctx.lineTo(startX + eWidth * 0.7, startY + eHeight / 2)

      // 底部水平线
      ctx.moveTo(startX, startY + eHeight)
      ctx.lineTo(startX + eWidth, startY + eHeight)

      ctx.stroke()

      // 重置线条样式
      ctx.setLineDash([])
    },

    // 绘制用户当前的笔画
    drawUserPath() {
      if (!this.canvasContext || this.drawingPath.length < 2) return

      const ctx = this.canvasContext

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

      // 不再绘制已保存的线段，避免连接起点和终点
    },

    // 极度简化的E形状判断方法，更容易识别
    analyzeEShape() {
      // 非常低的点数量要求
      if (this.drawingPath.length < 4) {
        return false
      }

      // 计算路径的边界框
      const xCoords = this.drawingPath.map(point => point.x)
      const yCoords = this.drawingPath.map(point => point.y)
      const minX = Math.min(...xCoords)
      const maxX = Math.max(...xCoords)
      const minY = Math.min(...yCoords)
      const maxY = Math.max(...yCoords)

      const width = maxX - minX
      const height = maxY - minY

      // 大幅放宽宽高比要求，只要大致有E的轮廓即可
      if (width < height * 0.2 || width > height * 1.2) {
        return false
      }

      // 降低尺寸要求
      const minDimension = Math.min(window.innerWidth, window.innerHeight)
      if (height < minDimension * 0.05) {
        return false
      }

      // 非常宽松的水平/垂直线判断
      let hasHorizontalComponent = false
      let hasVerticalComponent = false

      for (let i = 1; i < this.drawingPath.length; i++) {
        const prevPoint = this.drawingPath[i - 1]
        const currPoint = this.drawingPath[i]

        const dx = Math.abs(currPoint.x - prevPoint.x)
        const dy = Math.abs(currPoint.y - prevPoint.y)

        // 只要有任何水平或垂直趋势就算
        if (dx > dy * 1.5) {
          hasHorizontalComponent = true
        } else if (dy > dx * 1.5) {
          hasVerticalComponent = true
        }
      }

      // 极度简化：只要有水平和垂直的趋势，且尺寸足够，就认为是E
      return hasHorizontalComponent && hasVerticalComponent
    },

    // 完成绘制E动画
    completeDrawEAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.drawECanvas
      if (canvas) {
        // 先绘制完成的E动画
        this.drawCompletedE()

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
        const instruction = document.querySelector('.draw-e-instruction')
        if (instruction) {
          instruction.style.transition = 'opacity 0.8s ease-out'
          instruction.style.opacity = '0'
        }
      }

      // 延迟设置eAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.eAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },

    // 绘制完成的E效果
    drawCompletedE() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawECanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const eWidth = Math.min(canvas.width, canvas.height) * 0.35
      const eHeight = eWidth * 1.5

      // E的起始位置
      const startX = centerX - eWidth / 2
      const startY = centerY - eHeight / 2

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 保持原覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制完成的E
      ctx.beginPath()

      // 左边垂直线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX, startY + eHeight)

      // 顶部水平线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX + eWidth, startY)

      // 中间水平线
      ctx.moveTo(startX, startY + eHeight / 2)
      ctx.lineTo(startX + eWidth * 0.7, startY + eHeight / 2)

      // 底部水平线
      ctx.moveTo(startX, startY + eHeight)
      ctx.lineTo(startX + eWidth, startY + eHeight)

      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 8
      ctx.stroke()
    },

    // 鼠标事件处理
    handleMouseDown(event) {
      this.isDrawing = true
      this.drawingPath = [{ x: event.clientX + 250, y: event.clientY - 40 }]
    },

    handleMouseMove(event) {
      if (this.isDrawing) {
        this.drawingPath.push({ x: event.clientX + 250, y: event.clientY - 40 })
        this.drawUserPath()
      }
    },

    handleMouseUp() {
      if (this.isDrawing && this.drawingPath.length > 4) {
        // 分析是否形成E形状
        if (this.analyzeEShape()) {
          // 形成E形状，完成动画
          this.completeDrawEAnimation()
        } else {
          // 不保存线段，直接清除当前路径
          this.drawingPath = []
          // 重新绘制界面
          this.drawEOverlay()
        }
      } else {
        // 清除太短的路径
        this.drawingPath = []
        this.drawEOverlay()
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
  background-image: url('../assets/letters/letter-7.png');
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

/* 绘制E动画样式 */
.draw-e-canvas {
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: grab;
  pointer-events: all;
}

.draw-e-canvas:active {
  cursor: grabbing;
}

.draw-e-instruction {
  position: fixed;
  bottom: 50px;
  transform: translateX(-5%);
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