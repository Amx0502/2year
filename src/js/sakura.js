//樱花 Quaint 修改版 
 
 var stop, staticx; 
 var img = new Image(); 
 // 设置实际的樱花图片路径
 img.src = "/image/sakura.png"; 
 
 // 樱花数量 (添加) 
 var sakuraNum = 30; 
 // 樱花越界限制次数, -1不做限制,无限循环 (添加) 
 var limitTimes = -1; // 设置为-1表示无限循环 
 
 // 定义限制数组 (添加) 
 var limitArray = new Array(sakuraNum); 
 for(var index = 0;index < sakuraNum;index++){ 
     limitArray[index] = limitTimes; // 自动飘落的樱花设置为无限循环 
 }

// 存储全局樱花列表引用
var globalSakuraList = null;
// 每次点击产生的樱花数量
var sakuraPerClick = 5; 
 
 // 定义樱花, idx 是修改添加的 
 function Sakura(x, y, s, r, fn, idx) { 
 	 this.x = x; 
 	 this.y = y; 
 	 this.s = s; 
 	 this.r = r; 
 	 this.fn = fn; 
 	 this.idx = idx; 
 } 
 
 // 绘制樱花 
 Sakura.prototype.draw = function(cxt) { 
 	 cxt.save(); 
 	 var xc = 40 * this.s / 4; 
 	 cxt.translate(this.x, this.y); 
 	 cxt.rotate(this.r); 
 	 cxt.drawImage(img, 0, 0, 40 * this.s, 40 * this.s); 
 	 cxt.restore(); 
 } 
 
 // 修改樱花位置,模拟飘落. 
 Sakura.prototype.update = function() { 
	 // 确保索引有效
	 if (this.idx === undefined || this.idx < 0 || this.idx >= limitArray.length) {
		 // 如果索引无效，设置为点击产生的樱花（只显示一次）
		 this.needRemove = true;
		 return;
	 }
	 
	 this.x = this.fn.x(this.x, this.y); 
	 this.y = this.fn.y(this.y, this.y); 
	 this.r = this.fn.r(this.r); 
 
	 // 如果樱花越界, 重新调整位置或标记为移除
	 if(this.x > window.innerWidth || this.x < 0 || 
		 this.y > window.innerHeight || this.y < 0) { 
 
		 // 如果樱花不做限制（自动飘落的樱花）
		 if (limitArray[this.idx] == -1) { 
			 // 确保不会被标记为移除
			 delete this.needRemove;
			 // 重新设置位置，实现循环效果
			 this.r = getRandom('fnr'); 
			 if(Math.random() > 0.4) { 
				 this.x = getRandom('x'); 
				 this.y = 0; // 从顶部重新开始
				 this.s = getRandom('s'); 
				 this.r = getRandom('r'); 
			 } else { 
				 this.x = window.innerWidth; // 从右侧重新开始
				 this.y = getRandom('y'); 
				 this.s = getRandom('s'); 
				 this.r = getRandom('r'); 
			 } 
		 } 
		 // 否则樱花有限制（点击产生的樱花）
		 else { 
			 if (limitArray[this.idx] > 0) { 
				 this.r = getRandom('fnr'); 
				 if(Math.random() > 0.4) { 
					 this.x = getRandom('x'); 
					 this.y = 0; 
					 this.s = getRandom('s'); 
					 this.r = getRandom('r'); 
				 } else { 
					 this.x = window.innerWidth; 
					 this.y = getRandom('y'); 
					 this.s = getRandom('s'); 
					 this.r = getRandom('r'); 
				 } 
				 // 该越界的樱花限制数减一 
				 limitArray[this.idx]--; 
			 } else {
				 // 标记为要移除（设置一个特殊属性）
				 this.needRemove = true;
			 } 
		 } 
	 } 
 } 
 
 SakuraList = function() { 
 	 this.list = []; 
 } 
 
 SakuraList.prototype.push = function(sakura) { 
 	 this.list.push(sakura); 
 } 
 
 // list update 方法，增加移除超过边界的樱花功能
 SakuraList.prototype.update = function() { 
	 // 创建新数组存储需要保留的樱花
	 var newList = [];
	 // 重新索引数组
	 var newLimitArray = [];
	 
	 for(var i = 0, len = this.list.length; i < len; i++) { 
		 this.list[i].update(); 
		 // 只保留不需要移除的樱花（点击产生的樱花会标记needRemove）
		 // 注意：自动飘落的樱花不应该被移除
		 if (!this.list[i].needRemove) {
			 // 更新索引
			 this.list[i].idx = newList.length;
			 newList.push(this.list[i]);
			 // 复制对应的限制次数
			 newLimitArray.push(limitArray[i]);
		 } else {
			 // 清除标记，避免影响下次检查
			 delete this.list[i].needRemove;
		 }
	 } 
	 
	 // 更新列表和限制数组
	 this.list = newList;
	 
	 // 确保limitArray长度足够
	 if (newLimitArray.length > limitArray.length) {
		 limitArray.length = newLimitArray.length;
	 }
	 
	 // 合并回原有限制数组
	 for(var i = 0; i < newLimitArray.length; i++) {
		 limitArray[i] = newLimitArray[i];
	 }
	 
	 // 清除超出部分
	 limitArray.length = newLimitArray.length;
 } 
 
 // list draw 方法 
 SakuraList.prototype.draw = function(cxt) { 
 	 for(var i = 0, len = this.list.length; i < len; i++) { 
 		 this.list[i].draw(cxt); 
 	 } 
 } 
 
 SakuraList.prototype.get = function(i) { 
 	 return this.list[i]; 
 } 
 
 SakuraList.prototype.size = function() { 
 	 return this.list.length; 
 } 
 
 // 位置随机策略 
 function getRandom(option) { 
 	 var ret, random; 
 	 switch(option) { 
 		 case 'x': 
 			 ret = Math.random() * window.innerWidth; 
 			 break; 
 		 case 'y': 
 			 ret = Math.random() * window.innerHeight; 
 			 break; 
 		 case 's': 
 			 ret = Math.random(); 
 			 break; 
 		 case 'r': 
 			 ret = Math.random() * 6; 
 			 break; 
 		 case 'fnx': 
 			 random = -0.5 + Math.random() * 1; 
 			 ret = function(x, y) { 
 				 return x + 0.5 * random - 1.7; 
 			 }; 
 			 break; 
 		 case 'fny': 
 			 random = 1.5 + Math.random() * 0.7; 
 			 ret = function(x, y) { 
 				 return y + random; 
 			 }; 
 			 break; 
 		 case 'fnr': 
 			 random = Math.random() * 0.03; 
 			 ret = function(r) { 
 				 return r + random; 
 			 }; 
 			 break; 
		 default:
			 ret = null;
			 break; 
 	 } 
 
	 return ret; 
 } 
 
 // 修复变量名错误
 function getRandomFix(option) {
	 return getRandom(option);
 } 
 
 // 樱花入口 
 function startSakura() { 
   
	 requestAnimationFrame = window.requestAnimationFrame || 
		 window.mozRequestAnimationFrame || 
		 window.webkitRequestAnimationFrame || 
		 window.msRequestAnimationFrame || 
		 window.oRequestAnimationFrame; 
	 
	 var canvas = document.createElement('canvas'), 
		 cxt; 
	 
	 staticx = true; 
	 canvas.height = window.innerHeight; 
	 canvas.width = window.innerWidth; 
	 canvas.setAttribute('style', 'position: fixed;left: 0;top: 0;pointer-events: none;z-index: 9999;'); 
	 canvas.setAttribute('id', 'canvas_sakura'); 
	 
	 // 移除已存在的canvas元素，避免重复
	 var existingCanvas = document.getElementById('canvas_sakura');
	 if (existingCanvas && existingCanvas.parentNode) {
		 existingCanvas.parentNode.removeChild(existingCanvas);
	 }
	 
	 document.getElementsByTagName('body')[0].appendChild(canvas); 
	 cxt = canvas.getContext('2d'); 
	 
	 // 重置限制数组，确保自动飘落的樱花设置为无限循环
	 limitArray = new Array(sakuraNum);
	 for(var index = 0; index < sakuraNum; index++) {
		 limitArray[index] = -1; // -1表示无限循环
	 }
	 
	 // 创建全局樱花列表
	 globalSakuraList = new SakuraList(); 
	 var sakuraList = globalSakuraList;
	 
	 // sakuraNum 樱花个数 (原版为50个) 
	 for(var i = 0; i < sakuraNum; i++) { 
		 var sakura, randomX, randomY, randomS, randomR, randomFnx, randomFny, randomFnR; 
		 randomX = getRandom('x'); 
		 randomY = getRandom('y'); 
		 randomR = getRandom('r'); 
		 randomS = getRandom('s'); 
		 randomFnx = getRandom('fnx'); 
		 randomFny = getRandom('fny'); 
		 randomFnR = getRandom('fnr'); 
		 
		 sakura = new Sakura(randomX, randomY, randomS, randomR, { 
			 x: randomFnx, 
			 y: randomFny, 
			 r: randomFnR 
		 }, i); 
		 
		 sakura.draw(cxt); 
		 sakuraList.push(sakura); 
	 } 
 
	 function animate() { 
		 cxt.clearRect(0, 0, canvas.width, canvas.height); 
		 // 修改樱花位置逻辑 
		 sakuraList.update(); 
		 // 画出修改后的樱花 
		 sakuraList.draw(cxt); 
		 // 递归 修改位置, 画出修改后的樱花 
		 stop = requestAnimationFrame(animate); 
	 } 
	 
	 // 添加点击事件监听
	 addClickHandler();
	 
	 stop = requestAnimationFrame(animate);
	 
	 // 返回控制对象，方便外部管理
	 return {
		 stop: stopp
	 };
 } 
 
 window.onresize = function() { 
	 var canvasSakura = document.getElementById('canvas_sakura'); 
	 // 检查元素是否存在，避免空指针异常
	 if (canvasSakura) { 
		 canvasSakura.width = window.innerWidth; 
		 canvasSakura.height = window.innerHeight; 
	 } 
 } 
 
 img.onload = function() { 
	 // 可以在这里自动启动，或者等待外部调用
 } 
 
 // 处理点击事件，在点击位置生成樱花
function handleClick(event) {
	// 确保樱花列表和图片已准备就绪
	if (!globalSakuraList || !img.complete) return;
	
	// 获取点击位置
	var x = event.clientX;
	var y = event.clientY;
	
	// 在点击位置生成樱花
	for (var i = 0; i < sakuraPerClick; i++) {
		var sakura, randomX, randomY, randomS, randomR, randomFnx, randomFny, randomFnR;
		// 在点击位置附近随机分布
		randomX = x + (Math.random() - 0.5) * 50;
		randomY = y + (Math.random() - 0.5) * 50;
		randomR = getRandom('r');
		randomS = getRandom('s');
		randomFnx = getRandom('fnx');
		randomFny = getRandom('fny');
		randomFnR = getRandom('fnr');
		
		// 为点击产生的樱花创建唯一索引
		var idx = globalSakuraList.size() + i;
		
		// 为点击产生的樱花设置0次循环，超过边界就消失
		if (limitArray.length <= idx) {
			limitArray[idx] = 0;
		} else {
			limitArray[idx] = 0;
		}
		
		sakura = new Sakura(randomX, randomY, randomS, randomR, {
			x: randomFnx,
			y: randomFny,
			r: randomFnR
		}, idx);
		
		globalSakuraList.push(sakura);
	}
}

// 移除点击事件监听
function removeClickHandler() {
	document.removeEventListener('click', handleClick);
}

// 添加点击事件监听
function addClickHandler() {
	document.addEventListener('click', handleClick);
}

// 停止樱花特效的方法
 function stopp() { 
	 if(staticx) { 
		 var child = document.getElementById("canvas_sakura"); 
		 if(child && child.parentNode) {
			 child.parentNode.removeChild(child); 
		 }
		 window.cancelAnimationFrame(stop); 
		 staticx = false;
		 // 移除点击事件监听
		 removeClickHandler();
	 } else { 
		 startSakura(); 
	 } 
 } 
 
 // 将方法暴露到window对象，方便其他组件调用
 window.startSakura = startSakura;
 window.stopSakura = stopp;