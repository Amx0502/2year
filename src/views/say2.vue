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
      videoSrc1: '/image/nineteen-↑.mp4',
      videoSrc2: '/image/say2.mp4',
      isVisible: false,
      hasPlayed: false
    }
  },
  mounted() {
    this.setupVisibilityObserver()
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
  },
  methods: {
    setupVisibilityObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasPlayed) {
            this.isVisible = true
            this.hasPlayed = true
            this.$nextTick(() => {
              const firstVideo = this.$refs.firstVideo
              if (firstVideo) {
                firstVideo.play().catch(e => console.log('Video play failed:', e))
              }
            })
          }
        })
      }, { threshold: 0.5 })
      
      this.observer.observe(this.$el)
    },
    handleVideoLoaded() {
      // Video loaded but waiting to play
    },
    handleFirstVideoEnded() {
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
  justify-content: flex-start; /* 左对齐 */
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