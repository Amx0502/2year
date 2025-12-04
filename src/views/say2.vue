<template>
  <div class="four-container">
    <div class="image-container">
      <video ref="firstVideo" class="top-image" :src="videoSrc1" autoplay muted @ended="handleFirstVideoEnded"></video>
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
    }
  },
  methods: {
    handleVideoLoaded() {
      // Video loaded but waiting to play
    },
    handleFirstVideoEnded() {
      // First video ended, start playing the second video
      const secondVideo = this.$refs.sayVideo;
      if (secondVideo) {
        secondVideo.play();
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
  height: 100vh;
  background-color: #fcfafc;
}

.image-container {
  height: 50vh;
  width: 100%;
  display: flex;
  align-items: left;
}

.top-image {
  width: 100%;
  height: 100%;
}

.video-container {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.background-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  margin-right: 3px;
}
</style>