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

      // const energy = (lowEnergy + midEnergy + highEnergy) / 3; // Average energy
      // const offsetX = Math.sin(Date.now() / 200) * 5; // Adjust the divisor to change speed
      // const offsetY = Math.cos(Date.now() / 200) * 5; // Adjust the multiplier to change intensity
      // const spread = Math.max(10, Math.min(30, energy * 50)); // Spread based on energy, min 10px, max 30px
      
      // $(".cur-song-img").css("box-shadow", `
      //   ${offsetX}px ${offsetY}px ${spread}px rgba(${r}, ${g}, ${b}, 0.7)
      // `);

      const energy = (lowEnergy + midEnergy + highEnergy) / 3; // Average energy
      const spread = Math.max(10, Math.min(50, energy * 100)); // Spread based on energy, min 10px, max 50px
      
      $(".cur-song-img").css("box-shadow", `
        0px 0px ${spread}px rgba(${r}, ${g}, ${b}, 0.7)
      `);

    },
  }
);
