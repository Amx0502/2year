<template>
  <div class="four-container">
      <div class="image-container">
        <img
          class="top-image"
          src="/image/six-↑.png"
          alt="Top Image"
        >
      </div>
      <div class="video-container">
        <video
          ref="sayVideo"
          class="background-video"
          :src="videoSrc"
          autoplay
          muted
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: rgb(255, 255, 255);
}

.image-container {
  height: 50vh;
  width: 100%;
  display: flex;
  align-items: left;
  padding: 40px;
}

.top-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;

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