import ButterChurnViz from "./butterchurn-viz";

let audio = document.querySelector("audio")
let vol = document.querySelector("#vol-control")
let track = document.querySelector("#play-head")
let btn = document.querySelector("#play-pause")
let sw_btn = document.querySelector("#change-visualizer")

let viz_mode = localStorage.getItem("audio-viz-mode") || "wave"
sw_btn.addEventListener("click", () => {
    if(viz_mode === "butterchurn"){
        localStorage.setItem("audio-viz-mode", "wave")
    }else{
        localStorage.setItem("audio-viz-mode", "butterchurn")
    }
    window.location.reload()
})

function activation(act=false){
    if(audio.readyState <= 2) return
    vol.disabled = act
    track.disabled = act
    btn.disabled = act
    if(!act && checker){
        clearInterval(checker)
        checker = null
        if(audio.paused) toggle_play()
    }
}
activation(true)
setTimeout(() => {toggle_play()}, 120)
let checker = setInterval(activation, 1000)

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
function toggle_play(){
    if(audio.paused){
        audio.play().then(_ => {
            btn.querySelector("i").innerHTML = "pause"
        }).catch(err => {
            alert(err)
        })
    }else{
        audio.pause()
        btn.querySelector("i").innerHTML = "play_arrow"
    }
}
btn.addEventListener("click", _ => {
    if(btn.disabled){return}
    toggle_play()
})
audio.addEventListener("ended", _ => {
    btn.querySelector("i").innerHTML = "play_arrow"
})

if(viz_mode === "wave") {
    (new Wave()).fromElement("audio-data", "visualizer", {
        type: "shockwave",
        colors: [
            "#8aedec",
            "#d4a28d",
            "#d4dc40",
            "#2e2321"
        ]
    })
}else{
    let butterChurn = new ButterChurnViz(
        "#visualizer",
        "#audio-data",
        "#viz-voting",
        "#visualizer-info"
    )
    butterChurn.startPlayer()
}

document.querySelector("canvas").width = window.innerWidth
document.querySelector("canvas").height = window.innerHeight - 60
window.addEventListener("resize", _ => {
    document.querySelector("canvas").width = window.innerWidth
    document.querySelector("canvas").height = window.innerHeight - 60
})


document.querySelectorAll("#viz-voting *[title]").forEach(elem => {
    new bootstrap.Tooltip(elem)
})

export default toggle_play