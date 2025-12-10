<template>
  <div class="four-container">
    <div class="image-container" ref="firstVideoContainer">
      <video ref="firstVideo" class="top-image" :src="videoSrc1" autoplay muted @ended="handleFirstVideoEnded"></video>
    </div>
    <div class="video-container" ref="secondVideoContainer">
      <video ref="sayVideo" class="top-image" :src="videoSrc2" muted loop></video>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Say',
  data() {
    return {
      videoSrc1: '/image/cat-black.mp4',
      videoSrc2: '/image/cat-black2.mp4',
    }
  },
  methods: {
    handleFirstVideoEnded() {
      // 视频1播放结束，隐藏视频1容器
      const firstContainer = this.$refs.firstVideoContainer;
      if (firstContainer) {
        firstContainer.style.display = 'none';
      }
      
      // 显示视频2容器并开始播放
      const secondContainer = this.$refs.secondVideoContainer;
      if (secondContainer) {
        secondContainer.style.display = 'block';
      }
      
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
  position: relative;
  height: 100vh;
  background-color: #0d97ed;
  overflow: hidden;
}

.image-container,
.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-container {
  display: none; /* 初始隐藏视频2 */
}

.top-image {
  width: 100%;
  height: 100%;
}
</style>