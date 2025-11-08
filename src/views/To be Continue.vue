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
      videoSrc1: '/video/ToBeContinue.mp4',
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
  background-color: #000;
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
  object-fit: cover;
  /* 确保视频内容完全填充A4竖屏 */
  min-width: 100%;
  min-height: 100%;
  /* 居中处理，确保重要内容显示 */
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  /* 动态调整视频尺寸以适应A4比例（210mm × 297mm，约1:1.414） */
  aspect-ratio: 210/297;
  max-width: none;
  max-height: none;
}

</style>