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
    <!-- 绘制S动画Canvas -->
    <canvas v-if="!sAnimationCompleted" ref="drawSCanvas" class="draw-s-canvas"></canvas>
    <div v-if="!sAnimationCompleted" class="draw-s-instruction">请画出大写S打开信纸...</div>
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
      // Canvas绘制S相关状态
      sAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      canvasContext: null,
      lineSegments: [],
      errorCount: 0 // 错误绘制计数
    }
  },
  mounted() {
    this.loadLoveFont()
    // 先初始化绘制S动画Canvas
    this.$nextTick(() => {
      this.initDrawSCanvas()
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
    // 初始化绘制S动画Canvas
    initDrawSCanvas() {
      const canvas = this.$refs.drawSCanvas
      if (!canvas) return

      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      this.canvasContext = canvas.getContext('2d')

      // 绘制初始覆盖层
      this.drawSOverlay()

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
    drawSOverlay() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawSCanvas
      if (!canvas) return

      const ctx = this.canvasContext

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 填充覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)' // 浅米色半透明
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制淡色S作为视觉提示
      this.drawTemplateS()
    },

    // 绘制淡色S模板作为视觉提示
    drawTemplateS() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawSCanvas
      if (!canvas) return

      const ctx = this.canvasContext
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      // 调整宽高比例，符合大写S的视觉比例
      const sWidth = Math.min(canvas.width, canvas.height) * 0.4
      const sHeight = Math.min(canvas.width, canvas.height) * 0.6

      // 淡棕色样式
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)'
      ctx.lineWidth = 4
      ctx.lineCap = 'round' // 线条端点圆润，提升视觉效果
      ctx.beginPath()

      // 起始点：S右上角起始位置
      const startX = centerX + sWidth * 0.2
      const startY = centerY - sHeight * 0.6
      ctx.moveTo(startX, startY)

      // 上半部分曲线（向左上凸，形成S上半弧）
      ctx.quadraticCurveTo(
        centerX - sWidth * 0.5, centerY - sHeight * 0.4, // 控制点向左上方
        centerX - sWidth * - 0.001, centerY - sHeight * 0.1  // 终点在左侧偏上位置
      )

      // 下半部分曲线（向右下凸，形成S下半弧）
      ctx.quadraticCurveTo(
        centerX + sWidth * 0.6, centerY + sHeight * 0.3, // 控制点向右下方
        centerX + sWidth * -0.3, centerY + sHeight * 0.4  // 终点在右侧底部
      )

      ctx.stroke()
    },

    // 绘制用户当前的笔画
    drawUserPath() {
      if (!this.canvasContext) return

      const ctx = this.canvasContext
      // 重绘覆盖层（会自动包含淡色S模板）
      this.drawSOverlay()

      // 绘制历史线段（最多保留2条）- 保持原始路径不变
      this.lineSegments.forEach(segment => {
        ctx.beginPath()
        // 绘制完整的原始路径，而不仅仅是起点到终点的直线
        ctx.moveTo(segment.path[0].x, segment.path[0].y)
        for (let i = 1; i < segment.path.length; i++) {
          ctx.lineTo(segment.path[i].x, segment.path[i].y)
        }
        ctx.strokeStyle = '#8b4513'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
      })

      // 绘制当前正在绘制的路径
      if (this.drawingPath.length >= 2) {
        ctx.beginPath()
        ctx.moveTo(this.drawingPath[0].x, this.drawingPath[0].y)
        for (let i = 1; i < this.drawingPath.length; i++) {
          ctx.lineTo(this.drawingPath[i].x, this.drawingPath[i].y)
        }
        ctx.strokeStyle = '#8b4513'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
      }
    },

    // 简化的S形状判断方法，使其容易识别
    analyzeSShape() {
      // 简化版S形状判断：保留核心特征，移除冗余计算
      
      // 基础点数量检查
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

      // 宽高比基本检查
      if (width < height * 0.3 || width > height * 1.2) {
        return false
      }

      // 最小尺寸检查
      const minDimension = Math.min(window.innerWidth, window.innerHeight)
      if (height < minDimension * 0.05) {
        return false
      }

      let downCount = 0
      
      for (let i = 1; i < this.drawingPath.length; i++) {
        const diffY = this.drawingPath[i].y - this.drawingPath[i-1].y
        if (diffY > 5) downCount++  // 明显向下移动
      }
      
      // 需要既有向上又有向下的移动
      const hasUpDownMovement = downCount > 0
      
      // 2. 检查是否有左右分布（确保是横向的S）
      const leftHalfPoints = this.drawingPath.filter(p => p.x <= minX + width * 0.5)
      const rightHalfPoints = this.drawingPath.filter(p => p.x >= minX + width * 0.5)
      const hasLeftRightDistribution = leftHalfPoints.length > 0 && rightHalfPoints.length > 0
      
      // 3. 检查是否有上下分布
      const topHalfPoints = this.drawingPath.filter(p => p.y <= minY + height * 0.5)
      const bottomHalfPoints = this.drawingPath.filter(p => p.y >= maxY - height * 0.3)
      const hasTopBottomDistribution = topHalfPoints.length > 0 && bottomHalfPoints.length > 0
      
      // 综合判断：保留核心条件
      return hasUpDownMovement && hasLeftRightDistribution && hasTopBottomDistribution
    },

    // 完成绘制S动画
    completeDrawSAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.drawSCanvas
      if (canvas) {
        // 先绘制完成的S动画
        this.drawCompletedS()

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
        const instruction = document.querySelector('.draw-s-instruction')
        if (instruction) {
          instruction.style.transition = 'opacity 0.8s ease-out'
          instruction.style.opacity = '0'
        }
      }

      // 延迟设置sAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.sAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },

    // 绘制完成的S效果
    drawCompletedS() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawSCanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 保持原覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 使用二次贝塞尔曲线绘制大写字母S
      const sWidth = Math.min(canvas.width, canvas.height) * 0.4
      const sHeight = Math.min(canvas.width, canvas.height) * 0.6

      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 6
      ctx.lineCap = 'round' // 线条端点圆润，提升视觉效果
      ctx.beginPath()

      // 起始点：S右上角起始位置
      const startX = centerX + sWidth * 0.2
      const startY = centerY - sHeight * 0.6
      ctx.moveTo(startX, startY)

      // 上半部分曲线（向左上凸，形成S上半弧）
      ctx.quadraticCurveTo(
        centerX - sWidth * 0.5, centerY - sHeight * 0.4, // 控制点向左上方
        centerX - sWidth * - 0.001, centerY - sHeight * 0.1  // 终点在左侧偏上位置
      )

      // 下半部分曲线（向右下凸，形成S下半弧）
      ctx.quadraticCurveTo(
        centerX + sWidth * 0.6, centerY + sHeight * 0.3, // 控制点向右下方
        centerX + sWidth * -0.3, centerY + sHeight * 0.4  // 终点在右侧底部
      )

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
        // 保存完成的线段 - 保存完整的原始路径，不做任何改变
        const startPoint = this.drawingPath[0]
        const endPoint = this.drawingPath[this.drawingPath.length - 1]

        // 添加完整路径到线段数组，确保不会改变原始绘制
        this.lineSegments.push({
          start: startPoint,
          end: endPoint,
          path: [...this.drawingPath] // 保存完整的原始路径
        })

        // 只保留最近的2条线段
        if (this.lineSegments.length > 2) {
          this.lineSegments = this.lineSegments.slice(-2)
        }

        // 分析是否形成S形状
        if (this.analyzeSShape()) {
          // 形成S形状，完成动画
          this.completeDrawSAnimation()
        } else {
          // 增加错误计数
          this.errorCount++
          // 检查是否错误3次
          if (this.errorCount >= 3) {
            // 错误3次，直接成功
            this.completeDrawSAnimation()
          } else {
            // 清除当前路径，但保留历史线段
            this.drawingPath = []
            // 重新绘制用户路径（包含历史线段）
            this.drawUserPath()
          }
        }
      } else {
        // 清除太短的路径
        this.drawingPath = []
        // 重新绘制用户路径（包含历史线段）
        this.drawUserPath()
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
  background-image: url('../../assets/letters/letter-9.png');
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

/* 绘制S动画样式 */
.draw-s-canvas {
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: grab;
  pointer-events: all;
}

.draw-s-canvas:active {
  cursor: grabbing;
}

.draw-s-instruction {
  top: 5%;
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