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
    <!-- 绘制Y动画Canvas -->
    <canvas v-if="!yAnimationCompleted" ref="drawYCanvas" class="draw-y-canvas"></canvas>
    <div v-if="!yAnimationCompleted" class="draw-y-instruction">请画出大写Y打开信纸...</div>
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
      // Canvas绘制Y相关状态
      yAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      canvasContext: null,
      lineSegments: [],
      errorCount: 0 // 错误绘制计数
    }
  },
  mounted() {
    this.loadLoveFont()
    // 先初始化绘制Y动画Canvas
    this.$nextTick(() => {
      this.initDrawYCanvas()
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
    // 初始化绘制Y动画Canvas
    initDrawYCanvas() {
      const canvas = this.$refs.drawYCanvas
      if (!canvas) return

      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      this.canvasContext = canvas.getContext('2d')

      // 绘制初始覆盖层
      this.drawYOverlay()

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
    drawYOverlay() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawYCanvas
      if (!canvas) return

      const ctx = this.canvasContext

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 填充覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)' // 浅米色半透明
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制淡色Y作为视觉提示
      this.drawTemplateY()
    },

    // 绘制淡色Y模板作为视觉提示
    drawTemplateY() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawYCanvas
      if (!canvas) return

      const ctx = this.canvasContext
      const centerX = canvas.width / 2 - canvas.width * 0.25
      const centerY = canvas.height / 2
      const yWidth = Math.min(canvas.width, canvas.height) * 0.3
      const yHeight = yWidth * 1.6

      // Y的起始位置
      const startX = centerX
      const startY = centerY + 50

      // 设置虚线样式
      ctx.setLineDash([10, 5])
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)' // 淡棕色虚线
      ctx.lineWidth = 4
      ctx.lineCap = 'round'

      // 绘制虚线Y
      ctx.beginPath()

      // 顶部垂直线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX, startY + yHeight * 0.5)

      // 左上对角线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX - yWidth / 2, startY - yHeight * 0.7)

      // 右上对角线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX + yWidth / 2, startY - yHeight * 0.7)

      ctx.stroke()

      // 重置线条样式
      ctx.setLineDash([])
    },

    // 绘制用户当前的笔画
    drawUserPath() {
      if (!this.canvasContext) return

      const ctx = this.canvasContext
      // 重绘覆盖层（会自动包含淡色Y模板）
      this.drawYOverlay()

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

    // Y形状判断方法
    analyzeYShape() {
      // 超低的点数量要求，几乎只要有几个点就能通过
      if (this.drawingPath.length < 3) {
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

      // 极度放宽的宽高比要求（Y是高大于宽的字母）
      if (height < width * 1.2 || height > width * 4.0) {
        return false
      }

      // 极低的尺寸要求
      const minDimension = Math.min(window.innerWidth, window.innerHeight)
      if (height < minDimension * 0.03) {
        return false
      }

      // 简化版Y形状检测逻辑：只要满足基本的Y趋势即可

      // 1. 检查是否有足够的高度（Y是垂直字母）
      const hasEnoughHeight = height > minDimension * 0.05

      // 2. 检查是否有顶部汇聚点（Y的顶部是一个点）
      const centerX = (minX + maxX) / 2
      const topAreaHeight = height * 0.2
      const topPoints = this.drawingPath.filter(p => p.y <= minY + topAreaHeight)
      const hasTopConvergence = topPoints.length > 0 &&
        topPoints.every(p => Math.abs(p.x - centerX) < width * 0.3)

      // 3. 检查是否有两个向下的分支
      let leftBranchCount = 0
      let rightBranchCount = 0

      // 找出可能的中心位置
      const middleY = minY + height * 0.5

      for (let i = 1; i < this.drawingPath.length; i++) {
        const prev = this.drawingPath[i - 1]
        const curr = this.drawingPath[i]

        // 只检查中间及以下部分
        if (prev.y >= middleY || curr.y >= middleY) {
          // 向左下分支趋势
          if (curr.x < prev.x && curr.y > prev.y) {
            leftBranchCount++
          }
          // 向右下分支趋势
          else if (curr.x > prev.x && curr.y > prev.y) {
            rightBranchCount++
          }
        }
      }

      // 只要有一定比例的分支趋势点就认为有分支
      const totalSteps = this.drawingPath.length - 1
      const requiredSteps = Math.max(1, Math.floor(totalSteps * 0.1)) // 最低只要10%的点有趋势即可
      const hasTwoBranches = (leftBranchCount >= requiredSteps && rightBranchCount >= requiredSteps)

      // 4. 额外的宽松判断：如果有明显的Y形轮廓（顶部一个区域，底部左右两个区域）
      const bottomAreaHeight = height * 0.2
      const bottomPoints = this.drawingPath.filter(p => p.y >= maxY - bottomAreaHeight)

      // 底部左区域
      const hasBottomLeftArea = bottomPoints.some(p => p.x <= centerX)
      // 底部右区域
      const hasBottomRightArea = bottomPoints.some(p => p.x >= centerX)

      // Y形轮廓检查：有顶部汇聚和底部左右分布
      const hasYContour = hasTopConvergence && hasBottomLeftArea && hasBottomRightArea

      // 最终判断：非常宽松，只要满足基本高度和分支趋势，或者有Y形轮廓即可
      return (hasEnoughHeight && (hasTwoBranches || hasYContour))
    },

    // 完成绘制Y动画
    completeDrawYAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.drawYCanvas
      if (canvas) {
        // 先绘制完成的Y动画
        this.drawCompletedY()

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
        const instruction = document.querySelector('.draw-y-instruction')
        if (instruction) {
          instruction.style.transition = 'opacity 0.8s ease-out'
          instruction.style.opacity = '0'
        }
      }

      // 延迟设置yAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.yAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },

    // 绘制完成的Y效果
    drawCompletedY() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawYCanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2 - canvas.width * 0.25
      const centerY = canvas.height / 2
      const yWidth = Math.min(canvas.width, canvas.height) * 0.3
      const yHeight = yWidth * 1.6

      // Y的起始位置
      const startX = centerX
      const startY = centerY + 50

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 保持原覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制完成的Y
      ctx.beginPath()

      // 顶部垂直线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX, startY + yHeight * 0.5)

      // 左上对角线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX - yWidth / 2, startY - yHeight * 0.7)

      // 右上对角线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX + yWidth / 2, startY - yHeight * 0.7)

      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 8
      ctx.stroke()
    },

    // 鼠标事件处理
    handleMouseDown(event) {
      this.isDrawing = true
      this.drawingPath = [{ x: event.clientX - 840, y: event.clientY - 40 }]
    },

    handleMouseMove(event) {
      if (this.isDrawing) {
        this.drawingPath.push({ x: event.clientX - 840, y: event.clientY - 40 })
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

        // 分析是否形成Y形状
        if (this.analyzeYShape()) {
          // 形成Y形状，完成动画
          this.completeDrawYAnimation()
        } else {
          // 增加错误计数
          this.errorCount++
          // 检查是否错误3次
          if (this.errorCount >= 3) {
            // 错误3次，直接成功
            this.completeDrawYAnimation()
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
  background-image: url('../../assets/letters/letter-8.png');
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

/* 绘制Y动画样式 */
.draw-y-canvas {
  position: fixed;
  top: 0;
  left: 50%;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: grab;
  pointer-events: all;
}

.draw-y-canvas:active {
  cursor: grabbing;
}

.draw-y-instruction {
  position: fixed;
  top: 5%;
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