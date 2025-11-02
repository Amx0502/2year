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
    <canvas v-if="!xAnimationCompleted" ref="tearCanvas" class="tear-canvas"></canvas>
    <div v-if="!xAnimationCompleted" class="tear-instruction">请画出大写X打开信纸...</div>
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
        { text: "你心中有和我最印象深刻的事top10吗？", speaker: "她问", fontSize: '23px', marginTop: '15px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "top10是讲台上的我俩。", speaker: "我说", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "你指的是那个创新创业？结果最后我们分却很低。", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "是，那是我们相识相见的地方。", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "印象深刻在哪？", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "你激烈回答的样子让我觉得很有依靠，我观察着你的一举一动，那种在台上属于我们的专属时刻，把我们绑定在一起一同对抗外人，多难", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "得。", fontSize: '23px', marginTop: '0px', marginBottom: '0px', paddingLeft: '180px', paddingRight: '0px' }
      ],
      displayedTextLines: [],
      cursorInterval: null,
      // Canvas绘制X相关状态
      xAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      canvasContext: null,
      lineSegments: []
    }
  },
  mounted() {
      this.loadLoveFont()
      // 先初始化绘制X动画Canvas
      this.$nextTick(() => {
        this.initDrawXCanvas()
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
        this.fontLoaded = true
      })
    },
    // 初始化绘制X动画Canvas
    initDrawXCanvas() {
      const canvas = this.$refs.tearCanvas
      if (!canvas) return
      
      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      this.canvasContext = canvas.getContext('2d')
      
      // 绘制初始覆盖层
      this.drawXOverlay()
      
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
    drawXOverlay() {
      if (!this.canvasContext) return
      
      const canvas = this.$refs.tearCanvas
      const ctx = this.canvasContext
      
      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 填充覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)' // 浅米色半透明
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    },
    
    // 绘制用户当前的笔画
    drawUserPath() {
      if (!this.canvasContext || this.drawingPath.length < 2) return
      
      const ctx = this.canvasContext
      
      // 重绘覆盖层
      this.drawXOverlay()
      
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
    
    // 分析笔画是否形成X形状
    analyzeXShape() {
      if (this.lineSegments.length < 2) return false
      
      // 简单的X形状检测：寻找两条交叉的对角线
      const validLines = this.lineSegments.filter(segment => {
        // 只考虑有足够长度的线段
        const dx = segment.end.x - segment.start.x
        const dy = segment.end.y - segment.start.y
        const length = Math.sqrt(dx * dx + dy * dy)
        return length > Math.min(window.innerWidth, window.innerHeight) * 0.1 // 至少是视口大小的30%
      })
      
      if (validLines.length < 2) return false
      
      // 检查是否有两条交叉的线段，一条从左上到右下，一条从右上到左下
      let hasDiagonal1 = false // 左上到右下
      let hasDiagonal2 = false // 右上到左下
      
      validLines.forEach(segment => {
        const dx = segment.end.x - segment.start.x
        const dy = segment.end.y - segment.start.y
        const slope = dy / dx
        
        // 判断对角线方向
        if (Math.abs(slope) > 0.5 && Math.abs(slope) < 2.0) { // 接近30度角
          if ((dx > 0 && dy > 0) || (dx < 0 && dy < 0)) {
            hasDiagonal1 = true
          } else if ((dx > 0 && dy < 0) || (dx < 0 && dy > 0)) {
            hasDiagonal2 = true
          }
        }
      })
      
      // 需要同时满足两条对角线条件
      return hasDiagonal1 && hasDiagonal2
    },
    
    // 完成绘制X动画
    completeDrawXAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.tearCanvas
      if (canvas) {
        // 先绘制交叉的X动画
        this.drawCompletedX()
        
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
      
      // 延迟设置xAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.xAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },
    
    // 绘制完成的X效果
    drawCompletedX() {
      if (!this.canvasContext) return
      
      const canvas = this.$refs.tearCanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2 - canvas.width * 0.25
      const centerY = canvas.height / 2
      const xSize = Math.min(canvas.width, canvas.height) * 0.6
      
      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 保持原覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 绘制完成的X
      ctx.beginPath()
      
      // 左上到右下的对角线
      ctx.moveTo(centerX - xSize / 2, centerY - xSize / 2)
      ctx.lineTo(centerX + xSize / 2, centerY + xSize / 2)
      
      // 右上到左下的对角线
      ctx.moveTo(centerX + xSize / 2, centerY - xSize / 2)
      ctx.lineTo(centerX - xSize / 2, centerY + xSize / 2)
      
      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 8
      ctx.stroke()
    },
    
    // 鼠标事件处理
    handleMouseDown(event) {
      this.isDrawing = true
      this.drawingPath = [{ x: event.clientX - 220, y: event.clientY }]
    },
    
    handleMouseMove(event) {
      if (this.isDrawing) {
        this.drawingPath.push({ x: event.clientX - 220, y: event.clientY })
        this.drawUserPath()
      }
    },
    
    handleMouseUp() {
      if (this.isDrawing && this.drawingPath.length > 5) {
        // 保存完成的线段
        const startPoint = this.drawingPath[0]
        const endPoint = this.drawingPath[this.drawingPath.length - 1]
        
        this.lineSegments.push({ start: startPoint, end: endPoint })
        
        // 分析是否形成X形状
        if (this.analyzeXShape()) {
          // 形成X形状，完成动画
          this.completeDrawXAnimation()
        } else if (this.lineSegments.length > 2) {
          // 如果画了太多线条但没形成X，重置部分线条
          this.lineSegments = this.lineSegments.slice(-1) // 保留最近的两条线段
          this.drawUserPath()
        } else {
          // 继续绘制
          this.drawingPath = []
        }
      } else {
        // 清除太短的路径
        this.drawingPath = []
        this.drawXOverlay()
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
  background-image: url('../assets/letters/letter-1.png');
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

/* 打字机光标样式已移除 */

/* 撕拉动画样式 */
.tear-canvas {
  position: fixed;
  top: 0;
  left: 0;
  
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
  bottom: 50px;
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