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
    <canvas v-if="!aAnimationCompleted" ref="tearCanvas" class="tear-canvas"></canvas>
    <div v-if="!aAnimationCompleted" class="tear-instruction">请画出大写A打开信纸...</div>
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
        { text: "确实。那top9呢？", speaker: "她答道", fontSize: '23px', marginTop: '15px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "top9是汽车站。", speaker: "我说", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "你当时来汽车站接我是我没想到的，我以为只是在学校门口。", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "小事更能体现我对你的重视。", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "那你说哪里印象深刻？", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "在去接你的路上，我满脑子想的是你见到我时的模样，期待", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '50px', paddingRight: '0px' },
        { text: "伴随着心中的澎湃，直至", fontSize: '23px', marginTop: '-10px', marginBottom: '10px', paddingLeft: '114px', paddingRight: '0px' },
        { text: "遇见你的那一刻。", fontSize: '23px', marginTop: '-10px', marginBottom: '10px', paddingLeft: '114px', paddingRight: '0px' },
      ],
      displayedTextLines: [],
      cursorInterval: null,
      // Canvas绘制A相关状态
      aAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      canvasContext: null,
      lineSegments: []
    }
  },
  mounted() {
      this.loadLoveFont()
      // 先初始化绘制A动画Canvas
      this.$nextTick(() => {
        this.initDrawACanvas()
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
    // 初始化绘制A动画Canvas
    initDrawACanvas() {
      const canvas = this.$refs.tearCanvas
      if (!canvas) return
      
      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      this.canvasContext = canvas.getContext('2d')
      
      // 绘制初始覆盖层
      this.drawAOverlay()
      
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
    drawAOverlay() {
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
      this.drawAOverlay()
      
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
    
    // 分析笔画是否形成A形状
    analyzeAShape() {
      // A形状必须包含横线和斜线的组合
      if (this.lineSegments.length < 2) return false
      
      // 过滤出有效的线段（足够长）
      const validLines = this.lineSegments.filter(segment => {
        const dx = segment.end.x - segment.start.x
        const dy = segment.end.y - segment.start.y
        const length = Math.sqrt(dx * dx + dy * dy)
        return length > Math.min(window.innerWidth, window.innerHeight) * 0.08
      })
      
      if (validLines.length < 2) return false
      
      // 计算线段的特征
      const lines = validLines.map(segment => {
        const dx = segment.end.x - segment.start.x
        const dy = segment.end.y - segment.start.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const slope = dy / dx
        
        return {
          segment,
          dx,
          dy,
          length,
          slope,
          isVertical: Math.abs(dx) < Math.abs(dy) * 0.5,
          isHorizontal: Math.abs(dy) < Math.abs(dx) * 0.5, // 横线判断
          isSlant: Math.abs(slope) > 0.3 && Math.abs(slope) < 3, // 斜线判断，范围更宽松
          isLeftSlant: slope < -0.3, // 左斜线（左上到右下）
          isRightSlant: slope > 0.3, // 右斜线（右上到左下）
          topPoint: dy > 0 ? segment.start : segment.end, // 上端点
          bottomPoint: dy > 0 ? segment.end : segment.start, // 下端点
          midPoint: { // 中点
            x: (segment.start.x + segment.end.x) / 2,
            y: (segment.start.y + segment.end.y) / 2
          }
        }
      })
      
      // 必须有横线才能识别为A
      const hasHorizontal = lines.some(line => line.isHorizontal)
      if (!hasHorizontal) {
        // 没有横线，直接返回false，确保必须包含横线
        return false
      }
      
      // 检查是否有斜线
      const hasSlant = lines.some(line => line.isSlant)
      const hasLeftSlant = lines.some(line => line.isLeftSlant)
      const hasRightSlant = lines.some(line => line.isRightSlant)
      
      // 情况1：有横线和至少一条斜线
      if (hasHorizontal && hasSlant) {
        // 计算所有线段的中点，用于判断是否分布在A形状的位置上
        const midPoints = lines.map(line => line.midPoint)
        
        // 检查中点的分布是否符合A的形状
        if (midPoints.length >= 2) {
          // 计算中点的y坐标范围，用于判断是否有上下分布
          const yCoords = midPoints.map(p => p.y)
          const minY = Math.min(...yCoords)
          const maxY = Math.max(...yCoords)
          const yRange = maxY - minY
          
          // 有足够的垂直分布，符合A的特征
          if (yRange > Math.min(window.innerWidth, window.innerHeight) * 0.08) {
            return true
          }
        }
      }
      
      // 情况2：有横线、左斜线和右斜线
      if (hasHorizontal && hasLeftSlant && hasRightSlant) {
        // 同时满足横线和两条斜线，符合A的形状特征
        return true
      }
      
      // 所有条件都不满足，返回false
      return false
    },
    
    // 完成绘制A动画
    completeDrawAAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.tearCanvas
      if (canvas) {
        // 先绘制完成的A动画
        this.drawCompletedA()
        
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
      
      // 延迟设置aAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.aAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },
    
    // 绘制完成的A效果
    drawCompletedA() {
      if (!this.canvasContext) return
      
      const canvas = this.$refs.tearCanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2 - canvas.width * 0.25
      const centerY = canvas.height / 2
      const aSize = Math.min(canvas.width, canvas.height) * 0.4
      
      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 保持原覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 绘制完成的A
      ctx.beginPath()
      
      // 左侧斜线
      ctx.moveTo(centerX - aSize / 2, centerY + aSize / 2)
      ctx.lineTo(centerX, centerY - aSize / 2)
      
      // 右侧斜线
      ctx.lineTo(centerX + aSize / 2, centerY + aSize / 2)
      
      // 横线
      ctx.moveTo(centerX - aSize / 4, centerY)
      ctx.lineTo(centerX + aSize / 4, centerY)
      
      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 8
      ctx.stroke()
    },
    
    // 鼠标事件处理
    handleMouseDown(event) {
      this.isDrawing = true
      this.drawingPath = [{ x: event.clientX - 800, y: event.clientY }]
    },
    
    handleMouseMove(event) {
      if (this.isDrawing) {
        this.drawingPath.push({ x: event.clientX - 800, y: event.clientY })
        this.drawUserPath()
      }
    },
    
    handleMouseUp() {
      if (this.isDrawing && this.drawingPath.length > 3) { // 降低线段最小长度要求
        // 保存完成的线段
        const startPoint = this.drawingPath[0]
        const endPoint = this.drawingPath[this.drawingPath.length - 1]
        
        // 计算线段长度，只有足够长的线段才保存
        const dx = endPoint.x - startPoint.x
        const dy = endPoint.y - startPoint.y
        const length = Math.sqrt(dx * dx + dy * dy)
        
        if (length > 50) { // 只要长度超过50px就保存
          this.lineSegments.push({ start: startPoint, end: endPoint })
          
          // 分析是否形成A形状
          if (this.analyzeAShape()) {
            // 形成A形状，完成动画
            this.completeDrawAAnimation()
          } else if (this.lineSegments.length > 4) { // 增加保留的线段数量
            // 如果画了太多线条但没形成A，重置部分线条
            this.lineSegments = this.lineSegments.slice(-3) // 保留最近的三条线段
            this.drawUserPath()
          } else {
            // 继续绘制
            this.drawingPath = []
          }
        } else {
          // 清除太短的路径
          this.drawingPath = []
          this.drawUserPath()
        }
      } else {
        // 清除太短的路径
        this.drawingPath = []
        this.drawAOverlay()
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
  background-image: url('../assets/letters/letter-2.png');
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
  top: 50px;
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