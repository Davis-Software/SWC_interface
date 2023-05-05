import butterchurn from 'butterchurn';
import butterchurnPresets from './node_modules/butterchurn-presets/lib/butterchurnPresets.min';
import butterchurnPresetsExtra from './node_modules/butterchurn-presets/lib/butterchurnPresetsExtra.min';
import butterchurnPresetsExtra2 from './node_modules/butterchurn-presets/lib/butterchurnPresetsExtra2.min';

import _ from "lodash";

class ButterChurnViz{
    constructor(canvasSelector, audioSelector, votingSelector, debugSelector=null) {
        this.visualizer = null
        this.rendering = false
        this.audioContext = new AudioContext()
        this.sourceNode = null
        this.cycleInterval = null
        this.presets = {
            ...butterchurnPresets.getPresets(),
            ...butterchurnPresetsExtra.getPresets(),
            ...butterchurnPresetsExtra2.getPresets()
        }
        this.presetKeys = []
        this.presetIndexHist = []
        this.presetIndex = 0
        this.presetCycle = true
        this.presetCycleLength = 15000
        this.presetRandom = true
        this.presetRatings = {}
        this.canvas = document.querySelector(canvasSelector)
        this.audio = document.querySelector(audioSelector)
        this.votingElement = document.querySelector(votingSelector)
        this.debugElement = document.querySelector(debugSelector)
    }
    loadCustomPresetWeights(callback){
        fetch("/butter-churn").then(res => res.json()).then(data => {
            for(let preset of data){
                this.presetRatings[preset.key] = preset.weight
            }
            callback()
        })
    }
    computeCustomRatings(){
        for(let presetKey of Object.keys(this.presets)){
            this.presets[presetKey].rating = this.presets[presetKey].baseVals.rating || 0
        }
        for(let presetKey of Object.keys(this.presetRatings)){
            if(this.presets[presetKey]){
                this.presets[presetKey].rating += this.presetRatings[presetKey]
            }
        }
        this.sortByCustomRatings()
    }
    sortByCustomRatings(){
        this.presetKeys = Object.keys(this.presets).sort((a, b) => this.presets[b].rating - this.presets[a].rating)
    }
    setVotingInfoInteracts(){
        let upButton = this.votingElement.querySelector("button.green")
        let downButton = this.votingElement.querySelector("button.red")

        let vote = (up) => {
            this.presets[this.presetKeys[this.presetIndex]].rating += up ? 1 : -1
            this.votingElement.querySelector("#viz-vote-val").textContent = this.presets[this.presetKeys[this.presetIndex]].rating
            this.sortByCustomRatings()

            let formData = new FormData()
            formData.append("key", this.presetKeys[this.presetIndex])
            formData.append("mode", up ? "up" : "down")

            fetch("/butter-viz/vote", {
                method: "POST",
                body: formData
            }).then(() => {
                upButton.hidden = true
                downButton.hidden = true
            })
        }

        upButton.addEventListener("click", () => {
            vote(true)
        })
        downButton.addEventListener("click", () => {
            vote(false)
        })
    }
    updateVotingInfo(){
        this.votingElement.querySelector("#viz-vote-val").textContent = this.presets[this.presetKeys[this.presetIndex]].rating
        this.votingElement.querySelectorAll("button").forEach(button => button.hidden = false)
    }
    updateDebugInfo(){
        if(this.debugElement && sessionStorage.getItem("debug") === "true"){
            this.debugElement.innerHTML = `
                <div>Current Preset: ${this.presetKeys[this.presetIndex]}</div>
                <div>Current Preset Index: ${this.presetIndex}</div>
                <div>Preset History: ${this.presetIndexHist.join(", ")}</div>
                <div>Random Presets: ${this.presetRandom}</div>
                <div>Cycle Presets: ${this.presetCycle}</div>
                <div>Cycle Length: ${this.presetCycleLength}</div>
                <div>Audio Time: ${this.audio.currentTime}</div>
                <div>Audio Duration: ${this.audio.duration}</div>
            `
        }else{
            this.debugElement.innerHTML = ""
        }
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
    wightedRandomPreset(){
        let total = _.sumBy(this.presetKeys, presetKey => this.presets[presetKey].rating)
        let random = Math.random() * total
        let sum = 0
        for(let presetKey of this.presetKeys){
            sum += this.presets[presetKey].rating
            if(sum >= random){
                return presetKey
            }
        }
        return this.presetKeys[this.presetKeys.length - 1]
    }
    nextPreset(blendTime = 5.7, weighted=true) {
        this.presetIndexHist.push(this.presetIndex)

        let numPresets = this.presetKeys.length
        if (this.presetRandom) {
            if(weighted){
                this.presetIndex = this.presetKeys.indexOf(this.wightedRandomPreset())
                this.presets[this.presetKeys[this.presetIndex]].rating -= 1 // penalize the preset for being selected
                this.sortByCustomRatings()
            }else{
                this.presetIndex = Math.floor(Math.random() * this.presetKeys.length)
            }
        } else {
            this.presetIndex = (this.presetIndex + 1) % numPresets
        }

        this.visualizer.loadPreset(this.presets[this.presetKeys[this.presetIndex]], blendTime)
        this.updateVotingInfo()
    }
    prevPreset(blendTime = 5.7) {
        let numPresets = this.presetKeys.length
        if (this.presetIndexHist.length > 0) {
            this.presetIndex = this.presetIndexHist.pop()
        } else {
            this.presetIndex = ((this.presetIndex - 1) + numPresets) % numPresets
        }

        this.visualizer.loadPreset(this.presets[this.presetKeys[this.presetIndex]], blendTime)
        this.updateVotingInfo()
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
    finishInit() {
        this.computeCustomRatings()
        this.setVotingInfoInteracts()

        this.presetIndex = Math.floor(Math.random() * this.presetKeys.length)

        this.visualizer = butterchurn.createVisualizer(this.audioContext, this.canvas , {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            textureRatio: 1,
        })
        this.nextPreset(0)
        this.cycleInterval = setInterval(() => this.nextPreset(2.7), this.presetCycleLength)
        setInterval(() => this.updateDebugInfo(), 1000)
        document.addEventListener("keydown", (e) => {
            if (e.key === "ü") {
                sessionStorage.setItem("debug", sessionStorage.getItem("debug") === "true" ? "false" : "true")
                this.updateDebugInfo()
            }
        })
        this.updateVotingInfo()
    }
    initPlayer(callback) {
        this.loadCustomPresetWeights(() => {
            this.finishInit()
            callback()
        })
    }
    startPlayer() {
        this.initPlayer(() => {
            this.connectToAudioElement()
        })
    }
}

export default ButterChurnViz