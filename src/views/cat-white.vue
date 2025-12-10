<template>
  <div class="four-container">
    <div class="image-container">
      <video ref="firstVideo" class="top-image" :src="videoSrc1" autoplay muted loop></video>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Say',
  data() {
    return {
      videoSrc1: '/image/cat-white.mp4',
    }
  },
  methods: {
    // 视频已设置loop属性，无需额外处理
  }
}
</script>

<style scoped>
.four-container {
  display: flex;
  background-color: #0d97ed;
}

.image-container {
  width: 100%;
  display: flex;
}

.top-image {
  width: 100%;
  height: 100%;
}
</style>