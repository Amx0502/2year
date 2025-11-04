<template>
  <div class="love-animation-container" @click="handleClick">
    <!-- 闪光粒子背景层 -->
    <canvas ref="sparkleCanvas" class="sparkle-canvas"></canvas>
    <!-- 左侧爱心粒子区域 -->
    <div class="left-panel">
      <canvas ref="canvas" class="main-canvas"></canvas>
      <!-- SY文字放在爱心粒子中间 -->
      <div class="box" :style="textStyle">
        {{ anniversaryText }}
      </div>
    </div>

  </div>
</template>

<script>

export default {
  name: 'HelloWorld',

  props: {
    msg: String
  },
  data() {
    return {
      anniversaryText: '怡',
      sparkleAnimationId: null,
      textAnimationId: null,
      anniversaryTimer: null,
      particles: null,
      sparkleParticles: [],
      interactionParticles: [], // 互动粒子数组
      context: null,
      sparkleContext: null,
      image: null,
      time: null,
      particleRate: null,

      Point: null, // Will store the Point class

      textScale: 1,
      textBlur: 20,
      handwritingProgress: 0,
      heartbeatTimer: null,

      // 鼠标位置用于视差效果
      mouseX: 0,
      mouseY: 0,
      // 上次鼠标位置
      lastMouseX: 0,
      lastMouseY: 0,
      // 互动状态
      isHovering: false,
      lastInteractionTime: 0,
      settings: {
        particles: {
          length: 500, // maximum amount of particles
          duration: 2, // particle duration in sec
          velocity: 100, // particle velocity in pixels/sec
          effect: -0.75, // play with this for a nice effect
          size: 30, // particle size in pixels
        },
        sparkle: {
          count: 100, // 闪光粒子数量
          minSize: 1, // 最小粒子大小
          maxSize: 3, // 最大粒子大小
          minSpeed: 0.5, // 最小移动速度
          maxSpeed: 2, // 最大移动速度
          colors: ['#fff', '#ffd700', '#ff69b4', '#87ceeb'] // 闪光颜色
        },
        textAnimation: {
          fadeInDuration: 2000, // 渐显持续时间
          handwritingDuration: 3000, // 手写动画持续时间
          heartbeatInterval: 1500 // 心跳间隔时间
        },

        parallax: {
          speed: 0.02, // 视差速度系数
          easing: 0.08, // 缓动系数，使移动更平滑
          maxDistortion: 20 // 最大偏移距离
        },
        interaction: {
          burstCount: 20, // 每次爆发的粒子数
          maxSize: 8, // 互动粒子最大尺寸
          minSize: 2, // 互动粒子最小尺寸
          maxSpeed: 6, // 最大速度
          minSpeed: 2, // 最小速度
          lifeSpan: 2000, // 粒子生命周期
          colors: ['#ff69b4', '#ff1493', '#c71585', '#ff69b4', '#ff85c0'], // 互动粒子颜色
          cooldown: 300 // 交互冷却时间（毫秒）
        }
      }
    }
  },
  mounted() {
    

    // 使用$nextTick确保DOM已渲染
    this.$nextTick(() => {
      try {
        // 初始化顺序调整，先设置画布尺寸
        this.resizeSparkleCanvas();

        // 然后初始化各个系统
        this.initAnimation();
        this.initSparkleEffect();
        this.initTextAnimation();

        // 最后添加事件监听
        window.addEventListener('resize', this.onResize);
      } catch (error) {
        console.error('Error during component initialization:', error);
      }
    });
  },
  beforeUnmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.sparkleAnimationId) {
      cancelAnimationFrame(this.sparkleAnimationId);
    }
    if (this.textAnimationId) {
      cancelAnimationFrame(this.textAnimationId);
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    window.removeEventListener('resize', this.onResize);
  },
  computed: {
    textStyle() {
      return {
        opacity: this.textOpacity,
        transform: `scale(${this.textScale})`,
        filter: `blur(${this.textBlur}px)`,
        transition: 'transform 0.1s ease'
      };
    },

  },
  methods: {

    handleClick() {
      // 清除动画定时器
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
      if (this.textAnimationId) {
        cancelAnimationFrame(this.textAnimationId);
        this.textAnimationId = null;
      }

      const video = this.$refs.video;
      if (video) {
        // 显示并播放视频
        video.style.display = 'block';
        video.currentTime = 0;
        video.play();

        // 隐藏其他元素
        const canvas = this.$refs.canvas;
        const sparkleCanvas = this.$refs.sparkleCanvas;
        const box = this.$el.querySelector('.box');
        if (canvas) canvas.style.display = 'none';
        if (sparkleCanvas) sparkleCanvas.style.display = 'none';
        if (box) box.style.display = 'none';

        // 3秒后跳转到About页面
        setTimeout(() => {
          this.$router.push('/about');
        }, 3000);
      }
    },
    initSparkleEffect() {
      const sparkleCanvas = this.$refs.sparkleCanvas;
      if (!sparkleCanvas) return;

      this.sparkleContext = sparkleCanvas.getContext('2d');
      this.resizeSparkleCanvas();

      // 创建闪光粒子
      this.sparkleParticles = [];
      const sparkleSettings = this.settings.sparkle;

      for (let i = 0; i < sparkleSettings.count; i++) {
        this.sparkleParticles.push(this.createSparkle());
      }

      // 开始闪光动画
      this.animateSparkles();
    },
    createSparkle() {
      const sparkleSettings = this.settings.sparkle;
      const colors = sparkleSettings.colors;

      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: sparkleSettings.minSize + Math.random() * (sparkleSettings.maxSize - sparkleSettings.minSize),
        speedX: (Math.random() - 0.5) * 2 * sparkleSettings.minSpeed + (Math.random() * (sparkleSettings.maxSpeed - sparkleSettings.minSpeed)),
        speedY: (Math.random() - 0.5) * 2 * sparkleSettings.minSpeed + (Math.random() * (sparkleSettings.maxSpeed - sparkleSettings.minSpeed)),
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.3 + Math.random() * 0.7, // 0.3到1.0的透明度
        life: Math.random() * 50 + 50, // 50到100帧的生命周期
        maxLife: Math.random() * 50 + 50
      };
    },
    animateSparkles() {
      const sparkleCanvas = this.$refs.sparkleCanvas;
      if (!sparkleCanvas || !this.sparkleContext) return;

      // 清除画布
      this.sparkleContext.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

      // 更新和绘制所有闪光粒子
      for (let i = 0; i < this.sparkleParticles.length; i++) {
        const sparkle = this.sparkleParticles[i];

        // 更新位置
        sparkle.x += sparkle.speedX;
        sparkle.y += sparkle.speedY;

        // 更新生命值和透明度
        sparkle.life--;
        sparkle.opacity = (sparkle.life / sparkle.maxLife) * (0.3 + Math.random() * 0.7);

        // 边界检查和重生
        if (sparkle.x < 0 || sparkle.x > sparkleCanvas.width ||
          sparkle.y < 0 || sparkle.y > sparkleCanvas.height ||
          sparkle.life <= 0) {
          this.sparkleParticles[i] = this.createSparkle();
        }

        // 绘制闪光粒子
        this.sparkleContext.save();
        this.sparkleContext.globalAlpha = sparkle.opacity;
        this.sparkleContext.fillStyle = sparkle.color;
        this.sparkleContext.beginPath();
        this.sparkleContext.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
        this.sparkleContext.fill();

        // 添加发光效果
        this.sparkleContext.globalAlpha = sparkle.opacity * 0.5;
        this.sparkleContext.shadowBlur = 10;
        this.sparkleContext.shadowColor = sparkle.color;
        this.sparkleContext.fill();
        this.sparkleContext.restore();
      }

      // 继续下一帧动画
      this.sparkleAnimationId = requestAnimationFrame(() => this.animateSparkles());
    },
    resizeSparkleCanvas() {
      const sparkleCanvas = this.$refs.sparkleCanvas;
      if (sparkleCanvas) {
        sparkleCanvas.width = window.innerWidth;
        sparkleCanvas.height = window.innerHeight;
      }
    },
    initTextAnimation() {
      // 开始渐显动画
      const startTime = Date.now();
      const duration = this.settings.textAnimation.fadeInDuration;

      const fadeInAnimation = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用缓动函数让动画更自然
        const easeProgress = this.easeInOutCubic(progress);

        // 更新透明度和模糊
        this.textOpacity = easeProgress;
        this.textBlur = 20 - (easeProgress * 20);

        // 当渐显完成后开始心跳效果
        if (progress < 1) {
          this.textAnimationId = requestAnimationFrame(fadeInAnimation);
        } else {
          this.startHeartbeatEffect();
        }
      };

      this.textAnimationId = requestAnimationFrame(fadeInAnimation);
    },
    startHeartbeatEffect() {
      // 设置心跳动画定时器
      this.heartbeatTimer = setInterval(() => {
        // 放大阶段
        const scaleUp = () => {
          this.textScale += 0.01;
          if (this.textScale < 1.15) {
            requestAnimationFrame(scaleUp);
          } else {
            // 缩小阶段
            const scaleDown = () => {
              this.textScale -= 0.02;
              if (this.textScale > 1) {
                requestAnimationFrame(scaleDown);
              } else {
                this.textScale = 1;
              }
            };
            requestAnimationFrame(scaleDown);
          }
        };
        requestAnimationFrame(scaleUp);
      }, this.settings.textAnimation.heartbeatInterval);
    },
    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    initAnimation() {
      // Point class - defined as a local function to be used within methods
      const Point = class {
        constructor(x = 0, y = 0) {
          this.x = x;
          this.y = y;
        }
        clone() {
          return new Point(this.x, this.y);
        }
        length(length) {
          if (typeof length === 'undefined') {
            return Math.sqrt(this.x * this.x + this.y * this.y);
          }
          this.normalize();
          this.x *= length;
          this.y *= length;
          return this;
        }
        normalize() {
          const length = this.length();
          this.x /= length;
          this.y /= length;
          return this;
        }
      };

      // Store the Point class in the component instance
      this.Point = Point;

      // Particle class
      class Particle {
        constructor() {
          this.position = new Point();
          this.velocity = new Point();
          this.acceleration = new Point();
          this.age = 0;
        }
        initialize(x, y, dx, dy) {
          this.position.x = x;
          this.position.y = y;
          this.velocity.x = dx;
          this.velocity.y = dy;
          this.acceleration.x = dx * this.settings.particles.effect;
          this.acceleration.y = dy * this.settings.particles.effect;
          this.age = 0;
        }
        update(deltaTime) {
          this.position.x += this.velocity.x * deltaTime;
          this.position.y += this.velocity.y * deltaTime;
          this.velocity.x += this.acceleration.x * deltaTime;
          this.velocity.y += this.acceleration.y * deltaTime;
          this.age += deltaTime;
        }
        draw(context, image) {
          function ease(t) {
            return (--t) * t * t + 1;
          }
          const size = image.width * ease(this.age / this.settings.particles.duration);
          context.globalAlpha = 1 - this.age / this.settings.particles.duration;
          context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
        }
      }

      // Make settings available to classes
      Particle.prototype.settings = this.settings;

      // ParticlePool class
      class ParticlePool {
        constructor(length) {
          this.particles = new Array(length);
          this.firstActive = 0;
          this.firstFree = 0;
          this.duration = this.settings.particles.duration;
          for (let i = 0; i < this.particles.length; i++) {
            this.particles[i] = new Particle();
          }
        }
        add(x, y, dx, dy) {
          this.particles[this.firstFree].initialize(x, y, dx, dy);

          // handle circular queue
          this.firstFree++;
          if (this.firstFree === this.particles.length) this.firstFree = 0;
          if (this.firstActive === this.firstFree) this.firstActive++;
          if (this.firstActive === this.particles.length) this.firstActive = 0;
        }
        update(deltaTime) {
          // update active particles
          if (this.firstActive < this.firstFree) {
            for (let i = this.firstActive; i < this.firstFree; i++) {
              this.particles[i].update(deltaTime);
            }
          }
          if (this.firstFree < this.firstActive) {
            for (let i = this.firstActive; i < this.particles.length; i++) {
              this.particles[i].update(deltaTime);
            }
            for (let i = 0; i < this.firstFree; i++) {
              this.particles[i].update(deltaTime);
            }
          }

          // remove inactive particles
          while (this.particles[this.firstActive].age >= this.duration && this.firstActive !== this.firstFree) {
            this.firstActive++;
            if (this.firstActive === this.particles.length) this.firstActive = 0;
          }
        }
        draw(context, image) {
          // draw active particles
          if (this.firstActive < this.firstFree) {
            for (let i = this.firstActive; i < this.firstFree; i++) {
              this.particles[i].draw(context, image);
            }
          }
          if (this.firstFree < this.firstActive) {
            for (let i = this.firstActive; i < this.particles.length; i++) {
              this.particles[i].draw(context, image);
            }
            for (let i = 0; i < this.firstFree; i++) {
              this.particles[i].draw(context, image);
            }
          }
        }
      }

      // Make settings available to ParticlePool
      ParticlePool.prototype.settings = this.settings;

      const canvas = this.$refs.canvas;
      if (!canvas) return;
      this.context = canvas.getContext('2d');
      this.particles = new ParticlePool(this.settings.particles.length);
      this.particleRate = this.settings.particles.length / this.settings.particles.duration;

      // get point on heart with -PI <= t <= PI
      const pointOnHeart = (t) => {
        return new Point(
          160 * Math.pow(Math.sin(t), 3),
          130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
        );
      };

      // creating the particle image using a dummy canvas
      this.image = (() => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = this.settings.particles.size;
        canvas.height = this.settings.particles.size;
        // helper function to create the path
        const to = (t) => {
          const point = pointOnHeart(t);
          point.x = this.settings.particles.size / 2 + point.x * this.settings.particles.size / 350;
          point.y = this.settings.particles.size / 2 - point.y * this.settings.particles.size / 350;
          return point;
        };
        // create the path
        context.beginPath();
        let t = -Math.PI;
        let point = to(t);
        context.moveTo(point.x, point.y);
        while (t < Math.PI) {
          t += 0.01; // baby steps!
          point = to(t);
          context.lineTo(point.x, point.y);
        }
        context.closePath();
        // create the fill
        context.fillStyle = '#ea80b0';
        context.fill();
        // create the image
        const image = new Image();
        image.src = canvas.toDataURL();
        return image;
      })();

      // 避免循环调用，不再调用onResize()
      // 直接设置画布尺寸
      if (this.$refs.canvas) {
        const canvas = this.$refs.canvas;
        canvas.width = window.innerWidth / 2;
        canvas.height = window.innerHeight;
      }
      this.render();
    },
    render() {
      // next animation frame
      this.animationId = requestAnimationFrame(() => this.render());

      // update time
      const newTime = new Date().getTime() / 1000;
      const deltaTime = newTime - (this.time || newTime);
      this.time = newTime;

      // clear canvas
      if (this.$refs.canvas) {
        this.context.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      }

      // get point on heart with -PI <= t <= PI
      const pointOnHeart = (t) => {
        // Use the Point class stored in the component instance
        const Point = this.Point;
        return new Point(
          160 * Math.pow(Math.sin(t), 3),
          130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
        );
      };

      // create new particles
      const amount = this.particleRate * deltaTime;
      for (let i = 0; i < amount; i++) {
        const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
        const dir = pos.clone().length(this.settings.particles.velocity);

        // 确保粒子从画布中心生成
        if (this.$refs.canvas) {
          this.particles.add(
            this.$refs.canvas.width / 2 + pos.x,
            this.$refs.canvas.height / 2 - pos.y,
            dir.x,
            -dir.y
          );
        }
      }

      // update and draw particles
      this.particles.update(deltaTime);
      this.particles.draw(this.context, this.image);
    },
    onResize() {
      // 获取窗口尺寸
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // 更新主画布尺寸（左侧面板宽度）
      const canvas = this.$refs.canvas;
      if (canvas) {
        canvas.width = this.width / 2; // 左侧面板宽度为窗口的一半
        canvas.height = this.height;
      }

      // 更新闪光粒子画布尺寸
      this.resizeSparkleCanvas();

      // 避免循环调用，不再调用initAnimation()
      // 只清空现有粒子并重置时间，让render方法重新创建粒子
      if (this.particles) {
        // 重置粒子池状态
        this.particles.firstActive = 0;
        this.particles.firstFree = 0;
      }
      this.time = null; // 重置时间，让下一次render重新创建粒子
    }
  }
}
</script>

<style scoped>
/* 确保父容器正确设置 */
.love-animation-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #000;
  overflow: hidden;
  display: flex;
  margin: 0;
  padding: 0;
}

/* 左侧面板 - 爱心粒子和文字 */
.left-panel {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 右侧面板 - 文字和纪念日信息 */
.right-panel {
  width: 50%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

/* 闪光粒子canvas - 背景层 */
.sparkle-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: block;
  z-index: 1;
  /* 背景层 */
}

/* 主爱心粒子canvas - 中间层 */
.main-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: block;
  z-index: 5;
  /* 中间层 */
}

/* 文字样式 */
.box {
  color: #ea80b0;
  font-size: 5rem;
  font-family: STXingkai, 'Microsoft YaHei', sans-serif;
  z-index: 10;
  text-align: center;
  position: absolute;
}

/* GIF边框容器 */
.counter-border-container {
  position: relative;
  display: inline-block;
  z-index: 10;
}

/* GIF边框样式 */
.letter-border {
  position: absolute;
  top: -100px;
  left: -118px;
  right: -30px;
  bottom: -30px;
  width: calc(100% + 260px);
  height: calc(100% + 360px);
  z-index: -1;
  object-fit: contain;
}

/* 纪念日计数器样式 */
.anniversary-counter {
  text-align: center;
  z-index: 10;
  color: #000000;
  transition: opacity 2s ease;
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(1px);
  position: relative;
}

.days-text {
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 1.6rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.days-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 1px #ffd700, 0 0 20px #ffd700;
  display: block;
  margin: 10px 0;
  white-space: nowrap;
}

.key-date {
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 1rem;
  color: #87ceeb;
  text-shadow: 0 0 5px #87ceeb;
  margin-top: 15px;
}

.key-date-content {
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 视频样式 - 全屏覆盖 */
.video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 20;
}

/* 书籍翻页组件样式 */
.book-section {
  margin-top: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 确保移动设备上的响应式布局 */
@media (max-width: 768px) {
  .book-section {
    margin-top: 30px;
    padding: 10px 0;
  }
}

/* 为书籍区域添加背景，使其更加突出 */
.book-section {
  background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(250, 208, 196, 0.1) 100%);
  border-radius: 20px;
  margin-bottom: 50px;
}
</style>
