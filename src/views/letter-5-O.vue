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
    <!-- 绘制O动画Canvas -->
    <canvas v-if="!oAnimationCompleted" ref="drawOCanvas" class="draw-o-canvas"></canvas>
    <div v-if="!oAnimationCompleted" class="draw-o-instruction">请画出大写O打开信纸...</div>
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
      // Canvas绘制O相关状态
      oAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      canvasContext: null,
      lineSegments: [],
      errorCount: 0 // 错误绘制计数
    }
  },
  mounted() {
    this.loadLoveFont()
    // 先初始化绘制O动画Canvas
    this.$nextTick(() => {
      this.initDrawOCanvas()
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
    // 初始化绘制O动画Canvas
    initDrawOCanvas() {
      const canvas = this.$refs.drawOCanvas
      if (!canvas) return

      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      this.canvasContext = canvas.getContext('2d')

      // 绘制初始覆盖层
      this.drawOOverlay()

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
    drawOOverlay() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawOCanvas
      if (!canvas) return

      const ctx = this.canvasContext

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 填充覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)' // 浅米色半透明
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制淡色O作为视觉提示
      this.drawTemplateO()
    },

    // 绘制淡色O模板作为视觉提示
    drawTemplateO() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawOCanvas
      if (!canvas) return

      const ctx = this.canvasContext
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) * 0.25

      // 设置虚线样式
      ctx.setLineDash([10, 5])
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)' // 淡棕色虚线
      ctx.lineWidth = 4
      ctx.lineCap = 'round'

      // 绘制虚线O
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.stroke()

      // 重置线条样式
      ctx.setLineDash([])
    },

    // 绘制用户当前的笔画
    drawUserPath() {
      if (!this.canvasContext || this.drawingPath.length < 2) return

      const ctx = this.canvasContext

      // 重绘覆盖层（会自动包含淡色O模板）
      this.drawOOverlay()

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

    // 简化的O形状判断方法，更容易识别
    analyzeOShape() {
      // 降低点数量要求
      if (this.drawingPath.length < 5) {
        return false
      }

      // 计算起点和终点的距离 - 放宽封闭性要求
      const startPoint = this.drawingPath[0]
      const endPoint = this.drawingPath[this.drawingPath.length - 1]
      const endDistance = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
      )

      // 放宽封闭性要求，允许更大的端点距离
      if (endDistance > Math.min(window.innerWidth, window.innerHeight) * 0.2) {
        return false
      }

      // 计算所有点的中心点
      let totalX = 0, totalY = 0
      this.drawingPath.forEach(point => {
        totalX += point.x
        totalY += point.y
      })
      const centerX = totalX / this.drawingPath.length
      const centerY = totalY / this.drawingPath.length

      // 计算各点到中心的距离
      let distances = []
      this.drawingPath.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        )
        distances.push(distance)
      })

      // 计算平均距离和标准差
      const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length
      const variance = distances.reduce((sum, dist) => sum + Math.pow(dist - avgDistance, 2), 0) / distances.length
      const stdDev = Math.sqrt(variance)

      // 大幅放宽圆度要求，标准差与平均距离的比值可以更大
      if (stdDev / avgDistance > 0.6) {
        return false
      }

      // 计算路径的总长度（周长）
      let totalLength = 0
      for (let i = 1; i < this.drawingPath.length; i++) {
        const dx = this.drawingPath[i].x - this.drawingPath[i - 1].x
        const dy = this.drawingPath[i].y - this.drawingPath[i - 1].y
        totalLength += Math.sqrt(dx * dx + dy * dy)
      }

      // 圆形周长公式：2 * π * r
      // 大幅放宽周长比例要求
      const idealCircumference = 2 * Math.PI * avgDistance
      const circumferenceRatio = totalLength / idealCircumference

      // 允许非常大的误差范围，0.5到2.0之间认为是圆形
      if (circumferenceRatio < 0.5 || circumferenceRatio > 2.0) {
        return false
      }

      // 简化后的判断：只要通过以上条件，就认为是O形状
      return true
    },

    // 完成绘制O动画
    completeDrawOAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.drawOCanvas
      if (canvas) {
        // 先绘制完成的O动画
        this.drawCompletedO()

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
        const instruction = document.querySelector('.draw-o-instruction')
        if (instruction) {
          instruction.style.transition = 'opacity 0.8s ease-out'
          instruction.style.opacity = '0'
        }
      }

      // 延迟设置lAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.oAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },

    // 绘制完成的O效果
    drawCompletedO() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawOCanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) * 0.25

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 保持原覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制完成的O
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)

      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 8
      ctx.stroke()
    },

    // 鼠标事件处理
    handleMouseDown(event) {
      this.isDrawing = true
      this.drawingPath = [{ x: event.clientX + 250, y: event.clientY }]
    },

    handleMouseMove(event) {
      if (this.isDrawing) {
        this.drawingPath.push({ x: event.clientX + 250, y: event.clientY })
        this.drawUserPath()
      }
    },

    handleMouseUp() {
      if (this.isDrawing && this.drawingPath.length > 5) {
        // 保存完成的线段
        const startPoint = this.drawingPath[0]
        const endPoint = this.drawingPath[this.drawingPath.length - 1]

        this.lineSegments.push({ start: startPoint, end: endPoint })

        // 分析是否形成O形状
        if (this.analyzeOShape()) {
          // 形成O形状，完成动画
          this.completeDrawOAnimation()
        } else {
          // 增加错误计数
          this.errorCount++
          // 检查是否错误3次
          if (this.errorCount >= 3) {
            // 错误3次，直接成功
            this.completeDrawOAnimation()
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
        this.drawOOverlay()
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
  background-image: url('../assets/letters/letter-5.png');
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

/* 绘制O动画样式 */
.draw-o-canvas {
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: grab;
  pointer-events: all;
}

.draw-o-canvas:active {
  cursor: grabbing;
}

.draw-o-instruction {
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