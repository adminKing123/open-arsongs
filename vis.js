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

      const energy = (lowEnergy + midEnergy + highEnergy) / 3; // Average energy
      const spread = Math.max(10, Math.min(50, energy * 100)); // Spread based on energy, min 10px, max 50px
      
      $(".cur-song-img").css("box-shadow", `
        0px 0px ${spread}px rgba(${r}, ${g}, ${b}, 0.7)
      `);

      
      // Border gradient effect for lin-border
      const borderWidth = Math.max(4, Math.min(10, energy * 20)); // Border width based on energy
      const gradientSpeed = Math.max(2, Math.min(10, energy * 20)); // Animation speed based on energy

      $("#lin-border").css({
        "border-width": `${borderWidth}px`,
        "border-style": "solid",
        "border-image": `
          linear-gradient(
            ${Date.now() / gradientSpeed}deg,
            rgba(${r}, ${g}, ${b}, 0.8),
            rgba(${b}, ${r}, ${g}, 0.8),
            rgba(${g}, ${b}, ${r}, 0.8)
          ) 1
        `,
        "animation": `rotate ${20 - gradientSpeed}s linear infinite`
      });
    },
  }
);
