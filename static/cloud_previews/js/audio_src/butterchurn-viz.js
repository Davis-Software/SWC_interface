import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import _ from "lodash";

class ButterChurnViz{
    constructor(canvasSelector, audioSelector) {
        this.visualizer = null
        this.rendering = false
        this.audioContext = new AudioContext()
        this.sourceNode = null
        this.cycleInterval = null
        this.presets = _(butterchurnPresets.getPresets()).toPairs().sortBy(([k, v]) => k.toLowerCase()).fromPairs().value()
        this.presetKeys = []
        this.presetIndexHist = []
        this.presetIndex = 0
        this.presetCycle = true
        this.presetCycleLength = 15000
        this.presetRandom = true
        this.canvas = document.querySelector(canvasSelector)
        this.audio = document.querySelector(audioSelector)
    }
    startRenderer() {
        requestAnimationFrame(() => this.startRenderer())
        this.visualizer.render()
    }
    connectToAudioElement() {
        if (!this.rendering) {
            this.rendering = true
            this.startRenderer()
        }
        if (this.sourceNode) {
            this.sourceNode.disconnect()
        }

        this.sourceNode = this.audioContext.createMediaElementSource(this.audio)

        let delayedAudible = this.audioContext.createDelay()
        delayedAudible.delayTime.value = 0
        this.sourceNode.connect(delayedAudible)
        delayedAudible.connect(this.audioContext.destination)

        this.visualizer.connectAudio(delayedAudible)
    }
    nextPreset(blendTime = 5.7) {
        this.presetIndexHist.push(this.presetIndex)

        let numPresets = this.presetKeys.length
        if (this.presetRandom) {
            this.presetIndex = Math.floor(Math.random() * this.presetKeys.length)
        } else {
            this.presetIndex = (this.presetIndex + 1) % numPresets
        }

        this.visualizer.loadPreset(this.presets[this.presetKeys[this.presetIndex]], blendTime)
    }
    prevPreset(blendTime = 5.7) {
        let numPresets = this.presetKeys.length
        if (this.presetIndexHist.length > 0) {
            this.presetIndex = this.presetIndexHist.pop()
        } else {
            this.presetIndex = ((this.presetIndex - 1) + numPresets) % numPresets
        }

        this.visualizer.loadPreset(this.presets[this.presetKeys[this.presetIndex]], blendTime)
    }
    restartCycleInterval() {
        if (this.cycleInterval) {
            clearInterval(this.cycleInterval)
            this.cycleInterval = null
        }

        if (this.presetCycle) {
            this.cycleInterval = setInterval(() => this.nextPreset(2.7), this.presetCycleLength)
        }
    }
    initPlayer() {
        this.presetKeys = _.keys(this.presets)
        this.presetIndex = Math.floor(Math.random() * this.presetKeys.length)

        this.visualizer = butterchurn.createVisualizer(this.audioContext, this.canvas , {
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: window.devicePixelRatio || 1,
          textureRatio: 1,
        })
        this.nextPreset(0)
        this.cycleInterval = setInterval(() => this.nextPreset(2.7), this.presetCycleLength)
    }
}

export default ButterChurnViz