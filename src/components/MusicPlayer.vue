<template>
    <div class="music-player">
        <div id="aplayer-container"></div>
    </div>
</template>

<script>
import '../js/APlayer.min.css'
import APlayer from '../js/APlayer.min.js'

export default {
    name: 'MusicPlayer',
    data() {
        return {
            player: null
        }
    },
    mounted() {
        // 简化初始化，确保依赖正确加载
        this.$nextTick(() => {

            this.initPlayer()
        })
    },
    methods: {
        initPlayer() {
            try {
                // 简化播放器配置，使用有效的示例音频
                this.player = new APlayer({
                    container: document.getElementById('aplayer-container'),
                    autoPlay: true,
                    fixed: true,
                    loop: 'all',
                    volume: 0.8,
                    preload: 'auto',
                    // 启用歌词显示
                    lrcType: 3, // 3表示从lrc文件加载歌词
                    audio: [
                        {
                            name: '我的',
                            artist: '王俊凯',
                            // 使用示例音频文件URL，实际项目中替换为真实的音频文件路径
                            url: '/audio/my.mp3',
                            cover: '/audio/music.png',
                            // 添加歌词文件路径
                            lrc: '/audio/my.lrc'
                        }
                    ]
                })

                // 尝试直接显示歌词
                setTimeout(() => {
                    if (this.player && this.player.lrc) {
                        this.player.template.lrcButton.click();
                    }
                    
                    // 添加艺术家点击跳转到gclove.html的功能
                    if (this.player && this.player.template) {
                        const artistElement = this.player.template.author;
                        if (artistElement && artistElement.textContent.includes('王俊凯')) {
                            artistElement.style.cursor = 'pointer';
                            artistElement.addEventListener('click', () => {
                                window.open('/gclove.html', '_blank');
                            });
                        }
                    }
                }, 1000)

                // 移除可能导致问题的可视化代码，确保播放器基本功能正常
            } catch (error) {
                console.error('播放器初始化失败:', error)
            }
        }
    },
    beforeUnmount() {
        // 安全地清理播放器实例
        try {
            if (this.player && typeof this.player.destroy === 'function') {
                this.player.destroy()
                this.player = null
            }
        } catch (error) {
            console.warn('播放器清理失败:', error)
        }
    }
}
</script>

<style scoped>
.music-player {
    /* margin: 20px auto; */
    max-width: 800px;
}

#aplayer-container {
    width: 100%;
}
</style>