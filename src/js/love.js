let i = 0;
setInterval(() => {
  const color = i % 2 === 0 ? "#ff2d55" : "#007aff";
  const shadow = i % 2 === 0 ? "0 0 10px #ff2d55, 0 0 20px #ff2d55" : "0 0 10px #007aff, 0 0 20px #007aff";
  console.clear();
  console.log("%c我爱你", `font-size: 35px; font-weight: bold; color: ${color}; text-shadow: ${shadow};`);
  i++;
}, 800);