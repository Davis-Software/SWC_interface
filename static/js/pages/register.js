$(".custom-file-input").on("change", function() {
    let fileName = $(this).val().split("\\").pop()
    if(fileName!=="") {
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName)
    }else{
        $(this).siblings(".custom-file-label").addClass("selected").html("No file selected")
    }
})

document.querySelector("form").addEventListener("submit", e => {
    if(e.target.checkValidity()){
        let passwd_0 = document.querySelector("input[name=password]").value
        let passwd_1 = document.querySelector("input[name=pwd-conf]").value
        if(passwd_0 !== passwd_1){
            e.preventDefault()
        }else{
            let button = e.target.querySelector("button")
            button.setAttribute("disabled", null)
            button.innerHTML = "<div class='spinner-border'></div>"
        }
    }
})
document.querySelector("input[name=pwd-conf]").addEventListener("keyup", e => {
    let pwd_inf = document.querySelector("#pwd-inf")
    let passwd_0 = document.querySelector("input[name=password]").value

    if(pwd_inf.hidden) pwd_inf.hidden = false

    if(passwd_0 === e.target.value && e.target.value !== ""){
        pwd_inf.innerText = "Passwords match"
        pwd_inf.classList.replace("text-danger", "text-success")
    }else{
        pwd_inf.innerText = "Passwords do not match"
        pwd_inf.classList.replace("text-success", "text-danger")
    }
})