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
    <canvas v-if="!mAnimationCompleted" ref="drawMCanvas" class="tear-canvas"></canvas>
    <div v-if="!mAnimationCompleted" class="tear-instruction">请画出大写M打开信纸...</div>
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
        { text: "哈哈哈哈哈哈好喽。", speaker: "她笑着说", fontSize: '23px', marginTop: '15px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "top8是牵手。", speaker: "我说", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "没想到吧，当时我会提出牵手。", speaker: "她得意说", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "没想到，我以为是摸头来着，牵着手挺紧张的一直出汗。", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "出其不意哈哈哈哈哈哈哈。", speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "但不止那一次，是每一次牵手，每一次晃动都是我们默契神会的配合，能感受到彼此的温度，真实又具体。 还有你手真小。", speaker: "我", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
        { text: "女生本来手就小，我更小一些。",speaker: "她", fontSize: '23px', marginTop: '0px', marginBottom: '10px', paddingLeft: '40px', paddingRight: '0px' },
      ],
      displayedTextLines: [],
      cursorInterval: null,
      // Canvas绘制M相关状态
      mAnimationCompleted: false,
      isDrawing: false,
      drawingPath: [],
      savedSegments: [],
      canvasContext: null,
      templateMPoints: null,
      templateMPath: null,
      errorCount: 0 // 错误绘制计数
    }
  },
  mounted() {
    this.loadLoveFont()
    // 先初始化绘制M动画Canvas
    this.$nextTick(() => {
      this.initDrawMCanvas()
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
    // 初始化绘制M动画Canvas
    initDrawMCanvas() {
      const canvas = this.$refs.drawMCanvas
      if (!canvas) return
      
      // 设置Canvas尺寸为视口大小
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      this.canvasContext = canvas.getContext('2d')
      
      // 生成模板M的路径点
      this.generateTemplateM()
      
      // 绘制初始覆盖层
      this.drawMOverlay()
      
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
    
    // 生成模板M的路径点 - 放大2倍
    generateTemplateM() {
      const canvas = this.$refs.drawMCanvas
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const mHeight = 500 // 放大2倍
      const mWidth = 400 // 放大2倍
      
      // 生成M形状的关键点
      this.templateMPoints = [
        { x: centerX - mWidth, y: centerY + mHeight / 2 },    // 左下
        { x: centerX - mWidth / 2, y: centerY - mHeight / 2 }, // 左上峰
        { x: centerX, y: centerY + mHeight / 2 },          // 中
        { x: centerX + mWidth / 2, y: centerY - mHeight / 2 }, // 右上峰
        { x: centerX + mWidth, y: centerY + mHeight / 2 }   // 右下
      ]
      
      // 生成M形状的详细路径点（用于判断描着画）
      this.templateMPath = []
      
      // 从左下到左上峰
      this.addPointsToPath(
        this.templateMPoints[0], 
        this.templateMPoints[1], 
        20
      )
      
      // 从左上峰到中
      this.addPointsToPath(
        this.templateMPoints[1], 
        this.templateMPoints[2], 
        20
      )
      
      // 从中到右上峰
      this.addPointsToPath(
        this.templateMPoints[2], 
        this.templateMPoints[3], 
        20
      )
      
      // 从右上峰到右下
      this.addPointsToPath(
        this.templateMPoints[3], 
        this.templateMPoints[4], 
        20
      )
    },
    
    // 添加路径点
    addPointsToPath(start, end, numPoints) {
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const x = start.x + (end.x - start.x) * t
        const y = start.y + (end.y - start.y) * t
        this.templateMPath.push({ x, y })
      }
    },
    
    // 绘制M形状的覆盖层
    drawMOverlay() {
      if (!this.canvasContext) return
      
      const canvas = this.$refs.drawMCanvas
      if (!canvas) return
      
      const ctx = this.canvasContext
      
      // 清空Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 填充覆盖层
      ctx.fillStyle = 'rgba(255, 245, 238, 0.95)' // 浅米色半透明
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 绘制淡色M模板
      this.drawTemplateM()
      
      // 绘制用户路径
      this.drawUserPath()
    },
    
    // 绘制模板M（淡色）- 放大2倍
    drawTemplateM() {
      if (!this.canvasContext || !this.templateMPoints) return
      
      const ctx = this.canvasContext
      
      // 绘制虚线M
      ctx.beginPath()
      ctx.moveTo(this.templateMPoints[0].x, this.templateMPoints[0].y)
      ctx.lineTo(this.templateMPoints[1].x, this.templateMPoints[1].y)
      ctx.lineTo(this.templateMPoints[2].x, this.templateMPoints[2].y)
      ctx.lineTo(this.templateMPoints[3].x, this.templateMPoints[3].y)
      ctx.lineTo(this.templateMPoints[4].x, this.templateMPoints[4].y)
      
      // 设置虚线样式
      ctx.setLineDash([10, 5])
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)' // 淡棕色虚线
      ctx.lineWidth = 4
      ctx.stroke()
      
      // 重置线条样式
      ctx.setLineDash([])
    },
    
    // 绘制用户路径
    drawUserPath() {
      if (!this.canvasContext || this.drawingPath.length < 2) return
      
      const ctx = this.canvasContext
      ctx.beginPath()
      ctx.moveTo(this.drawingPath[0].x, this.drawingPath[0].y)
      
      for (let i = 1; i < this.drawingPath.length; i++) {
        ctx.lineTo(this.drawingPath[i].x, this.drawingPath[i].y)
      }
      
      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 3
      ctx.stroke()
    },
    
    // 分析用户绘制的形状是否为大写M - 降低识别门槛，只要像30%即为成功
    analyzeMShape() {
      // 只要有一定的线段数量就尝试识别
      if (this.savedSegments.length < 1) {
        return false;
      }
      
      // 简化的识别逻辑，更容易成功
      return this.checkSimpleMShape();
    },
    
    // 简化的M形状检测，降低识别门槛
    checkSimpleMShape() {
      // 收集所有点进行分析
      const allPoints = [];
      this.savedSegments.forEach(segment => {
        allPoints.push(segment.start, segment.end);
      });
      
      if (allPoints.length < 3) return false;
      
      // 计算点的基本分布
      const minY = Math.min(...allPoints.map(p => p.y));
      const maxY = Math.max(...allPoints.map(p => p.y));
      const height = maxY - minY;
      
      // 只要有一定的高度就认为可能是M
      if (height < 20) {
        return false;
      }
      
      // 计算斜率分布 - 更宽松的条件
      const slopes = [];
      this.savedSegments.forEach(segment => {
        const dx = segment.end.x - segment.start.x;
        const dy = segment.end.y - segment.start.y;
        if (Math.abs(dx) > 2) { // 更宽松的条件
          const slope = dy / dx;
          slopes.push(slope);
        }
      });
      
      // 只要有一定比例的正负斜率就认为可能是M
      const positiveSlopes = slopes.filter(s => s > 0.1);
      const negativeSlopes = slopes.filter(s => s < -0.1);
      
      // 只要有任何斜率变化就认为可能是M
      if (positiveSlopes.length > 0 || negativeSlopes.length > 0) {
        return true;
      }
      
      // 或者只要线段数量足够也认为成功
      return this.savedSegments.length >= 2;
    },
    
    // 检查路径匹配度
    checkPathMatch(userPath, templatePath, tolerance) {
      let matchedCount = 0
      const usedTemplateIndices = new Set()
      
      // 遍历用户路径中的每个点
      userPath.forEach(userPoint => {
        // 查找模板路径中最近的点
        let nearestDist = Infinity
        let nearestIndex = -1
        
        for (let i = 0; i < templatePath.length; i++) {
          if (usedTemplateIndices.has(i)) continue
          
          const dist = this.calculateDistance(userPoint, templatePath[i])
          if (dist < nearestDist) {
            nearestDist = dist
            nearestIndex = i
          }
        }
        
        // 如果最近的点在容差范围内，标记为匹配
        if (nearestIndex !== -1 && nearestDist <= tolerance) {
          matchedCount++
          usedTemplateIndices.add(nearestIndex)
          
          // 同时标记相邻的几个点也为匹配（允许用户画得不够精确）
          for (let j = 1; j <= 3; j++) {
            if (nearestIndex + j < templatePath.length) {
              usedTemplateIndices.add(nearestIndex + j)
            }
          }
        }
      })
      
      return matchedCount
    },
    
    // 计算两点之间的距离
    calculateDistance(p1, p2) {
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      return Math.sqrt(dx * dx + dy * dy)
    },
    
    // 检测一次性画完的M
    checkSingleStrokeM() {
      // 查找是否有单个长线段或路径包含足够的转折点
      // 获取所有线段并计算转折点
      let totalPoints = 0
      let turnsDetected = 0
      const minTurnAngle = Math.PI / 6 // 30度
      
      // 检查每个线段中是否有足够的转折点
      this.savedSegments.forEach(segment => {
        const segmentPoints = this.getSegmentPoints(segment)
        totalPoints += segmentPoints.length
        
        // 检测转折点
        for (let i = 1; i < segmentPoints.length - 1; i++) {
          const angle = this.calculateTurnAngle(
            segmentPoints[i-1], 
            segmentPoints[i], 
            segmentPoints[i+1]
          )
          if (angle > minTurnAngle) {
            turnsDetected++
          }
        }
      })
      
      // M形状通常有2-4个转折点
      return turnsDetected >= 2 && totalPoints >= 10
    },
    
    // 检测两笔画完的M
    checkTwoStrokeM() {
      if (this.savedSegments.length < 2) return false
      
      // 计算每个线段的特征
      const segmentFeatures = this.savedSegments.map(segment => {
        const dx = segment.end.x - segment.start.x
        const dy = segment.end.y - segment.start.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const slope = dx !== 0 ? Math.abs(dy / dx) : Infinity
        
        // 计算线段包含的点
        const points = this.getSegmentPoints(segment)
        
        // 查找线段中的极值点
        const minYPoint = points.reduce((min, p) => p.y < min.y ? p : min)
        const maxYPoint = points.reduce((max, p) => p.y > max.y ? p : max)
        
        return {
          segment,
          dx,
          dy,
          length,
          slope,
          minYPoint,
          maxYPoint,
          // 判断是否包含上升和下降部分
          hasUpDown: this.hasUpDownMovement(points)
        }
      })
      
      // 过滤出有效的线段
      const validSegments = segmentFeatures.filter(s => s.length > 40 && s.slope > 0.2 && s.slope < 4)
      
      // 两笔画M的情况：两个线段，一个包含左侧峰，一个包含右侧峰
      const upDownSegments = validSegments.filter(s => s.hasUpDown)
      if (upDownSegments.length >= 1) {
        // 检查是否有足够的垂直分布
        const allPoints = validSegments.flatMap(s => [s.minYPoint, s.maxYPoint])
        const minY = Math.min(...allPoints.map(p => p.y))
        const maxY = Math.max(...allPoints.map(p => p.y))
        
        if (maxY - minY > 60) {
          // 检查水平分布是否符合M的特征
          const minX = Math.min(...allPoints.map(p => p.x))
          const maxX = Math.max(...allPoints.map(p => p.x))
          const width = maxX - minX
          
          return width > 30 && width < (maxY - minY) * 1.2
        }
      }
      
      return false
    },
    
    // 简化的三笔画检测 - 作为备用识别方法
    checkThreeStrokeM() {
      // 非常宽松的条件，几乎只要有线段就能通过
      return this.savedSegments.length >= 2;
    },
    
    // 辅助方法：获取线段上的点
    getSegmentPoints(segment) {
      // 对于保存的线段，我们只知道起点和终点
      // 在实际应用中，可能需要更复杂的算法来重建路径
      // 这里简单返回起点、中点和终点
      const midX = (segment.start.x + segment.end.x) / 2
      const midY = (segment.start.y + segment.end.y) / 2
      return [segment.start, { x: midX, y: midY }, segment.end]
    },
    
    // 辅助方法：计算三个点之间的转角
    calculateTurnAngle(p1, p2, p3) {
      const v1 = { x: p2.x - p1.x, y: p2.y - p1.y }
      const v2 = { x: p3.x - p2.x, y: p3.y - p2.y }
      
      // 计算向量的点积
      const dotProduct = v1.x * v2.x + v1.y * v2.y
      
      // 计算向量的模长
      const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
      const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
      
      // 计算夹角
      const cosTheta = dotProduct / (mag1 * mag2)
      // 确保值在有效范围内
      const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta))
      const theta = Math.acos(clampedCosTheta)
      
      return theta
    },
    
    // 辅助方法：检查线段是否包含上升和下降运动
    hasUpDownMovement(points) {
      if (points.length < 3) return false
      
      let hasUp = false
      let hasDown = false
      
      for (let i = 1; i < points.length; i++) {
        const dy = points[i].y - points[i-1].y
        if (dy < -5) hasUp = true // 上升
        if (dy > 5) hasDown = true // 下降
      }
      
      return hasUp && hasDown
    },
    
    // 保存绘制的线段 - 降低保存阈值
    saveSegment(start, end) {
      const dx = end.x - start.x
      const dy = end.y - start.y
      const length = Math.sqrt(dx * dx + dy * dy)
      
      // 大幅降低线段长度阈值，几乎只要有移动就能保存
      if (length > 5) {
        this.savedSegments.push({ start, end })
        // 保留更多线段以便更好地分析
        if (this.savedSegments.length > 12) {
          this.savedSegments.shift()
        }
      }
    },
    
    // 完成绘制M动画
    completeDrawMAnimation() {
      // 添加叠化过渡效果
      const canvas = this.$refs.drawMCanvas
      if (canvas) {
        // 先绘制完整的M形状
        this.drawCompletedM()
        
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
      
      // 延迟设置mAnimationCompleted和开始打字机动画，确保过渡效果完成
      setTimeout(() => {
        this.mAnimationCompleted = true
        this.startTypingAnimation()
      }, 800)
    },
    
    // 绘制完成的M形状 - 放大2倍
    drawCompletedM() {
      if (!this.canvasContext) return
      
      const canvas = this.$refs.drawMCanvas
      const ctx = this.canvasContext
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const mHeight = 500 // 放大2倍
      const mWidth = 400 // 放大2倍
      
      // 绘制M形状
      ctx.beginPath()
      ctx.moveTo(centerX - mWidth, centerY + mHeight / 2)
      ctx.lineTo(centerX - mWidth / 2, centerY - mHeight / 2)
      ctx.lineTo(centerX, centerY + mHeight / 2)
      ctx.lineTo(centerX + mWidth / 2, centerY - mHeight / 2)
      ctx.lineTo(centerX + mWidth, centerY + mHeight / 2)
      
      ctx.strokeStyle = '#8b4513'
      ctx.lineWidth = 5
      ctx.stroke()
    },
    
    // 鼠标事件处理
    handleMouseDown(event) {
      const canvas = this.$refs.drawMCanvas
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      this.isDrawing = true
      this.drawingPath = [{ x: event.clientX - rect.left + 320, y: event.clientY - rect.top + 160 }]
    },
    
    handleMouseMove(event) {
      const canvas = this.$refs.drawMCanvas
      if (!canvas || !this.isDrawing) return
      
      const rect = canvas.getBoundingClientRect()
      this.drawingPath.push({ x: event.clientX - rect.left + 320, y: event.clientY - rect.top + 160 })
      this.drawUserPath()
    },
    
    handleMouseUp() {
      if (this.isDrawing && this.drawingPath.length >= 2) {
        // 保存最后一段绘制的线段 - 使用drawingPath[0]作为起点，确保第一次绘制也能正确保存
        const start = this.drawingPath[0]
        const end = this.drawingPath[this.drawingPath.length - 1]
        this.saveSegment(start, end)
        
        // 分析是否绘制了M形状
        if (this.analyzeMShape()) {
          this.completeDrawMAnimation()
        } else {
          // 增加错误计数
          this.errorCount++
          // 检查是否错误3次
          if (this.errorCount >= 3) {
            // 错误3次，直接成功
            this.completeDrawMAnimation()
          } else {
            // 清除当前绘制路径，准备下一次绘制
            setTimeout(() => {
              this.drawingPath = []
              this.drawMOverlay()
            }, 2000)
          }
        }
      }
      this.isDrawing = false
    },
    
    // 触摸事件处理（移动端支持）
    handleTouchStart(event) {
      event.preventDefault()
      const touch = event.touches[0]
      const canvas = this.$refs.drawMCanvas
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      this.isDrawing = true
      this.drawingPath = [{ x: touch.clientX - rect.left + 320, y: touch.clientY - rect.top + 160 }]
    },
    
    handleTouchMove(event) {
      event.preventDefault()
      const touch = event.touches[0]
      const canvas = this.$refs.drawMCanvas
      if (!canvas || !this.isDrawing) return
      
      const rect = canvas.getBoundingClientRect()
      this.drawingPath.push({ x: touch.clientX - rect.left + 320, y: touch.clientY - rect.top + 160 })
      this.drawUserPath()
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
  background-image: url('../../assets/letters/letter-3.png');
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
  top: 50%;
  left: 2%;
  transform: translateY(-50%);
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