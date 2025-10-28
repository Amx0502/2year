<template>
  <div id="love-tree-container">
    <div id="main">
      <div id="wrap">
        <div id="text">
          <div id="code" ref="code">
            <span class="say" style="margin-right: 260px;">┏</span><br>
            <span class="say">谨以此书</span><br>
            <span class="say">献给</span><br>
            <span class="say">最亲爱的你</span><br>
            <span class="say" style="margin-left: 270px;">┛</span>
            <br>
          </div>
        </div>
        <canvas ref="canvas" width="1100" height="680" @click="handleCanvasClick" @mousemove="handleCanvasMouseMove"
          :class="{ hand: isHand }"></canvas>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: 'LoveTree',
  data() {
    return {
      isHand: false,
      tree: null,
      seed: null,
      foot: null,
      hold: 1,
      width: 1100,
      height: 680,
      opts: {
        seed: {
          x: 1100 / 2 - 20,
          color: "rgb(190, 26, 37)",
          scale: 2
        },
        branch: [
          [535, 680, 570, 250, 500, 200, 30, 100, [
            [540, 500, 455, 417, 340, 400, 13, 100, [
              [450, 435, 434, 430, 394, 395, 2, 40]
            ]],
            [550, 445, 600, 356, 680, 345, 12, 100, [
              [578, 400, 648, 409, 661, 426, 3, 80]
            ]],
            [539, 281, 537, 248, 534, 217, 3, 40],
            [546, 397, 413, 247, 328, 244, 9, 80, [
              [427, 286, 383, 253, 371, 205, 2, 40],
              [498, 345, 435, 315, 395, 330, 4, 60]
            ]],
            [546, 357, 608, 252, 678, 221, 6, 100, [
              [590, 293, 646, 277, 648, 271, 2, 80]
            ]]
          ]]
        ],
        bloom: {
          num: 700,
          width: 1080,
          height: 650,
        },
        footer: {
          width: 1200,
          height: 5,
          speed: 10,
        }
      },
      clockTimer: null
    }
  },
  mounted() {
    this.initCanvas();
    this.initObjects();
    this.runAnimation();
  },
  beforeUnmount() {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas;
      this.width = canvas.width;
      this.height = canvas.height;
      this.opts.seed.x = this.width / 2 - 20; // 修改为完全居中
    },
    initObjects() {
      // 初始化所有类和对象
      this.initClasses();
      this.tree = new Tree(this.$refs.canvas, this.width, this.height, this.opts);
      this.seed = this.tree.seed;
      this.foot = this.tree.footer;
    },
    initClasses() {
      // 定义所有需要的类
      // 数学辅助函数
      window.random = function (min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
      }

      window.bezier = function (cp, t) {
        const p1 = cp[0].mul((1 - t) * (1 - t));
        const p2 = cp[1].mul(2 * t * (1 - t));
        const p3 = cp[2].mul(t * t);
        return p1.add(p2).add(p3);
      }

      window.inheart = function (x, y, r) {
        const z = ((x / r) * (x / r) + (y / r) * (y / r) - 1) *
          ((x / r) * (x / r) + (y / r) * (y / r) - 1) *
          ((x / r) * (x / r) + (y / r) * (y / r) - 1) -
          (x / r) * (x / r) * (y / r) * (y / r) * (y / r);
        return z < 0;
      }

      window.Point = function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
      }
      window.Point.prototype = {
        clone: function () {
          return new Point(this.x, this.y);
        },
        add: function (o) {
          const p = this.clone();
          p.x += o.x;
          p.y += o.y;
          return p;
        },
        sub: function (o) {
          const p = this.clone();
          p.x -= o.x;
          p.y -= o.y;
          return p;
        },
        div: function (n) {
          const p = this.clone();
          p.x /= n;
          p.y /= n;
          return p;
        },
        mul: function (n) {
          const p = this.clone();
          p.x *= n;
          p.y *= n;
          return p;
        }
      }

      window.Heart = function () {
        const points = [];
        for (let i = 10; i < 30; i += 0.2) {
          const t = i / Math.PI;
          const x = 16 * Math.pow(Math.sin(t), 3);
          const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
          points.push(new Point(x, y));
        }
        this.points = points;
        this.length = points.length;
      }
      window.Heart.prototype = {
        get: function (i, scale) {
          return this.points[i].mul(scale || 1);
        }
      }

      window.Seed = function (tree, point, scale, color) {
        this.tree = tree;
        this.heart = {
          point: point,
          scale: scale || 1,
          color: color || '#FF0000',
          figure: new Heart(),
        }
        this.cirle = {
          point: point,
          scale: scale || 1,
          color: color || '#FF0000',
          radius: 5,
        }
      }
      window.Seed.prototype = {
        draw: function () {
          this.drawHeart();
          this.drawText();
        },
        addPosition: function (x, y) {
          this.cirle.point = this.cirle.point.add(new Point(x, y));
        },
        canMove: function () {
          return this.cirle.point.y < (this.tree.height + 20);
        },
        move: function (x, y) {
          this.clear();
          this.drawCirle();
          this.addPosition(x, y);
        },
        canScale: function () {
          return this.heart.scale > 0.2;
        },
        setHeartScale: function (scale) {
          this.heart.scale *= scale;
        },
        scale: function (scale) {
          this.clear();
          this.drawCirle();
          this.drawHeart();
          this.setHeartScale(scale);
        },
        drawHeart: function () {
          const ctx = this.tree.ctx, heart = this.heart;
          const point = heart.point, color = heart.color,
            scale = heart.scale;
          ctx.save();
          ctx.fillStyle = color;
          ctx.translate(point.x, point.y);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let i = 0; i < heart.figure.length; i++) {
            const p = heart.figure.get(i, scale);
            ctx.lineTo(p.x, -p.y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        },
        drawCirle: function () {
          const ctx = this.tree.ctx, cirle = this.cirle;
          const point = cirle.point, color = cirle.color,
            scale = cirle.scale, radius = cirle.radius;
          ctx.save();
          ctx.fillStyle = color;
          ctx.translate(point.x, point.y);
          ctx.scale(scale, scale);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        },
        drawText: function () {
          const ctx = this.tree.ctx, heart = this.heart;
          const point = heart.point, color = heart.color,
            scale = heart.scale;
          ctx.save();
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.translate(point.x, point.y);
          ctx.scale(scale, scale);
          ctx.moveTo(0, 0);
          ctx.lineTo(15, 15);
          ctx.lineTo(60, 15);
          ctx.stroke();
          ctx.moveTo(0, 0);
          ctx.scale(0.75, 0.75);
          ctx.font = "12px 微软雅黑,Verdana";
          ctx.fillText("请点击", 23, 16);
          ctx.restore();
        },
        clear: function () {
          const ctx = this.tree.ctx, cirle = this.cirle;
          const point = cirle.point, scale = cirle.scale, radius = 26;
          const w = (radius * scale);
          const h = w;
          ctx.clearRect(point.x - w, point.y - h, 4 * w, 4 * h);
        },
        hover: function (x, y) {
          const ctx = this.tree.ctx;
          const pixel = ctx.getImageData(x, y, 1, 1);
          return pixel.data[3] == 255
        }
      }

      window.Footer = function (tree, width, height, speed) {
        this.tree = tree;
        this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
        this.width = width;
        this.height = height;
        this.speed = speed || 2;
        this.length = 0;
      }
      window.Footer.prototype = {
        draw: function () {
          const ctx = this.tree.ctx, point = this.point;
          const len = this.length / 2;
          ctx.save();
          ctx.strokeStyle = 'rgb(35, 31, 32)';
          ctx.lineWidth = this.height;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.translate(point.x, point.y);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(len, 0);
          ctx.lineTo(-len, 0);
          ctx.stroke();
          ctx.restore();
          if (this.length < this.width) {
            this.length += this.speed;
          }
        }
      }

      window.Tree = function (canvas, width, height, opt) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.opt = opt || {};
        this.record = {};
        this.initSeed();
        this.initFooter();
        this.initBranch();
        this.initBloom();
      }
      window.Tree.prototype = {
        initSeed: function () {
          const seed = this.opt.seed || {};
          const x = seed.x || this.width / 2;
          const y = seed.y || this.height / 2;
          const point = new Point(x, y);
          const color = seed.color || '#FF0000';
          const scale = seed.scale || 1;
          this.seed = new Seed(this, point, scale, color);
        },
        initFooter: function () {
          const footer = this.opt.footer || {};
          const width = footer.width || this.width;
          const height = footer.height || 5;
          const speed = footer.speed || 2;
          this.footer = new Footer(this, width, height, speed);
        },
        initBranch: function () {
          const branchs = this.opt.branch || [];
          this.branchs = [];
          this.addBranchs(branchs);
        },
        initBloom: function () {
          const bloom = this.opt.bloom || {};
          const cache = [],
            num = bloom.num || 500,
            width = bloom.width || this.width,
            height = bloom.height || this.height,
            figure = this.seed.heart.figure;
          const r = 240;
          for (let i = 0; i < num; i++) {
            cache.push(this.createBloom(width, height, r, figure));
          }
          this.blooms = [];
          this.bloomsCache = cache;
        },
        toDataURL: function (type) {
          return this.canvas.toDataURL(type);
        },
        draw: function (k) {
          const ctx = this.ctx;
          const rec = this.record[k];
          if (!rec) {
            return;
          }
          const point = rec.point,
            image = rec.image;
          ctx.save();
          ctx.putImageData(image, point.x, point.y);
          ctx.restore();
        },
        addBranch: function (branch) {
          this.branchs.push(branch);
        },
        addBranchs: function (branchs) {
          const s = this;
          for (let i = 0; i < branchs.length; i++) {
            const b = branchs[i];
            const p1 = new Point(b[0], b[1]);
            const p2 = new Point(b[2], b[3]);
            const p3 = new Point(b[4], b[5]);
            const r = b[6];
            const l = b[7];
            const c = b[8];
            s.addBranch(new Branch(s, p1, p2, p3, r, l, c));
          }
        },
        removeBranch: function (branch) {
          const branchs = this.branchs;
          for (let i = 0; i < branchs.length; i++) {
            if (branchs[i] === branch) {
              branchs.splice(i, 1);
            }
          }
        },
        canGrow: function () {
          return !!this.branchs.length;
        },
        grow: function () {
          const branchs = this.branchs;
          for (let i = 0; i < branchs.length; i++) {
            const branch = branchs[i];
            if (branch) {
              branch.grow();
            }
          }
        },
        addBloom: function (bloom) {
          this.blooms.push(bloom);
        },
        removeBloom: function (bloom) {
          const blooms = this.blooms;
          for (let i = 0; i < blooms.length; i++) {
            if (blooms[i] === bloom) {
              blooms.splice(i, 1);
            }
          }
        },
        createBloom: function (width, height, radius, figure, color, alpha, angle, scale, place, speed) {
          let x, y;
          while (true) {
            x = random(20, width - 20);
            y = random(20, height - 20);
            if (inheart(x - width / 2, height - (height - 40) / 2 - y, radius)) {
              return new Bloom(this, new Point(x, y), figure, color, alpha, angle, scale, place, speed);
            }
          }
        },
        canFlower: function () {
          return !!this.bloomsCache.length;
        },
        flower: function (num) {
          const s = this, blooms = s.bloomsCache.splice(0, num);
          for (let i = 0; i < blooms.length; i++) {
            s.addBloom(blooms[i]);
          }
          const allBlooms = s.blooms;
          for (let j = 0; j < allBlooms.length; j++) {
            allBlooms[j].flower();
          }
        },
        snapshot: function (k, x, y, width, height) {
          const ctx = this.ctx;
          const image = ctx.getImageData(x, y, width, height);
          this.record[k] = {
            image: image,
            point: new Point(x, y),
            width: width,
            height: height
          };
        },
        setSpeed: function (k, speed) {
          this.record[k || "move"].speed = speed;
        },
        move: function (k, x, y) {
          const s = this, ctx = s.ctx;
          const rec = s.record[k || "move"];
          const point = rec.point,
            image = rec.image,
            speed = rec.speed || 10,
            width = rec.width,
            height = rec.height;

          const i = point.x + speed < x ? point.x + speed : x;
          const j = point.y + speed < y ? point.y + speed : y;

          ctx.save();
          ctx.clearRect(point.x, point.y, width, height);
          ctx.putImageData(image, i, j);
          ctx.restore();

          rec.point = new Point(i, j);
          rec.speed = speed * 0.95;

          if (rec.speed < 2) {
            rec.speed = 2;
          }
          return i < x || j < y;
        },
        jump: function () {
          const s = this, blooms = s.blooms;
          if (blooms.length) {
            for (let i = 0; i < blooms.length; i++) {
              blooms[i].jump();
            }
          }
          if ((blooms.length && blooms.length < 3) || !blooms.length) {
            const bloom = this.opt.bloom || {},
              width = bloom.width || this.width,
              height = bloom.height || this.height,
              figure = this.seed.heart.figure;
            const r = 240;
            for (let i = 0; i < random(1, 2); i++) {
              blooms.push(this.createBloom(width / 2 + width, height, r, figure, null, 1, null, 1, new Point(random(-100, 600), 720), random(200, 300)));
            }
          }
        }
      }

      window.Branch = function (tree, point1, point2, point3, radius, length, branchs) {
        this.tree = tree;
        this.point1 = point1;
        this.point2 = point2;
        this.point3 = point3;
        this.radius = radius;
        this.length = length || 100;
        this.len = 0;
        this.t = 1 / (this.length - 1);
        this.branchs = branchs || [];
      }
      window.Branch.prototype = {
        grow: function () {
          const s = this;
          if (s.len <= s.length) {
            const p = bezier([s.point1, s.point2, s.point3], s.len * s.t);
            s.draw(p);
            s.len += 1;
            s.radius *= 0.97;
          } else {
            s.tree.removeBranch(s);
            s.tree.addBranchs(s.branchs);
          }
        },
        draw: function (p) {
          const s = this;
          const ctx = s.tree.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.fillStyle = 'RGB(0,128,128)';
          ctx.shadowColor = '#22b822';
          ctx.shadowBlur = 2;
          ctx.moveTo(p.x, p.y);
          ctx.arc(p.x, p.y, s.radius, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      window.Bloom = function (tree, point, figure, color, alpha, angle, scale, place, speed) {
        this.tree = tree;
        this.point = point;
        this.color = color || 'rgb(255,' + random(0, 255) + ',' + random(0, 255) + ')';
        this.alpha = alpha || random(0.3, 1);
        this.angle = angle || random(0, 360);
        this.scale = scale || 0.1;
        this.place = place;
        this.speed = speed;
        this.figure = figure;
      }
      window.Bloom.prototype = {
        setFigure: function (figure) {
          this.figure = figure;
        },
        flower: function () {
          const s = this;
          s.draw();
          s.scale += 0.1;
          if (s.scale > 1) {
            s.tree.removeBloom(s);
          }
        },
        draw: function () {
          const s = this, ctx = s.tree.ctx, figure = s.figure;
          ctx.save();
          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha;
          ctx.translate(s.point.x, s.point.y);
          ctx.scale(s.scale, s.scale);
          ctx.rotate(s.angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let i = 0; i < figure.length; i++) {
            const p = figure.get(i);
            ctx.lineTo(p.x, -p.y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        },
        jump: function () {
          const s = this, height = s.tree.height;
          if (s.point.x < -20 || s.point.y > height + 20) {
            s.tree.removeBloom(s);
          } else {
            s.draw();
            // 确保place存在且有sub方法
            if (s.place && typeof s.place.sub === 'function') {
              s.point = s.place.sub(s.point).div(s.speed).add(s.point);
            }
            s.angle += 0.05;
            s.speed -= 1;
          }
        }
      }
    },
    sleep(duration) {
      return new Promise(resolve => setTimeout(resolve, duration));
    },
    async seedAnimate() {
      this.seed.draw();
      while (this.hold) {
        await this.sleep(10);
      }
      while (this.seed.canScale()) {
        this.seed.scale(0.95);
        await this.sleep(10);
      }
      while (this.seed.canMove()) {
        this.seed.move(0, 2);
        this.foot.draw();
        await this.sleep(10);
      }
    },
    async growAnimate() {
      do {
        this.tree.grow();
        await this.sleep(10);
      } while (this.tree.canGrow());
    },
    async flowAnimate() {
      do {
        this.tree.flower(2);
        await this.sleep(10);
      } while (this.tree.canFlower());
      
    },
    async moveAnimate() {
      this.tree.snapshot("p1", 240, 0, 610, 680);
      
      while (this.tree.move("p1", 500, 0)) {
        this.foot.draw();
        await this.sleep(10);
      }
      this.foot.draw();
      this.tree.snapshot("p2", 300, 0, 610, 680); // 同时更新snapshot位置

      // 解决闪烁问题
      const wrap = this.$refs.canvas.parentElement;
      wrap.style.background = "url(" + this.tree.toDataURL('image/png') + ")";
      this.$refs.canvas.style.background = "#ffc0cb";
      await this.sleep(300);
      this.$refs.canvas.style.background = "none";
    },
    async jumpAnimate() {
      while (true) {
        this.tree.ctx.clearRect(0, 0, this.width, this.height);
        this.tree.jump();
        this.foot.draw();
        await this.sleep(25);
      }
    },
    textAnimate() {
      // 显示文本
      const code = this.$refs.code;
      const clockBox = document.getElementById('clock-box');

      code.style.display = 'block';
      this.typewriter(code);

      // 只有当clockBox元素存在时才执行相关操作
      if (clockBox) {
        clockBox.style.display = 'block';
        clockBox.style.opacity = '0';
        setTimeout(() => {
          clockBox.style.transition = 'opacity 0.5s';
          clockBox.style.opacity = '1';
        }, 10);

        // 设置时钟定时器
        const together = new Date();
        together.setFullYear(2001);
        together.setHours(0);
        together.setMinutes(0);
        together.setSeconds(0);
        together.setMilliseconds(0);

        this.clockTimer = setInterval(() => {
          this.timeElapse(together);
        }, 1000);
      }
    },
    typewriter(element) {
      let str = element.innerHTML;
      let progress = 0;
      element.innerHTML = '';

      const timer = setInterval(() => {
        let current = str.substr(progress, 1);
        if (current == '<') {
          progress = str.indexOf('>', progress) + 1;
        } else {
          progress++;
        }
        element.innerHTML = str.substring(0, progress) + (progress & 1 ? '_' : '');
        if (progress >= str.length) {
          clearInterval(timer);
        }
      }, 75);
    },
    timeElapse(date) {
      const current = new Date();
      const seconds = (Date.parse(current) - Date.parse(date)) / 1000;
      const days = Math.floor(seconds / (3600 * 24));
      const remainingSeconds = seconds % (3600 * 24);
      const hours = Math.floor(remainingSeconds / 3600);
      const formattedHours = hours < 10 ? "0" + hours : hours;
      const remainingMinutes = remainingSeconds % 3600;
      const minutes = Math.floor(remainingMinutes / 60);
      const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
      const formattedSeconds = Math.floor(remainingMinutes % 60);
      const displaySeconds = formattedSeconds < 10 ? "0" + formattedSeconds : formattedSeconds;

      const result = "第 <span class=\"digit\">" + days + "</span> 天 <span class=\"digit\">" + formattedHours + "</span> 小时 <span class=\"digit\">" + formattedMinutes + "</span> 分钟 <span class=\"digit\">" + displaySeconds + "</span> 秒";
      if (this.$refs.clock) {
        this.$refs.clock.innerHTML = result;
      }
    },
    async runAnimation() {
      await this.seedAnimate();
      await this.growAnimate();
      await this.flowAnimate();
      await this.moveAnimate();

      this.textAnimate();

      // jumpAnimate会一直运行，所以放在最后
      this.jumpAnimate();
    },
    handleCanvasClick(e) {
      if (this.hold) {
        const canvas = this.$refs.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.seed && this.seed.hover(x, y)) {
          this.hold = 0;
          this.isHand = false;
        }
      }
    },
    handleCanvasMouseMove(e) {
      if (this.hold) {
        const canvas = this.$refs.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.seed) {
          this.isHand = this.seed.hover(x, y);
        }
      }
    }
  }
}
</script>

<style scoped>
#love-tree-container {
  width: 100%;
  height: 100%;
  background: #ffc0cb;
  font-family: '微软雅黑', '宋体', sans-serif;
  color: #000000;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

#main {
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

#wrap {
  position: relative;
  width: 1000px;
  height: 680px;
  right: 40%;
}

#text {
  position: absolute;
  width: 300px;
  left: 45%;
  top: 180px;
  margin-left: -200px;
  color: #666;
}

#code {
  display: none;
}

#clock-box {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  font-family: "Microsoft YaHei";
  display: none;
}

#clock-box a {
  color: #888;
  text-decoration: none;
}

#clock-box a:hover {
  color: #555;
  text-decoration: underline;
}

#clock {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

.digit {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 16px;
  color: #f30;
}

#canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  cursor: default;
}

#canvas.hand {
  cursor: pointer !important;
}

@font-face {
  font-family: 'Love-Regular';
  src: url('@/assets/fonts/love.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.say {
  font-family: 'Love-Regular', sans-serif;
  font-size: 45px;
}

.space {
  margin-left: 15px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  #wrap {
    transform: scale(0.9);
    transform-origin: center;
  }
}

@media (max-width: 1000px) {
  #wrap {
    transform: scale(0.8);
  }
}

@media (max-width: 800px) {
  #wrap {
    transform: scale(0.7);
  }
}

@media (max-width: 600px) {
  #wrap {
    transform: scale(0.6);
  }

  #text {
    width: 300px;
    margin-left: -150px;
    font-size: 12px;
  }
}
</style>