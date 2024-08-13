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
      const gradientAngle = Math.round(highEnergy * 360) % 360; // Gradient angle based on high energy, clamped to 0-359

      $("#lin-border").css({
        "border-image": `linear-gradient(${gradientAngle}deg, red, green, blue) 1`
      });
    },
  }
);
