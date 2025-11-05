<template>
    <div class="heart-animation-container">
        <div class="petal-container">
            <div class="petal" v-for="n in 10" :key="n"></div>
        </div>
        <div class="stage" id="stage" ref="stage" @mousemove="handleMouseMove">
            <div class="center-title" id="title" @click="play" style="transition: opacity 0.5s ease;">
                for you ♥怡
                <div class="click-hint" id="clickHint"
                    style="margin-left: 100px;margin-top: 20px; font-size: 14px; color: rgba(255, 105, 180, 0.8); opacity: 0.9; font-weight: normal; animation: hintPulse 2s ease-in-out infinite; transition: opacity 0.5s ease;">
                    请点击</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HeartAnimation',
    data() {
        return {
            tips: [
                '你的古板', '你的家人', '你的经历', '你是我的心动', '你的情感',
                '你的拧巴', '你的家乡', '你的缺点', '你的灵动', '有你真好',
                '你是独一无二的光', '遇见你是浪漫的开始', '你的喜好', '你的笑融化星河',
                '想陪你看星星', '你的朋友', '你的血型', '你是人间的奇迹', '你的腼腆',
                '你的名字', '想你成习惯了', '你的性格', '你的不堪', '你的温柔让我沦陷',
                '你的样子', '你的嘴巴', '想成为你的例外', '你的开朗', '你是我梦里的光',
                '想和你看海', '此刻的风想你', '你的人格', '你的鼻子', '你的心跳',
                '想靠近你一点', '你的耳朵', '你的眼睛', '你的难过', '你的微笑',
                '你的美丽', '你的星座', '你的体面', '你的生气', '你的浪漫', '你的固执',
            ],
            directions: [
                { dx: '0vw', dy: '-80vh' }, { dx: '0vw', dy: '80vh' },
                { dx: '-80vw', dy: '0vh' }, { dx: '80vw', dy: '0vh' },
                { dx: '-70vw', dy: '-70vh' }, { dx: '70vw', dy: '-70vh' },
                { dx: '-70vw', dy: '70vh' }, { dx: '70vw', dy: '70vh' },
                { dx: '0vw', dy: '-60vh' }, { dx: '0vw', dy: '60vh' },
                { dx: '-60vw', dy: '0vh' }, { dx: '60vw', dy: '0vh' }
            ],
            isHeartLocked: false,
            timers: []
        }
    },
    // 移除自动播放，改为点击触发
    beforeUnmount() {
        // 清理定时器
        this.timers.forEach(timer => clearTimeout(timer));
    },
    beforeUnmount() {
        // 清理定时器
        this.timers.forEach(timer => clearTimeout(timer));
    },
    methods: {
        handleMouseMove(e) {
            if (!this.isHeartLocked) {
                return;
            }

            const w = window.innerWidth;
            const h = window.innerHeight;
            const x = (e.clientX - w / 2) / w;
            const y = (e.clientY - h / 2) / h;

            const tiltX = y * -12;
            const tiltY = x * 12;

            this.$refs.stage.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        },
        rand(min, max) {
            return Math.random() * (max - min) + min;
        },
        randomGradient() {
            const arr = [
                ['#ff758c', '#ff7eb3'], ['#a18cd1', '#fbc2eb'],
                ['#f6d365', '#fda085'], ['#84fab0', '#8fd3f4'],
                ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
                ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'],
                ['#30cfd0', '#330867'], ['#5ee7df', '#b490ca']
            ];
            const [c1, c2] = arr[Math.floor(Math.random() * arr.length)];
            return `linear-gradient(135deg,${c1},${c2})`;
        },
        heartXY(t) {
            const s = 16;
            const x = s * (16 * Math.sin(t) ** 3);
            const y = -s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            return { x: x + 'px', y: y + 'px' };
        },
        createMsg(i, total) {
            const el = document.createElement('div');
            el.className = 'msg';

            const d = this.directions[Math.floor(Math.random() * this.directions.length)];
            el.style.setProperty('--dx', d.dx);
            el.style.setProperty('--dy', d.dy);
            el.style.setProperty('--rot', this.rand(-55, 55) + 'deg');
            el.style.setProperty('--dur', (this.rand(6.8, 8.6)) + 's');
            el.style.setProperty('--delay', (i * 0.11 + this.rand(0, 0.35)) + 's');
            el.style.setProperty('--bg', this.randomGradient());

            const t = (i / total) * Math.PI * 2;
            const { x, y } = this.heartXY(t);
            el.style.setProperty('--heart-x', x);
            el.style.setProperty('--heart-y', y);
            el.style.setProperty('--heart-rot', this.rand(-18, 18) + 'deg');

            const span = document.createElement('span');
            span.className = 'text';
            span.textContent = this.tips[Math.floor(Math.random() * this.tips.length)];
            el.appendChild(span);

            const delay = parseFloat(el.style.getPropertyValue('--delay'));
            const dur = parseFloat(el.style.getPropertyValue('--dur'));
            const switchAt = delay + dur * 0.86;

            const switchTimer = setTimeout(() => {
                el.classList.add('heart-mode');
            }, switchAt * 1000);
            this.timers.push(switchTimer);

            el.addEventListener('animationend', () => {
                clearTimeout(switchTimer);
                el.classList.add('heart-mode', 'locked', 'pulse');

                const spread = this.rand(140, 260);
                const ang = this.rand(0, Math.PI * 2);
                const bx = Math.cos(ang) * spread;
                const by = Math.sin(ang) * spread;
                el.style.setProperty('--bx', bx + 'px');
                el.style.setProperty('--by', by + 'px');
            }, { once: true });

            this.$refs.stage.appendChild(el);
        },
        finalBurst() {
            this.isHeartLocked = false;
            this.$refs.stage.style.transform = 'rotateX(0deg) rotateY(0deg)';

            const lockedMessages = this.$refs.stage.querySelectorAll('.msg.locked');
            lockedMessages.forEach(el => {
                // el.classList.remove('pulse');
                const jitter = this.rand(0, 200);
                const burstTimer = setTimeout(() => el.classList.add('burst'), jitter);
                this.timers.push(burstTimer);

                // el.addEventListener('animationend', () => el.remove(), { once: true });
            });
        },
        play() {
            if (this.$refs.backgroundMusic) {
                this.$refs.backgroundMusic.play().catch(e => console.warn("Autoplay was blocked by browser."));
            }

            this.isHeartLocked = false;
            this.$refs.stage.style.transform = 'rotateX(0deg) rotateY(0deg)';

            // 清理定时器
            this.timers.forEach(timer => clearTimeout(timer));
            this.timers = [];

            // 移除旧消息
            const oldMessages = this.$refs.stage.querySelectorAll('.msg');
            oldMessages.forEach(n => n.remove());

            const title = document.getElementById('title');
            const hint = document.getElementById('clickHint');
            // 先设置为0实现渐隐效果
            title.style.opacity = 0;
            // 隐藏提示文字 - 使用opacity实现平滑过渡
            if (hint) {
                hint.style.opacity = 0;
                // 等过渡完成后再设置display:none完全隐藏（可选）
                setTimeout(() => {
                    hint.style.display = 'none';
                }, 500);
            }

            // 等待渐隐完成后再创建消息
            setTimeout(() => {
                const TOTAL = 100;
                for (let i = 0; i < TOTAL; i++) {
                    this.createMsg(i, TOTAL);
                }

                // 创建消息后等待一段时间再让标题渐现
                const titleTimer = setTimeout(() => {
                    // 初始化标题内容为空
                    title.innerHTML = '<span></span><span style="display: block; margin-top: 10px;"></span>';
                    title.style.opacity = 1;
                    
                    // 定义要显示的文本内容
                    const text1 = '我会!';
                    const text2 = '喜欢你的全部';
                    const allText = text1 + text2;
                    
                    // 获取两个span元素
                    const span1 = title.querySelector('span:first-child');
                    const span2 = title.querySelector('span:last-child');
                    
                    // 生成从浅粉到深粉的颜色数组
                    function generatePinkColors(count) {
                        const colors = [];
                        for (let i = 0; i < count; i++) {
                            // 计算从浅粉到深粉的渐变值
                            // RGB值从粉色系渐变: 浅粉(#FFC0CB)到深粉(#FF1493)
                            const r = 255; // 红色保持最大值
                            const g = Math.floor(192 - (192 - 20) * (i / (count - 1))); // 绿色渐变
                            const b = Math.floor(203 - (203 - 147) * (i / (count - 1))); // 蓝色渐变
                            colors.push(`rgb(${r}, ${g}, ${b})`);
                        }
                        return colors;
                    }
                    
                    const colors = generatePinkColors(allText.length);
                    
                    // 打字机动画函数
                    let index1 = 0;
                    let index2 = 0;
                    let phase = 1; // 1: 正在打第一行, 2: 正在打第二行
                    let colorIndex = 0;
                    
                    function typewriter() {
                        if (phase === 1) {
                            if (index1 < text1.length) {
                                // 使用span包裹每个文字并设置不同颜色
                                const charSpan = document.createElement('span');
                                charSpan.textContent = text1.charAt(index1);
                                charSpan.style.color = colors[colorIndex];
                                span1.appendChild(charSpan);
                                
                                index1++;
                                colorIndex++;
                                setTimeout(typewriter, 100); // 每个字200ms
                            } else {
                                phase = 2;
                                setTimeout(typewriter, 200); // 第一行完成后停顿500ms
                            }
                        } else if (phase === 2) {
                            if (index2 < text2.length) {
                                // 使用span包裹每个文字并设置不同颜色
                                const charSpan = document.createElement('span');
                                charSpan.textContent = text2.charAt(index2);
                                charSpan.style.color = colors[colorIndex];
                                span2.appendChild(charSpan);
                                
                                index2++;
                                colorIndex++;
                                setTimeout(typewriter, 100); // 每个字200ms
                            }
                        }
                    }
                    
                    // 开始打字机动画
                    typewriter();
                    
                    // 隐藏提示文字，不再显示
                    const hint = document.getElementById('clickHint');
                    if (hint) {
                        hint.style.display = 'none';
                    }
                }, 200);
                this.timers.push(titleTimer);
            }, 300); // 等待500ms以匹配CSS过渡时间

            const TOTAL_TIME_MS = (8.6 + 0.35 + 0.3 + 2.2) * 1000;

            const lockStartTime = TOTAL_TIME_MS - 2200;
            const lockTimer = setTimeout(() => {
                this.isHeartLocked = true;
            }, lockStartTime);
            this.timers.push(lockTimer);

            const burstTimer = setTimeout(() => {
                this.finalBurst();
            }, TOTAL_TIME_MS);
            this.timers.push(burstTimer);
        }
    }
}
</script>
<style scoped>
.heart-animation-container {
    position: relative;
    width: 100%;
    height: 100%;
    background:
        radial-gradient(1200px 600px at 50% 45%, rgba(255, 255, 255, .65), rgba(255, 255, 255, 0) 60%),
        radial-gradient(circle at 50% 45%, #fff4f7 0%, #c9eaff 100%);
}
</style>

<style>
.stage {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.2s ease-out;
}

.msg {
    position: absolute;
    left: 50%;
    top: 50%;
    padding: 10px 16px;
    border-radius: 16px;
    color: #fff;
    font-weight: 700;
    font-size: clamp(14px, 3vmin, 22px);
    text-shadow: 0 2px 8px rgba(0, 0, 0, .28);
    opacity: 0;
    transform:
        translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(.75) rotate(var(--rot));
    animation: flight var(--dur) cubic-bezier(.25, .7, .3, 1) var(--delay) both;
    box-shadow: 0 8px 26px rgba(0, 0, 0, .22), 0 0 15px rgba(255, 255, 255, 0.6);
    will-change: transform, opacity;
    background: var(--bg);
    transition: color .3s ease, text-shadow .3s ease;
}

@keyframes flight {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(.75) rotate(var(--rot));
    }

    18% {
        opacity: 1;
    }

    45% {
        transform: translate(-50%, -50%) translate(calc(var(--dx)*.2), calc(var(--dy)*.2)) scale(1.06);
    }

    70% {
        transform: translate(-50%, -50%) translate(calc(var(--dx)*1.15), calc(var(--dy)*1.15)) scale(.95) rotate(var(--rot));
    }

    88% {
        transform: translate(-50%, -50%) translate(calc(var(--heart-x)*.6), calc(var(--heart-y)*.6)) scale(.9) rotate(var(--heart-rot));
    }

    100% {
        opacity: 1;
        transform: translate(-50%, -50%) translate(var(--heart-x), var(--heart-y)) scale(1) rotate(var(--heart-rot));
    }
}

.msg::before,
.msg::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    background: inherit;
    border-radius: 50px 50px 0 0;
    width: 22px;
    height: 34px;
    opacity: 0;
    transition: opacity .28s ease;
    transform-origin: 0 100%;
    transform: rotate(-45deg);
}

.msg::after {
    left: 0;
    transform-origin: 100% 100%;
    transform: rotate(45deg);
}

.msg.heart-mode {
    color: transparent;
    text-shadow: none;
}

.msg.heart-mode::before,
.msg.heart-mode::after {
    opacity: 1;
}

.msg.locked {
    animation: none;
    transform: translate(-50%, -50%) translate(var(--heart-x), var(--heart-y)) scale(1) rotate(var(--heart-rot));
    opacity: 1;
}

.msg.locked.pulse {
    animation: pulse 2.2s ease-in-out 1;
}

@keyframes pulse {

    0%,
    100% {
        transform: translate(-50%, -50%) translate(var(--heart-x), var(--heart-y)) scale(1);
    }

    50% {
        transform: translate(-50%, -50%) translate(var(--heart-x), var(--heart-y)) scale(1.08);
    }
}

.msg.burst {
    animation: burst 1.4s cubic-bezier(.17, .6, .2, 1) forwards;
}

@keyframes burst {
    0% {
        opacity: 1;
        transform: translate(-50%, -50%) translate(var(--heart-x), var(--heart-y)) scale(1);
        filter: blur(0);
    }

    70% {
        opacity: .9;
        transform:
            translate(-50%, -50%) translate(calc(var(--heart-x) + var(--bx)*0.7), calc(var(--heart-y) + var(--by)*0.7)) scale(1.1) rotate(var(--rot));
        filter: blur(.3px);
    }

    100% {
        opacity: 0;
        transform:
            translate(-50%, -50%) translate(calc(var(--heart-x) + var(--bx)), calc(var(--heart-y) + var(--by))) scale(2.0) rotate(var(--rot));
        filter: blur(4px);
    }
}

.center-title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-weight: 800;
    letter-spacing: .12em;
    font-size: clamp(18px, 4vmin, 28px);
    color: rgba(255, 105, 180, .8);
    text-shadow: 0 2px 10px rgba(255, 105, 180, .3);
    opacity: 1;
    cursor: pointer;
    animation: titlePulse 2s ease-in-out infinite;
    user-select: none;
}

.center-title:hover {
    color: rgba(255, 105, 180, 1);
    text-shadow: 0 2px 15px rgba(255, 105, 180, .5);
    transform: translate(-50%, -50%) scale(1.05);
    transition: all 0.3s ease;
}

@keyframes titlePulse {

    0%,
    100% {
        transform: translate(-50%, -50%) scale(1);
    }

    50% {
        transform: translate(-50%, -50%) scale(1.02);
    }
}

@keyframes hintPulse {

    0%,
    100% {
        opacity: 0.6;
        transform: translateX(-50%) scale(1);
    }

    50% {
        opacity: 1;
        transform: translateX(-50%) scale(1.05);
    }
}

@keyframes titleIn {
    from {
        opacity: 0;
        transform: translate(-50%, -55%);
    }

    to {
        opacity: .95;
        transform: translate(-50%, -50%);
    }
}

.replay {
    position: absolute;
    right: 18px;
    bottom: 18px;
    padding: 10px 14px;
    border: none;
    border-radius: 10px;
    background: rgba(255, 255, 255, .5);
    backdrop-filter: blur(8px);
    color: #222;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 5px 20px rgba(0, 0, 0, .22);
    z-index: 1000;
}

.petal-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
}

.petal {
    position: absolute;
    top: -10vh;
    width: 15px;
    height: 15px;
    background: #ffb6c1;
    border-radius: 1px 15px 15px;
    opacity: 0;
    filter: blur(1px);
}

.petal:nth-child(odd) {
    animation: flutter 14s linear infinite;
}

.petal:nth-child(even) {
    animation: flutter-reverse 14s linear infinite;
}

.petal:nth-child(1) {
    left: 10%;
    animation-delay: -2s;
}

.petal:nth-child(2) {
    left: 20%;
    animation-delay: -8s;
    animation-duration: 15s;
}

.petal:nth-child(3) {
    left: 30%;
    animation-delay: -4s;
    animation-duration: 13s;
}

.petal:nth-child(4) {
    left: 40%;
    animation-delay: -10s;
}

.petal:nth-child(5) {
    left: 50%;
    animation-delay: -1s;
    animation-duration: 16s;
}

.petal:nth-child(6) {
    left: 60%;
    animation-delay: -12s;
}

.petal:nth-child(7) {
    left: 70%;
    animation-delay: -6s;
    animation-duration: 12s;
}

.petal:nth-child(8) {
    left: 80%;
    animation-delay: -14s;
}

.petal:nth-child(9) {
    left: 90%;
    animation-delay: -7s;
    animation-duration: 17s;
}

.petal:nth-child(10) {
    left: 95%;
    animation-delay: -3s;
}

@keyframes flutter {
    0% {
        transform: translateY(-10vh) translateX(0) rotate(0deg) rotateY(0deg);
        opacity: 0;
    }

    10% {
        opacity: 0.8;
    }

    50% {
        transform: translateY(50vh) translateX(5vw) rotate(-20deg) rotateY(180deg);
    }

    90% {
        opacity: 0.8;
    }

    100% {
        transform: translateY(110vh) translateX(-5vw) rotate(20deg) rotateY(360deg);
        opacity: 0;
    }
}

@keyframes flutter-reverse {
    0% {
        transform: translateY(-10vh) translateX(0) rotate(0deg) rotateY(0deg);
        opacity: 0;
    }

    10% {
        opacity: 0.8;
    }

    50% {
        transform: translateY(50vh) translateX(-5vw) rotate(20deg) rotateY(-180deg);
    }

    90% {
        opacity: 0.8;
    }

    100% {
        transform: translateY(110vh) translateX(5vw) rotate(-20deg) rotateY(-360deg);
        opacity: 0;
    }
}

.logo {
    position: absolute;
    bottom: 20px;
    left: 20px;
    z-index: 100;
    text-align: center;
    animation: logoBreathe 3s ease-in-out infinite;
}

.logo img {
    width: 100px;
    height: auto;
    border-radius: 50%;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7));
}

.logo p {
    margin: 5px 0 0 0;
    color: #3935a9;
    font-family: 'STKaiti', 'KaiTi', 'SimSun', 'serif';
    font-weight: bold;
    font-size: 16px;
    text-shadow: 0 0 8px rgba(255, 182, 193, 0.9);
}

@keyframes logoBreathe {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}
</style>