<template>
  <div class="four-container">
    <div class="image-container">
      <video ref="firstVideo" class="top-image" :src="videoSrc1" :autoplay="isVisible" muted @ended="handleFirstVideoEnded"></video>
    </div>
    <div class="video-container">
      <video ref="sayVideo" class="background-video" :src="videoSrc2" muted @loadeddata="handleVideoLoaded"
        @ended="handleVideoEnded">
      </video>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Say',
  data() {
    return {
      videoSrc1: '/image/six-↑.mp4',
      videoSrc2: '/image/say.mp4',
      isVisible: false,
      hasPlayed: false
    }
  },
  mounted() {
    // 使用 Intersection Observer 检测组件是否可见
    this.setupVisibilityObserver()
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
  },
  methods: {
    setupVisibilityObserver() {
      // 检测组件是否在视口中可见
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasPlayed) {
            this.isVisible = true
            this.hasPlayed = true
            // 开始播放第一个视频
            this.$nextTick(() => {
              const firstVideo = this.$refs.firstVideo
              if (firstVideo) {
                firstVideo.play().catch(e => console.log('Video play failed:', e))
              }
            })
          }
        })
      }, {
        threshold: 0.5 // 至少50%可见时才触发
      })
      
      this.observer.observe(this.$el)
    },
    handleVideoLoaded() {
      // Video loaded but waiting to play
    },
    handleFirstVideoEnded() {
      // First video ended, start playing the second video
      const secondVideo = this.$refs.sayVideo;
      if (secondVideo) {
        secondVideo.play().catch(e => console.log('Video play failed:', e));
      }
    },
    handleVideoEnded() {
      // Keep video on last frame
      const video = this.$refs.sayVideo;
      if (video) {
        video.pause();
        // Set currentTime to near end to ensure last frame is shown
        video.currentTime = video.duration - 0.1;
      }
    }
  }
}
</script>

<style scoped>
.four-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #fcfafc;
  overflow: hidden;
  gap: 0; /* 确保没有间隙 */
}

.image-container {
  flex: 0 0 40%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end; /* 底部对齐 */
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.top-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block; /* 移除图片底部间隙 */
}

.video-container {
  flex: 0 0 60%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 顶部对齐 */
  overflow: hidden;
  margin: 0;
  padding: 0;
  background-color: black;
}

.background-video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block; /* 移除视频底部间隙 */
}
</style>