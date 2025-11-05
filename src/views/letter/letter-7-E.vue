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
        { text: "top4是我们共戴的耳机。", speaker: "我说", fontSize: '23px', marginTop: '15px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "我现在都不意外你说什么了。", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "哈哈哈哈哈哈，是我和你在一起看电影、看电视剧、看动漫的时候。", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "你还送了我耳机呢，不过这个耳机确实挺好用的，隔音。", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "没有绕来绕去的耳机线，就像我们靠在一起的肩膀，不用刻意迁就，共享同一段剧情的幸福感。", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "耳机里是角色的对话，耳边是你的吐槽，这种两个人安安静静、又彼此惦记的时刻，比任何精彩剧情都让人记牢。", speaker: "我想了想", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
      ],
      displayedTextLines: [],
      cursorInterval: null,
      // Canvas绘制E相关状态
      eAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      canvasContext: null,
      lineSegments: [],
      errorCount: 0 // 错误绘制计数
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
      if (!this.canvasContext) return

      const ctx = this.canvasContext
      // 重绘覆盖层（会自动包含淡色E模板）
      this.drawEOverlay()

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

      // 更精确的E形状判断
      // 1. 检测线段的方向和数量
      const horizontalSegments = []
      const verticalSegments = []
      const minSegmentLength = Math.min(window.innerWidth, window.innerHeight) * 0.02

      // 分析相邻点之间的线段
      for (let i = 1; i < this.drawingPath.length; i++) {
        const prevPoint = this.drawingPath[i - 1]
        const currPoint = this.drawingPath[i]

        const dx = currPoint.x - prevPoint.x
        const dy = currPoint.y - prevPoint.y
        const length = Math.sqrt(dx * dx + dy * dy)

        // 忽略太短的线段
        if (length < minSegmentLength) continue

        // 计算角度（相对于x轴）
        const angle = Math.atan2(Math.abs(dy), Math.abs(dx)) * (180 / Math.PI)

        // 水平线段（0-30度或150-180度）
        if (angle < 30 || angle > 150) {
          horizontalSegments.push({ start: prevPoint, end: currPoint, length })
        }
        // 垂直线段（60-120度）
        else if (angle > 60 && angle < 120) {
          verticalSegments.push({ start: prevPoint, end: currPoint, length })
        }
      }

      // 2. 检测水平线段的数量和分布（E应该有顶部、中间和底部三条水平线）
      if (horizontalSegments.length < 2) return false

      // 按y坐标排序水平线段，检测是否有上下分布
      const sortedHorizontal = [...horizontalSegments].sort((a, b) => {
        const y1 = (a.start.y + a.end.y) / 2
        const y2 = (b.start.y + b.end.y) / 2
        return y1 - y2
      })

      // 检查顶部和底部水平线是否有足够的垂直距离
      const topY = (sortedHorizontal[0].start.y + sortedHorizontal[0].end.y) / 2
      const bottomY = (sortedHorizontal[sortedHorizontal.length - 1].start.y + sortedHorizontal[sortedHorizontal.length - 1].end.y) / 2
      const verticalSpread = Math.abs(bottomY - topY)

      // 垂直距离应至少为E高度的70%
      if (verticalSpread < height * 0.7) return false

      // 3. 检测垂直线段（E应该有一条左侧垂直线）
      if (verticalSegments.length === 0) {
        // 如果没有明显的垂直线段，检查是否有左侧边缘
        let hasLeftEdge = false
        const leftmostX = minX + width * 0.1 // 左侧10%区域

        // 计算左侧区域内点的数量
        const leftEdgePoints = this.drawingPath.filter(point =>
          point.x <= leftmostX &&
          point.y >= minY + height * 0.1 &&
          point.y <= maxY - height * 0.1
        )

        // 如果左侧区域有足够的点，认为有左侧边缘
        hasLeftEdge = leftEdgePoints.length >= this.drawingPath.length * 0.2
        if (!hasLeftEdge) return false
      }

      // 4. 检查是否有中间水平线（E的特征）
      let hasMiddleHorizontal = false
      if (sortedHorizontal.length >= 3) {
        // 如果有3条以上水平线段，中间的那条认为是中间水平线
        hasMiddleHorizontal = true
      } else if (sortedHorizontal.length === 2) {
        // 如果只有2条水平线，检查是否有中间区域的水平趋势
        const middleY = minY + height * 0.5
        const middleRegionPoints = this.drawingPath.filter(point =>
          point.y >= middleY - height * 0.15 &&
          point.y <= middleY + height * 0.15
        )

        // 分析中间区域的点是否有水平趋势
        if (middleRegionPoints.length > 5) {
          const middleXCoords = middleRegionPoints.map(p => p.x)
          const middleXRange = Math.max(...middleXCoords) - Math.min(...middleXCoords)
          hasMiddleHorizontal = middleXRange > width * 0.3
        }
      }

      // 5. 检查整体比例是否符合E的形状
      const widthHeightRatio = width / height
      // E的宽度通常是高度的0.6-0.8倍
      if (widthHeightRatio < 0.4 || widthHeightRatio > 1.0) return false

      // 综合判断：需要有足够的水平线段、垂直分布、左侧边缘，最好有中间水平线
      return hasMiddleHorizontal || (horizontalSegments.length >= 2 && verticalSpread >= height * 0.7)
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

        // 分析是否形成E形状
        if (this.analyzeEShape()) {
          // 形成E形状，完成动画
          this.completeDrawEAnimation()
        } else {
          // 增加错误计数
          this.errorCount++
          // 检查是否错误3次
          if (this.errorCount >= 3) {
            // 错误3次，直接成功
            this.completeDrawEAnimation()
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
  background-image: url('../../assets/letters/letter-7.png');
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