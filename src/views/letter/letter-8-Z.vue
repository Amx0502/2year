<template>
  <div class="envelope-container">
    <div class="letter-container">
      <div class="letter-content">
        <div class="dialogue-wrapper" ref="dialogueRef">
          <div v-for="(line, index) in displayedTextLines" :key="index" class="dialogue-line"
            :class="{ 'she': line.speaker === 'she', 'me': line.speaker === 'me' }"
            :style="{ fontSize: line.fontSize, marginTop: line.marginTop, marginBottom: line.marginBottom, paddingLeft: line.paddingLeft, paddingRight: line.paddingRight }">
            <div v-if="line.speaker" class="speaker">{{ line.speaker }}：</div>
            <template v-if="line.isInput">
              <textarea 
                v-model="line.text" 
                type="text" 
                class="text-input"
                placeholder="请输入回复..."
                @input="handleInputChange(index, $event)"
                :style="{ fontSize: line.fontSize }"
              ></textarea>
            </template>
            <span v-else class="text">{{ line.text }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 绘制Z动画Canvas -->
    <canvas v-if="!zAnimationCompleted" ref="drawZCanvas" class="draw-z-canvas"></canvas>
    <div v-if="!zAnimationCompleted" class="draw-z-instruction">请画出大写Z打开信纸...</div>
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
        { text: "top3呢？", speaker: "她", fontSize: '23px', marginTop: '15px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "嗯。。。top3是分开的痛苦。", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "什么痛苦？", speaker: "她似乎知道", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "我们两次分开的难受，距离的无力，难熬的情绪与翻红的眼眶交织。", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "这次我想紧握你的手！", speaker: "我坚定地说", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '70px', paddingRight: '0px', isInput: true },
      ],
      displayedTextLines: [],
      cursorInterval: null,
      // Canvas绘制Z相关状态
      zAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      canvasContext: null,
      lineSegments: [],
      errorCount: 0 // 错误绘制计数
    }
  },
  mounted() {
    this.loadLoveFont()
    // 先初始化绘制Z动画Canvas
    this.$nextTick(() => {
      this.initDrawZCanvas()
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
    // 初始化绘制Z动画Canvas
    initDrawZCanvas() {
      const canvas = this.$refs.drawZCanvas
      if (!canvas) return

      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      this.canvasContext = canvas.getContext('2d')

      // 绘制初始覆盖层
      this.drawZOverlay()

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
    drawZOverlay() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawZCanvas
      if (!canvas) return

      const ctx = this.canvasContext

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 填充覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)' // 浅米色半透明
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制淡色Z作为视觉提示
      this.drawTemplateZ()
    },

    // 绘制淡色Z模板作为视觉提示
    drawTemplateZ() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawZCanvas
      if (!canvas) return

      const ctx = this.canvasContext
      const centerX = canvas.width / 2 - canvas.width * 0.25
      const centerY = canvas.height / 2
      const zWidth = Math.min(canvas.width, canvas.height) * 0.35
      const zHeight = zWidth * 1.4

      // Z的起始位置
      const startX = centerX - zWidth / 2
      const startY = centerY - zHeight / 2

      // 设置虚线样式
      ctx.setLineDash([10, 5])
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)' // 淡棕色虚线
      ctx.lineWidth = 4
      ctx.lineCap = 'round'

      // 绘制虚线Z
      ctx.beginPath()

      // 顶部水平线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX + zWidth, startY)

      // 对角线
      ctx.moveTo(startX + zWidth, startY)
      ctx.lineTo(startX, startY + zHeight)

      // 底部水平线
      ctx.moveTo(startX, startY + zHeight)
      ctx.lineTo(startX + zWidth, startY + zHeight)

      ctx.stroke()

      // 重置线条样式
      ctx.setLineDash([])
    },

    // 绘制用户当前的笔画
    drawUserPath() {
      if (!this.canvasContext) return

      const ctx = this.canvasContext
      // 重绘覆盖层（会自动包含淡色Z模板）
      this.drawZOverlay()

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

    // Z形状判断方法
    analyzeZShape() {
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

      // 极度放宽的宽高比要求
      if (width < height * 0.4 || width > height * 3.0) {
        return false
      }

      // 极低的尺寸要求
      const minDimension = Math.min(window.innerWidth, window.innerHeight)
      if (height < minDimension * 0.03) {
        return false
      }

      // 简化版Z形状检测逻辑：只要满足基本的Z趋势即可
      
      // 1. 检查是否有左右水平扩展（X方向有足够跨度）
      const hasHorizontalSpread = width > height * 0.5
      
      // 2. 检查是否有上下垂直扩展（Y方向有足够跨度）
      const hasVerticalSpread = height > width * 0.3
      
      // 3. 简化的对角线趋势检测
      let hasDiagonalTrend = false
      
      // 简单检查：只要有从右上到左下或从左上到右下的点序列
      let rightToLeftDown = 0
      let leftToRightUp = 0
      
      for (let i = 1; i < this.drawingPath.length; i++) {
        const prev = this.drawingPath[i-1]
        const curr = this.drawingPath[i]
        
        // 右上到左下趋势
        if (prev.x > curr.x && prev.y < curr.y) {
          rightToLeftDown++
        }
        // 左下到右上趋势
        else if (prev.x < curr.x && prev.y > curr.y) {
          leftToRightUp++
        }
      }
      
      // 只要有一定比例的对角线趋势点就认为有对角线
      const totalSteps = this.drawingPath.length - 1
      const requiredSteps = Math.max(1, Math.floor(totalSteps * 0.1)) // 最低只要10%的点有趋势即可
      hasDiagonalTrend = rightToLeftDown >= requiredSteps || leftToRightUp >= requiredSteps
      
      // 4. 额外的宽松判断：如果有明显的Z形轮廓（三个区域都有点）
      const quarterWidth = width * 0.25
      const quarterHeight = height * 0.25
      
      // 左上角区域
      const hasTopLeftArea = this.drawingPath.some(p => 
        p.x <= minX + quarterWidth && p.y <= minY + quarterHeight
      )
      
      // 右上角区域
      const hasTopRightArea = this.drawingPath.some(p => 
        p.x >= maxX - quarterWidth && p.y <= minY + quarterHeight
      )
      
      // 左下角区域
      const hasBottomLeftArea = this.drawingPath.some(p => 
        p.x <= minX + quarterWidth && p.y >= maxY - quarterHeight
      )
      
      // 右下角区域
      const hasBottomRightArea = this.drawingPath.some(p => 
        p.x >= maxX - quarterWidth && p.y >= maxY - quarterHeight
      )
      
      // Z形轮廓检查：有左上+右下+中间连接 或 右上+左下+中间连接
      const hasZContour1 = hasTopLeftArea && hasBottomRightArea && hasDiagonalTrend
      const hasZContour2 = hasTopRightArea && hasBottomLeftArea && hasDiagonalTrend
      
      // 最终判断：非常宽松，只要满足基本扩展和对角线趋势，或者有Z形轮廓即可
      return (hasHorizontalSpread && hasVerticalSpread && hasDiagonalTrend) || 
             hasZContour1 || 
             hasZContour2
    },

    // 完成绘制Z动画
    completeDrawZAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.drawZCanvas
      if (canvas) {
        // 先绘制完成的Z动画
        this.drawCompletedZ()

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
        const instruction = document.querySelector('.draw-z-instruction')
        if (instruction) {
          instruction.style.transition = 'opacity 0.8s ease-out'
          instruction.style.opacity = '0'
        }
      }

      // 延迟设置zAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.zAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },

    // 绘制完成的Z效果
    drawCompletedZ() {
      if (!this.canvasContext) return

      const canvas = this.$refs.drawZCanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2 - canvas.width * 0.25
      const centerY = canvas.height / 2
      const zWidth = Math.min(canvas.width, canvas.height) * 0.35
      const zHeight = zWidth * 1.4

      // Z的起始位置
      const startX = centerX - zWidth / 2
      const startY = centerY - zHeight / 2

      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 保持原覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制完成的Z
      ctx.beginPath()

      // 顶部水平线
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX + zWidth, startY)

      // 对角线
      ctx.moveTo(startX + zWidth, startY)
      ctx.lineTo(startX, startY + zHeight)

      // 底部水平线
      ctx.moveTo(startX, startY + zHeight)
      ctx.lineTo(startX + zWidth, startY + zHeight)

      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 8
      ctx.stroke()
    },

    // 鼠标事件处理
    handleMouseDown(event) {
      this.isDrawing = true
      this.drawingPath = [{ x: event.clientX - 840, y: event.clientY -40 }]
    },

    handleMouseMove(event) {
      if (this.isDrawing) {
        this.drawingPath.push({ x: event.clientX - 840, y: event.clientY -40 })
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

        // 分析是否形成Z形状
        if (this.analyzeZShape()) {
          // 形成Z形状，完成动画
          this.completeDrawZAnimation()
        } else {
          // 增加错误计数
          this.errorCount++
          // 检查是否错误3次
          if (this.errorCount >= 3) {
            // 错误3次，直接成功
            this.completeDrawZAnimation()
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

    // 处理输入框内容变化
    handleInputChange(index, event) {
      // 更新textLines中的原始数据，确保数据一致性
      if (this.textLines[index] && this.textLines[index].isInput) {
        this.textLines[index].text = event.target.value
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

.text-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: 'Write', cursive, 'Microsoft YaHei', sans-serif;
  line-height: 1.8;
  color: #3c3c3c;
  transition: border-color 0.3s ease;
  word-wrap: break-word;
  white-space: pre-wrap;
  height: 290px;
  max-width: 300px;
  overflow-wrap: break-word;
}

.text-input:focus {
  border-color: #3c3c3c;
}

.text-input::placeholder {
  color: rgba(60, 60, 60, 0.5);
  font-style: italic;
}

.she {
  color: #e91e63;
}

.me {
  color: #1976d2;
}

/* 绘制Z动画样式 */
.draw-z-canvas {
  position: fixed;
  top: 0;
  left: 50%;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: grab;
  pointer-events: all;
}

.draw-z-canvas:active {
  cursor: grabbing;
}

.draw-z-instruction {
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