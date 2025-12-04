<template>
  <div class="four-container">
    <div class="image-container">
      <video ref="firstVideo" class="top-image" :src="videoSrc1" autoplay muted @ended="handleFirstVideoEnded"></video>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Say',
  data() {
    return {
      videoSrc1: '/image/cat-black.mp4',
    }
  },
  methods: {
    handleFirstVideoEnded() {
      // First video ended, start playing the second video
      const secondVideo = this.$refs.sayVideo;
      if (secondVideo) {
        secondVideo.play();
      }
    },
  }
}
</script>

<style scoped>
.four-container {
  display: flex;
  height: 100vh;
  background-color: #fcfafc;
}

.image-container {
  width: 100%;
  display: flex;
  align-items: center;
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