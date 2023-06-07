let page = ""

const user_content_template = document.querySelector("#user-content-template").innerHTML
const user_list = document.querySelector("#user-list")
const user_content = document.querySelector("#user-content")

const user_list_template = `
<li class="searchable" data-username="user_username">
    <button class="user-btn" data-bs-toggle="tab" id="user-btn-user_username">
        user_username
    </button>
</li>
`


function setContent(user){
    if (user === null){
        user_content.innerHTML = ""
        return
    }
    $.ajax({
        url: `?get_user=${user}`,
        success: (response) => {
            let user_data = response.data
            user_content.innerHTML = user_content_template
                .replaceAll("user_username", user)
                .replaceAll("user_created", new Date(user_data.created).toLocaleString("de-DE"))
                .replaceAll("user_admin", user_data.admin)
                .replaceAll("user_cloud", user_data.cloud)
                .replaceAll("user_description", user_data.description)

            let permsInput = user_content.querySelector(`#perms-acc_${user}`)
            permsInput.value = JSON.parse(user_data.permissions).join(",")
            permsInput.parentElement.querySelector("button").addEventListener("click", e => {
                e.target.disabled = true
                let data = new FormData()
                let request = new XMLHttpRequest()

                data.append("set_permissions", user)
                data.append("permissions", permsInput.value)

                request.addEventListener("load", _ => {
                    setContent(user)
                })

                request.open("POST", "/acp/users")
                request.send(data)
            })
        }
    })
}
function load_users(){
    $.ajax({
        url: "?get_users",
        success: (response) => {
            user_list.innerHTML = ``
            for(let user of response.data){
                user_list.innerHTML += user_list_template
                    .replaceAll("user_username", user.replaceAll(" ", "-"))
                setTimeout(()=>{
                    user_list.querySelector(`#user-btn-${user.replaceAll(" ", "-")}`)
                        .addEventListener("click", ()=>{
                            if(user !== page) {
                                user_content.innerHTML = "<div class='spinner-border'></div>"
                                setContent(user)
                                page = user
                            }
                        })
                }, 200)
                $("#user-search").on("keyup", function() {
                    let value = $(this).val().toLowerCase()
                    $("#user-list li.searchable").filter(function() {
                        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                    })
                })
            }
        }
    })
}


{
    load_users()
}

function new_user(){
    let modal = new Modal("#modal-wrapper", {title: "New Extension", static_backdrop: true}, "huge")
    modal.Custom(`
        <div>
            <form id="form_22231">
                <input type="text" class="form-control" name="name" placeholder="name" required> <br>
                <input type="password" class="form-control" name="id" placeholder="Password" pattern="[A-Za-z0-9-_+%€/]{6,}" title="Allowed: A-Z a-z 0-9 - _" required> <br>
                <textarea class="form-control" type="text" name="desc" placeholder="description" required></textarea> <br>
                Image: <input class="btn btn-outline-primary" type="file" name="pict" placeholder="picture" accept="image/png,image/jpeg,image/gif"> <br><br>
                Admin: <input type="checkbox" class="form-check-input" name="admin"> <br>
                Cloud: <input type="checkbox" class="form-check-input" name="cloud"> <br><br>
            </form>
        </div>
    `)
    modal.Button(
        "form_submit",
        "Create",
        "btn btn-outline-warning w-100",
        {
            form: "form_22231"
        },
        true
    )

    document.querySelector("#form_22231").addEventListener("submit", e => {
        let wrapper = e.target
        let password = wrapper.querySelector("input[name='id']").value
        let name = wrapper.querySelector("input[name='name']").value
        let desc = wrapper.querySelector("textarea").value
        let pict = wrapper.querySelector("input[name='pict']")
        let admin = wrapper.querySelector("input[name='admin']").checked
        let cloud = wrapper.querySelector("input[name='cloud']").checked

        e.preventDefault()

        let data = new FormData()
        let request = new XMLHttpRequest()

        data.append("passwd", password)
        data.append("name", name)
        data.append("desc", desc)
        data.append("pict", pict.files[0])
        data.append("create_user", null)
        data.append("admin", admin)
        data.append("cloud", cloud)

        request.addEventListener("load", _ => {
            modal.destroy()
            setTimeout(()=>{
                load_users()
                setContent(name)
            }, 200)
        })

        request.open("POST", "/acp/users")
        request.send(data)
    })
    modal.show()
}

function delete_avatar(user){
    let modal = new Modal("#modal-wrapper", {title: "Delete Avatar"}, "large")
    modal.Custom(`
        Are you sure that you want to delete this user's Avatar?
    `)
    modal.Button(
        "form_submit",
        "Yes, delete",
        "btn-outline-danger",
        {},
        true
    ).addEventListener("click", _ => {
        let data = new FormData()
        let request = new XMLHttpRequest()

        data.append("remove_avatar", username)

        request.addEventListener("load", _ => {
            modal.destroy()
            load_users()
            setContent(page)
        })

        request.open("POST", "/acp/users")
        request.send(data)
    })
    modal.show()
}
function suspend_user(user){
    let modal = new Modal("#modal-wrapper", {title: "Suspend Account"}, "large")
    modal.Custom(`
        <div>
            <label class="w-100">
                Suspend until:
                <input id="banUser-inp" type="datetime-local" class="form-control bg-dark text-light">
            </label>
            <label>
                Suspend permanently:
                <input id="banUser-perm" type="checkbox" class="checkbox">
            </label>
            <hr>
            <textarea id="banUser-message" placeholder="Reason (Text, Markdown or X-/HTML)" class="form-control bg-dark text-light"
            spellcheck="false" autocomplete="off"></textarea>
        </div>
        <br><br>
        <h5>Warning! Suspending the account will also delete all associated Reports.</h5>
    `)

    let ban_until = document.getElementById("banUser-inp")
    let ban_inf = document.getElementById("banUser-perm")
    let ban_message = document.getElementById("banUser-message")

    ban_inf.addEventListener("click", e => {
        ban_until.disabled = e.target.checked
    })

    modal.Button(
        "banUserBtn",
        "Suspend",
        "btn-warning",
        {},
        true
    ).addEventListener("click", e => {
        e.preventDefault()
        if((!ban_until.value && !ban_inf.checked) || !ban_message.value) return
        $.ajax({
            method: "POST",
            data: {
                suspend_user: user,
                suspend_until: ban_inf.checked ? -1 : new Date(ban_until.value).getTime(),
                suspend_message: ban_message.value
            },
            success: ()=>{
                modal.destroy()
            }
        })
    })
    modal.show()
}
function delete_user(username){
    let modal = new Modal("#modal-wrapper", {heading: "Delete User"}, "large")
    modal.Custom(`
        Are you sure that you want to delete this user?
    `)
    modal.Button(
        "form_submit",
        "Yes, delete",
        "btn-outline-danger",
    ).addEventListener("click", _ => {
        let data = new FormData()
        let request = new XMLHttpRequest()

        data.append("remove_user", username)

        request.addEventListener("load", _ => {
            modal.destroy()
            load_users()
            setContent(null)
        })

        request.open("POST", "/acp/users")
        request.send(data)
    })
    modal.show()
}