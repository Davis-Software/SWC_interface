let audio = document.querySelector("audio")
let vol = document.querySelector("#vol-control")
let track = document.querySelector("#play-head")
let btn = document.querySelector("#play-pause")

function activation(act){
    vol.disabled = act
    track.disabled = act
    btn.disabled = act
}
activation(false)

function volume_change(set=true){
    document.querySelector("#vol-btn").innerHTML = vol.value === "0" ? "volume_off" : vol.value < 50 ? "volume_down" : "volume_up"
    audio.volume = vol.value / 100
    if(set){
        localStorage.setItem("cloud_volume", audio.volume.toString())
    }
}
vol.addEventListener("input", volume_change)
if(localStorage.getItem("cloud_volume")){
    vol.value = Number(localStorage.getItem("cloud_volume")) * 100
    volume_change(false)
}

track.min = 0
track.max = 100
track.step = 0.25
track.value = 0

track.addEventListener("input", _ => {
    audio.currentTime = audio.duration * track.value / 100
})
audio.addEventListener("timeupdate", _ => {
    track.value = audio.currentTime / audio.duration * 100
})
btn.addEventListener("click", _ => {
    if(btn.disabled){return}
    if(audio.paused){
        audio.play()
        btn.querySelector("i").innerHTML = "pause"
    }else{
        audio.pause()
        btn.querySelector("i").innerHTML = "play_arrow"
    }
})
audio.addEventListener("ended", _ => {
    btn.querySelector("i").innerHTML = "play_arrow"
})

let wave = new Wave();
wave.fromElement("audio-data", "visualizer", {
    type: "shockwave",
    colors: [
        "#8aedec",
        "#d4a28d",
        "#d4dc40",
        "#2e2321"
    ]
})
wave.onFileLoad = _ => {
    activation(true)
}

document.querySelector("canvas").width = window.innerWidth
document.querySelector("canvas").height = window.innerHeight - 60
window.addEventListener("resize", _ => {
    document.querySelector("canvas").width = window.innerWidth
    document.querySelector("canvas").height = window.innerHeight - 60
})