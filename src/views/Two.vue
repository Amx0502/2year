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
      videoSrc: '/image/prologue.mp4'
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
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
  background-color: rgb(255, 235, 238);
}

.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>