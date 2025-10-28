<template>
  <div class="four-container">
    <!-- Video background -->
    <div class="video-container">
      <video
        ref="sayVideo"
        class="background-video"
        :src="videoSrc"
        autoplay
        muted
        playsinline
        @loadeddata="handleVideoLoaded"
        @ended="handleVideoEnded"
      >
      </video>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Four',
  data() {
    return {
      videoSrc: '/image/say.mp4'
    }
  },
  methods: {
    handleVideoLoaded() {
      // Video loaded and started playing
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
  min-height: 105vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;  /* 为视频容器提供定位上下文 */
  background-color: rgba(255, 255, 255);
}

.background-video {
  width: 100%;
  height: 100%;
  object-fit: cover;  /* 保持视频比例并覆盖整个容器 */
}
</style>