<!-- c:\Users\ASUS\Desktop\2year\src\components\Start.vue -->
<template>
  <div class="start-overlay" v-if="isLoading">
    <div class="loading-text">Loading...</div>
    <div ref="canvasContainer" class="canvas-container"></div>
  </div>
</template>

<script>
import * as THREE from 'three'

export default {
  name: 'Start',
  data() {
    return {
      isLoading: true,
      scene: null,
      camera: null,
      renderer: null,
      bookMesh: null,
      pages: []
    }
  },
  mounted() {
    this.initThree()
    this.animate()
    // 模拟加载完成后触发翻页动画
    setTimeout(() => {
      this.startFlipAnimation()
    }, 2000)
  },
  methods: {
    initThree() {
      // 初始化 Three.js 场景
      const container = this.$refs.canvasContainer
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setPixelRatio(window.devicePixelRatio)
      container.appendChild(this.renderer.domElement)
      
      // 创建书本 3D 模型
      this.createBook()
      
      // 设置相机位置
      this.camera.position.z = 5
      
      // 添加光照
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      this.scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(5, 5, 5)
      this.scene.add(directionalLight)
    },
    createBook() {
      // 创建书本几何体
      const bookGeometry = new THREE.BoxGeometry(3, 4, 0.2)
      const bookMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.7,
        metalness: 0.1
      })
      this.bookMesh = new THREE.Mesh(bookGeometry, bookMaterial)
      this.scene.add(this.bookMesh)
      
      // 创建书页
      for (let i = 0; i < 10; i++) {
        const pageGeometry = new THREE.PlaneGeometry(2.8, 3.8)
        const pageMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xFFFEF0,
          side: THREE.DoubleSide
        })
        const page = new THREE.Mesh(pageGeometry, pageMaterial)
        page.position.z = 0.15 + (i * 0.01)
        this.pages.push(page)
        this.scene.add(page)
      }
    },
    animate() {
      requestAnimationFrame(this.animate)
      
      // 书本旋转动画
      if (this.bookMesh) {
        this.bookMesh.rotation.y += 0.005
      }
      
      this.renderer.render(this.scene, this.camera)
    },
    startFlipAnimation() {
      // 触发从最后一页翻到第一页的动画
      // 这里需要与 Book.vue 中的 turn.js 进行交互
      this.$emit('start-flip-animation')
      
      // 淡出加载画面
      setTimeout(() => {
        this.isLoading = false
        this.$emit('animation-complete')
      }, 3000)
    }
  },
  beforeDestroy() {
    // 清理 Three.js 资源
    if (this.renderer) {
      this.renderer.dispose()
    }
  }
}
</script>

<style scoped>
.start-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #fff;
  font-size: 24px;
  margin-bottom: 20px;
  font-family: 'Arial', sans-serif;
  letter-spacing: 2px;
}

.canvas-container {
  width: 100%;
  height: 60%;
}
</style>