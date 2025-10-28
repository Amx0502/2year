<template>
  <div class="envelope-container">
    <div :class="['canvas-wrapper', { 'scale-up': isOpen }]">
      <canvas ref="envelopeCanvas" class="envelope-canvas" @click="handleCanvasClick"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false,
      canvas: null,
      ctx: null,
      animationFrame: null,
      animationProgress: 0,
      animationSpeed: 0.02,
      fontLoaded: false,
      textProgress: 0,
      maxTextProgress: 60 // 实际文本总字符数
    }
  },
  mounted() {
    this.loadLoveFont()
    this.initCanvas()
    // 等待字体加载后再绘制
    setTimeout(() => this.drawEnvelope(), 200)
  },
  beforeDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
  },
  methods: {
    loadLoveFont() {
      // 创建字体加载器，使用Vue正确的资源引用方式
      const font = new FontFace('Love', `url(${require('@/assets/fonts/love2.ttf')})`)
      font.load().then((loadedFont) => {
        document.fonts.add(loadedFont)
        this.fontLoaded = true
      }).catch((error) => {
        console.error('字体加载失败:', error)
        // 降级使用系统字体
        this.fontLoaded = true
      })
    },

    initCanvas() {
      this.canvas = this.$refs.envelopeCanvas
      this.ctx = this.canvas.getContext('2d')

      // 设置Canvas尺寸为合适的信封大小
      this.canvas.width = 650
      this.canvas.height = 715

      // 响应式调整
      const resizeCanvas = () => {
        const container = this.canvas.parentElement
        const scale = Math.min(container.clientWidth / this.canvas.width, 0.8)
        this.canvas.style.transform = `scale(${scale})`
      }

      window.addEventListener('resize', resizeCanvas)
      resizeCanvas()
    },

    drawEnvelope() {
      const { ctx, canvas } = this
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseEnvelopeWidth = 300
      const baseEnvelopeHeight = 200

      // 当信封打开时，增加大小
      const scaleFactor = 1 + (this.isOpen ? Math.min(this.animationProgress, 1) * 0.4 : 0)
      const envelopeWidth = baseEnvelopeWidth * scaleFactor
      const envelopeHeight = baseEnvelopeHeight * scaleFactor

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 计算动画进度
      const progress = this.isOpen ? Math.min(this.animationProgress, 1) : 1 - Math.min(this.animationProgress, 1)

      // 绘制信封底部 - 恋爱主题粉红色
      ctx.fillStyle = '#e91e63'
      ctx.beginPath()
      ctx.moveTo(centerX - envelopeWidth / 2, centerY + envelopeHeight / 2)
      ctx.lineTo(centerX + envelopeWidth / 2, centerY + envelopeHeight / 2)
      ctx.lineTo(centerX + envelopeWidth / 2, centerY - envelopeHeight / 2)
      ctx.lineTo(centerX - envelopeWidth / 2, centerY - envelopeHeight / 2)
      ctx.closePath()
      ctx.fill()

      // 绘制信封左、右、下侧面 - 恋爱主题粉红色阴影
      // 右侧面
      ctx.fillStyle = '#c2185b'
      ctx.beginPath()
      ctx.moveTo(centerX + envelopeWidth / 2, centerY - envelopeHeight / 2)
      ctx.lineTo(centerX + envelopeWidth / 2 + 20, centerY - envelopeHeight / 2 - 10)
      ctx.lineTo(centerX + envelopeWidth / 2 + 20, centerY + envelopeHeight / 2 - 10)
      ctx.lineTo(centerX + envelopeWidth / 2, centerY + envelopeHeight / 2)
      ctx.closePath()
      ctx.fill()

      // 下侧面
      ctx.fillStyle = '#880e4f'
      ctx.beginPath()
      ctx.moveTo(centerX - envelopeWidth / 2, centerY + envelopeHeight / 2)
      ctx.lineTo(centerX + envelopeWidth / 2, centerY + envelopeHeight / 2)
      ctx.lineTo(centerX + envelopeWidth / 2 + 20, centerY + envelopeHeight / 2 - 10)
      ctx.lineTo(centerX - envelopeWidth / 2 + 20, centerY + envelopeHeight / 2 - 10)
      ctx.closePath()
      ctx.fill()

      // 绘制信封盖
      const flapHeight = envelopeHeight / 3
      const flapRotation = progress * Math.PI / 2 // 旋转90度
      const flapYOffset = progress * flapHeight * 1.5 // 向上移动

      ctx.save()
      ctx.translate(centerX, centerY - envelopeHeight / 2)
      ctx.rotate(-flapRotation)

      // 绘制信封盖渐变 - 恋爱主题粉红色渐变
      const flapGradient = ctx.createLinearGradient(-envelopeWidth / 2, 0, envelopeWidth / 2, flapHeight)
      flapGradient.addColorStop(0, '#f06292')
      flapGradient.addColorStop(1, '#e91e63')

      ctx.fillStyle = flapGradient
      ctx.beginPath()
      ctx.moveTo(-envelopeWidth / 2, 0)
      ctx.lineTo(envelopeWidth / 2, 0)
      ctx.lineTo(envelopeWidth / 2, flapHeight)
      ctx.lineTo(0, flapHeight + 10)
      ctx.lineTo(-envelopeWidth / 2, flapHeight)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
      
      // 只有当信封未打开时显示"请点击"提示
      if (!this.isOpen && progress < 0.1) {
        ctx.save()
        // 计算提示文字位置 - 位于信封下方
        const tipY = centerY + envelopeHeight / 2 - 60
        
        // 添加文字阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 3
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        
        // 设置文字样式
        ctx.font = '30px "Love", cursive'
        ctx.fillStyle = '#Fff2df'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // 添加强烈可见的呼吸动画效果
        const currentTime = Date.now() / 1000 // 更快的时间更新
        const pulse = 0.95 + 0.05 * Math.sin(currentTime * 1) // 强烈的呼吸动画，范围0.4-1.2
        
        // 绘制提示文字
        ctx.save()
        ctx.translate(centerX, tipY)
        ctx.scale(pulse, pulse)
        ctx.fillText('请点击', 0, 0)
        ctx.restore()
      
      }


      // 绘制信纸（当信封打开时）
      if (progress > 0.3) {
        const letterProgress = (progress - 0.3) / 0.7

        // 计算类A4纸尺寸（比例约为1:1.414），增大一倍
        const letterWidth = baseEnvelopeWidth * 0.95 * 2
        const letterHeight = letterWidth * 1.414
        // 计算信纸位置，使其在动画过程中从信封底部升起并居中
        const maxLetterHeight = baseEnvelopeHeight * 2.8 // 确保信纸足够高，相应增大
        const letterYOffset = centerY - (maxLetterHeight * 0.5) - letterProgress * 100 // 调整Y轴偏移使信纸完全显示

        // 绘制信纸图片 - 实现从中间向外打开的动画效果
        const stationeryImage = new Image()
        stationeryImage.src = '/image/stationery.png'

        // 计算从中间向外打开的动画参数
        const openProgress = Math.min(letterProgress, 1)
        const centerImageX = centerX

        // 使用clip()方法实现从中间向两侧打开的效果
        ctx.save()

        // 创建从中间向两侧扩展的剪切区域
        const leftWidth = (letterWidth / 2) * openProgress
        const rightWidth = (letterWidth / 2) * openProgress

        // 左侧部分
        ctx.beginPath()
        ctx.rect(centerImageX - leftWidth, letterYOffset, leftWidth, letterHeight)
        ctx.clip()

        // 绘制左侧部分的信纸
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 5
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        if (stationeryImage.complete) {
          ctx.drawImage(stationeryImage, centerImageX - letterWidth / 2, letterYOffset, letterWidth, letterHeight)
        } else {
          ctx.fillStyle = '#f8f9fa'
          ctx.fillRect(centerImageX - letterWidth / 2, letterYOffset, letterWidth, letterHeight)
          ctx.strokeStyle = '#e0e0e0'
          ctx.lineWidth = 1
          ctx.strokeRect(centerImageX - letterWidth / 2, letterYOffset, letterWidth, letterHeight)
        }

        ctx.restore()
        ctx.save()

        // 右侧部分
        ctx.beginPath()
        ctx.rect(centerImageX, letterYOffset, rightWidth, letterHeight)
        ctx.clip()

        // 绘制右侧部分的信纸
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 5
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        if (stationeryImage.complete) {
          ctx.drawImage(stationeryImage, centerImageX - letterWidth / 2, letterYOffset, letterWidth, letterHeight)
        } else {
          ctx.fillStyle = '#f8f9fa'
          ctx.fillRect(centerImageX - letterWidth / 2, letterYOffset, letterWidth, letterHeight)
          ctx.strokeStyle = '#e0e0e0'
          ctx.lineWidth = 1
          ctx.strokeRect(centerImageX - letterWidth / 2, letterYOffset, letterWidth, letterHeight)
        }

        ctx.restore()

        // 绘制信纸上的文本 - 使用love字体
        if (letterProgress > 0.5) {
          ctx.shadowBlur = 0
          ctx.fillStyle = '#000000' // 使用纯黑色确保文字清晰可见
          // 使用love字体，降级为系统字体，文本大小相应增大
          ctx.font = this.fontLoaded ? '32px Love, cursive' : '32px cursive'
          ctx.textBaseline = 'middle'

          // 计算文本区域的中心位置，确保在信纸上居中
          const textCenterY = letterYOffset + letterHeight / 3
          const totalLines = 8 // 文本总行数
          const lineHeight = 50 // 行高相应增大
          const startY = textCenterY - (totalLines * lineHeight) / 2 + lineHeight // 计算起始Y坐标使文本居中

          // 打字机效果文字
          const textLines = [
            { text: '前言：', align: 'left', x: centerX - letterWidth / 2 + 55, y: startY + lineHeight, length: 3, fontSize: '40px' },
            { text: '🎕很喜欢一句话', align: 'left', x: centerX - letterWidth / 2 + 100, y: startY + lineHeight * 2, length: 8 },
            { text: '"手工之所以珍贵，', align: 'left', x: centerX - letterWidth / 2 + 80, y: startY + lineHeight * 3, length: 9 },
            { text: '是因为有人', align: 'left', x: centerX - letterWidth / 2 + 120, y: startY + lineHeight * 4, length: 6 },
            { text: '把生命中的一段时光', align: 'left', x: centerX - letterWidth / 2 + 110, y: startY + lineHeight * 5, length: 9 },
            { text: '物化给了你。"', align: 'left', x: centerX - letterWidth / 2 + 200, y: startY + lineHeight * 6, length: 8 },
            { text: '你是这本书最棒的读者', align: 'left', x: centerX - letterWidth / 2 + 80, y: startY + lineHeight * 7.5, length: 10 },
            { text: '也是唯一的主人', align: 'left', x: centerX - letterWidth / 2 + 100, y: startY + lineHeight * 8.5, length: 8 }
          ]

          // 打字机效果 - 与信纸打开动画无缝衔接
          let charCount = 0

          // 只有当信纸打开动画完全结束后才开始打字机动画
          if (openProgress >= 1 && this.textProgress < this.maxTextProgress) {
            this.textProgress = Math.min(this.maxTextProgress, this.textProgress + 0.1) // 适中的打字速度
          } else if (openProgress < 1) {
            // 确保在信纸完全打开前，打字进度重置为0
            this.textProgress = 0
          }

          // 显示所有已经处理到的文字
          textLines.forEach(line => {
            // 计算当前行应该显示的字符数
            const charsAvailable = Math.max(0, Math.floor(this.textProgress) - charCount)
            const displayChars = Math.min(line.length, charsAvailable)

            if (displayChars > 0) {
              ctx.textAlign = line.align
              // 应用自定义字体大小和粗细
              if (line.fontSize || line.fontWeight) {
                const size = line.fontSize || '32px'
                const weight = line.fontWeight || 'normal'
                ctx.font = `${weight} ${size} ${this.fontLoaded ? 'Love, cursive' : 'cursive'}`
              } else {
                ctx.font = '32px ' + (this.fontLoaded ? 'Love, cursive' : 'cursive')
              }
              ctx.fillText(line.text.substring(0, displayChars), line.x, line.y)
              // 恢复默认字体设置
              ctx.font = '32px ' + (this.fontLoaded ? 'Love, cursive' : 'cursive')
            }

            // 添加闪烁光标效果（仅在当前行有内容显示时）
            if (displayChars > 0 && displayChars < line.length && Math.floor(this.textProgress) === charCount + displayChars) {
              const measureText = ctx.measureText(line.text.substring(0, displayChars)).width
              const cursorX = line.align === 'center' ? line.x + measureText / 2 :
                (line.align === 'left' ? line.x + measureText : line.x - measureText / 2)

              if (Math.floor(Date.now() / 300) % 2 === 0) {
                const currentFillStyle = ctx.fillStyle
                ctx.fillStyle = '#e91e63'
                ctx.fillRect(cursorX, line.y - 15, 2, 24)
                ctx.fillStyle = currentFillStyle // 恢复文本颜色
              }
            }

            charCount += line.length
          })
        }
      }

      // 确保动画持续运行，无论是打开还是关闭状态
      this.animationProgress += this.animationSpeed
      // 使用requestAnimationFrame确保呼吸动画持续流畅运行
      this.animationFrame = requestAnimationFrame(() => this.drawEnvelope())
    },

    handleCanvasClick() {
      if (this.animationProgress < 1) return // 动画进行中不响应点击

      this.isOpen = !this.isOpen
      this.animationProgress = 0
      if (!this.isOpen) {
        // 重置文字进度
        this.textProgress = 0
      }
      this.drawEnvelope()
    }
  }
}
</script>

<style scoped>
.envelope-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #ffebee;
  background-image: url('../../public/image/background.png');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.canvas-wrapper {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.canvas-wrapper.scale-up {
  transform: scale(1.2);
}

.envelope-canvas {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.envelope-canvas:hover {
  transform: scale(1.02);
  filter: brightness(1.05);
}

/* 添加简单的点击波纹效果 */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}
</style>