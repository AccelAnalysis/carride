export function createAudio() {
  let context;
  let engine;
  let engineGain;
  let filter;
  let enabled = true;

  function ensure() {
    if (!enabled) return false;
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;

      context = new AudioContext();
      engine = context.createOscillator();
      engineGain = context.createGain();
      filter = context.createBiquadFilter();

      engine.type = "sawtooth";
      engine.frequency.value = 55;
      engineGain.gain.value = 0.0001;
      filter.type = "lowpass";
      filter.frequency.value = 420;

      engine.connect(filter);
      filter.connect(engineGain);
      engineGain.connect(context.destination);
      engine.start();
    }

    if (context.state === "suspended") context.resume();
    return true;
  }

  function tone(frequency, duration = 0.08, volume = 0.04, type = "square") {
    if (!ensure()) return;

    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  function start() {
    if (!ensure()) return;
    engineGain.gain.setTargetAtTime(0.018, context.currentTime, 0.08);
  }

  function update(speed, boosting, offRoad) {
    if (!context || !engine || !enabled) return;
    const now = context.currentTime;
    const rpm = 48 + speed * 1.15 + (boosting ? 42 : 0);
    engine.frequency.setTargetAtTime(rpm, now, 0.05);
    filter.frequency.setTargetAtTime(300 + speed * 5.2, now, 0.08);
    const targetGain = offRoad ? 0.026 : boosting ? 0.03 : 0.018;
    engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
  }

  function pause() {
    if (!context || !engineGain) return;
    engineGain.gain.setTargetAtTime(0.0001, context.currentTime, 0.08);
  }

  function collision(hard = false) {
    tone(hard ? 72 : 96, hard ? 0.28 : 0.18, hard ? 0.11 : 0.075, "sawtooth");
  }

  function reward() {
    tone(720, 0.07, 0.028, "sine");
  }

  function finish() {
    tone(523, 0.12, 0.04, "sine");
    setTimeout(() => tone(659, 0.12, 0.04, "sine"), 110);
    setTimeout(() => tone(784, 0.2, 0.05, "sine"), 220);
  }

  function toggle() {
    enabled = !enabled;
    if (!enabled) pause();
    else ensure();
    return enabled;
  }

  return { start, update, pause, collision, reward, finish, toggle, get enabled() { return enabled; } };
}
