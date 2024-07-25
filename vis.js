import AudioMotionAnalyzer from "https://cdn.skypack.dev/audiomotion-analyzer?min";
const audioMotion = new AudioMotionAnalyzer(
  document.getElementById("visualizer-container"),
  {
    source: document.getElementById("player"),
    mode: 1,
    ledBars: true,
    showBgColor: true,
    overlay: true,
    colorMode: "gradient",
    gradient: "rainbow",
    showScaleX: false,
    showPeaks: true,
    onCanvasDraw: (instance) => {
      const lowEnergy = instance.getEnergy("bass");
      const midEnergy = instance.getEnergy("midrange");
      const highEnergy = instance.getEnergy("treble");

      const r = Math.round(lowEnergy * 255);
      const g = Math.round(midEnergy * 255);
      const b = Math.round(highEnergy * 255);
      $("#aaah").css("background-color", `rgb(${r}, ${g}, ${b})`);

      // Create a rocking shadow effect
      // const offsetX = Math.sin(Date.now() / 200) * 5; // Adjust the divisor to change speed
      // const offsetY = Math.cos(Date.now() / 200) * 5; // Adjust the multiplier to change intensity
      // $(".cur-song-img").css("box-shadow", `${offsetX}px ${offsetY}px 10px rgba(${r}, ${g}, ${b}, 0.7)`);

      // Create a rocking shadow effect combined with a standard shadow
      // const offsetX = Math.sin(Date.now() / 200) * 5; // Adjust the divisor to change speed
      // const offsetY = Math.cos(Date.now() / 200) * 5; // Adjust the multiplier to change intensity
      // $(".cur-song-img").css("box-shadow", `
      //   ${offsetX}px ${offsetY}px 10px rgba(${r}, ${g}, ${b}, 0.7),
      //   0 5px 15px rgba(0, 0, 0, 0.3)
      // `);

      // Create a pulsating border effect
      const borderWidth = Math.max(1, Math.min(10, (lowEnergy + midEnergy + highEnergy) * 10));
      const gradientAngle = (Date.now() / 50) % 360;
      $(".cur-song-img").css({
        "border-width": `${borderWidth}px`,
        "border-style": "solid",
        "border-image": `linear-gradient(${gradientAngle}deg, rgb(${r},${g},${b}), rgb(${b},${r},${g}), rgb(${g},${b},${r})) 1`,
        "box-shadow": `0 0 20px rgba(${r}, ${g}, ${b}, 0.5)`
      });
    },
  }
);
