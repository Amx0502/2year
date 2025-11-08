<template>
  <div class="eighteen-container">
    <div class="image-container">
      <video ref="firstVideo" class="top-image" :src="videoSrc1" autoplay muted @ended="handleFirstVideoEnded"></video>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToBeContinue',
  data() {
    return {
      videoSrc1: '/video/InTheEnd.mp4',
    }
  },
  methods: {
    // 监听视频播放时间，在接近结束时停止
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
.eighteen-container {
  height: 100vh;
  background-color: #ffffff;
  overflow: hidden;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.top-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

</style>