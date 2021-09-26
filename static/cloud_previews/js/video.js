let video = document.querySelector("video")
let vol = document.querySelector("#vol-control")
let track = document.querySelector("#play-head")
let btn = document.querySelector("#play-pause")
let scr = document.querySelector("#framing")

function activation(act){
    vol.disabled = act
    track.disabled = act
    btn.disabled = act
}
activation(false)

scr.addEventListener("click", _ => {
    if(document.fullscreenElement === scr){
        document.exitFullscreen()
    }else{
        video.requestFullscreen()
    }
})
video.addEventListener("fullscreenchange", _ => {
    scr.querySelector("i").innerHTML = document.fullscreenElement === scr ? "fullscreen_exit" : "fullscreen"
})

function volume_change(set=true){
    document.querySelector("#vol-btn").innerHTML = vol.value === "0" ? "volume_off" : vol.value < 50 ? "volume_down" : "volume_up"
    video.volume = vol.value / 100
    if(set){
        localStorage.setItem("cloud_volume", video.volume.toString())
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
    video.currentTime = video.duration * track.value / 100
})
video.addEventListener("timeupdate", _ => {
    track.value = video.currentTime / video.duration * 100
})
btn.addEventListener("click", _ => {
    if(btn.disabled){return}
    if(video.paused){
        video.play()
        btn.querySelector("i").innerHTML = "pause"
    }else{
        video.pause()
        btn.querySelector("i").innerHTML = "play_arrow"
    }
})
video.addEventListener("ended", _ => {
    btn.querySelector("i").innerHTML = "play_arrow"
})

video.height = window.innerHeight - 60
window.addEventListener("resize", _ => {
    video.height = window.innerHeight - 60
})