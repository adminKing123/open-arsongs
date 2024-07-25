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
      $(".cur-song-img").css("background-color", `rgb(${r}, ${g}, ${b})`);
    },
  }
);
