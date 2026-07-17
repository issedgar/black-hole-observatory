/**
 * Fully procedural audio for the observatory (brief §13). No external assets: a
 * deep low-frequency drone, band-passed plasma noise, a slow telemetry pulse,
 * and a swell that intensifies during accretion events. Everything is synthesized
 * with the Web Audio API and gated behind an explicit user opt-in.
 *
 * The sound is an artistic representation — space does not carry sound.
 */
export class AudioEngine {
    private context: AudioContext | null = null;
    private master: GainNode | null = null;
    private eventGain: GainNode | null = null;
    private pulseTimer: number | null = null;
    private started = false;
    private volume = 0.6;

    /** Builds the graph and starts playback. Must follow a user gesture. */
    async start(): Promise<void> {
        if (this.started) {
            await this.context?.resume();
            return;
        }
        const AudioCtx =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
                .webkitAudioContext;
        if (!AudioCtx) {
            return;
        }
        const ctx = new AudioCtx();
        this.context = ctx;
        await ctx.resume();

        const master = ctx.createGain();
        master.gain.value = this.volume;
        master.connect(ctx.destination);
        this.master = master;

        this.buildDrone(ctx, master);
        this.buildNoise(ctx, master);
        this.buildEventBus(ctx, master);
        this.startTelemetryPulse(ctx);

        this.started = true;
    }

    private buildDrone(ctx: AudioContext, master: GainNode): void {
        const droneGain = ctx.createGain();
        droneGain.gain.value = 0.0;
        droneGain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 3);

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 220;
        lowpass.Q.value = 0.6;
        lowpass.connect(droneGain);
        droneGain.connect(master);

        const frequencies = [42, 42.3, 84];
        const types: OscillatorType[] = ['sine', 'sine', 'triangle'];
        for (let i = 0; i < frequencies.length; i++) {
            const osc = ctx.createOscillator();
            osc.type = types[i];
            osc.frequency.value = frequencies[i];
            const gain = ctx.createGain();
            gain.gain.value = i === 2 ? 0.25 : 0.6;
            osc.connect(gain);
            gain.connect(lowpass);
            osc.start();
        }

        // Slow amplitude LFO for a breathing quality.
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.07;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(droneGain.gain);
        lfo.start();
    }

    private buildNoise(ctx: AudioContext, master: GainNode): void {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 700;
        bandpass.Q.value = 0.7;

        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.018;

        source.connect(bandpass);
        bandpass.connect(noiseGain);
        noiseGain.connect(master);
        source.start();
    }

    private buildEventBus(ctx: AudioContext, master: GainNode): void {
        const eventGain = ctx.createGain();
        eventGain.gain.value = 0.0;

        const sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.value = 30;
        const shaper = ctx.createBiquadFilter();
        shaper.type = 'lowpass';
        shaper.frequency.value = 120;

        sub.connect(shaper);
        shaper.connect(eventGain);
        eventGain.connect(master);
        sub.start();

        this.eventGain = eventGain;
    }

    private startTelemetryPulse(ctx: AudioContext): void {
        // A discreet periodic ping for a telemetry feel.
        this.pulseTimer = window.setInterval(() => {
            if (!this.master) {
                return;
            }
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 880;
            const gain = ctx.createGain();
            gain.gain.value = 0;
            gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                ctx.currentTime + 0.25,
            );
            osc.connect(gain);
            gain.connect(this.master);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }, 3800);
    }

    /** Drives the accretion swell, 0..1. */
    setEventIntensity(intensity: number): void {
        if (!this.eventGain || !this.context) {
            return;
        }
        const target = Math.min(0.35, intensity * 0.35);
        this.eventGain.gain.setTargetAtTime(
            target,
            this.context.currentTime,
            0.15,
        );
    }

    setVolume(volume: number): void {
        this.volume = volume;
        if (this.master && this.context) {
            this.master.gain.setTargetAtTime(
                volume,
                this.context.currentTime,
                0.05,
            );
        }
    }

    /** Stops playback and releases the audio context. */
    async stop(): Promise<void> {
        if (this.pulseTimer !== null) {
            window.clearInterval(this.pulseTimer);
            this.pulseTimer = null;
        }
        if (this.context) {
            await this.context.close();
        }
        this.context = null;
        this.master = null;
        this.eventGain = null;
        this.started = false;
    }
}
