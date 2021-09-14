function admin_options(user, user_is_admin, user_is_suspended){
    let modal = new Modal(
        "#modal-wrapper",
        {
            title: "Admin Options",
            static_backdrop: true,
            centered: true
        },
        "large"
    )
    modal.Button(
        "admin-switch",
        user_is_admin ? "Remove Admin" : "Make Admin",
        `btn ${user_is_admin ? "btn-warning" : "btn-outline-warning"} w-100`,
        {},
        false,
    ).addEventListener("click", _ => {
        $.ajax({
            url: "/user",
            method: "POST",
            data: {
                switch_admin: user
            },
            success: _ => {
                location.reload()
            }
        })
    })
    modal.Button(
        "suspend-switch",
        user_is_suspended ? "Remove Suspension" : "Suspend",
        `btn ${user_is_suspended ? "btn-danger" : "btn-outline-danger"} w-100 mt-2`,
        {},
        false
    ).addEventListener("click", _ => {
        if (user_is_suspended){
            $.ajax({
                url: "/user",
                method: "POST",
                data: {
                    un_suspend_user: user
                },
                success: ()=>{
                    location.reload()
                }
            })
        }else{
            modal.clear()
            modal.SetOptions({
                title: "Suspend Account"
            })
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

            modal.Button("no", "Cancel", "btn btn-success", {}, true).addEventListener("click", _ => {
                modal.destroy()
                admin_options(user, user_is_admin, user_is_suspended)
            })

            modal.Button("yes", "Suspend", "btn btn-warning", {}, true).addEventListener("click", _ => {
                if((!ban_until.value && !ban_inf.checked) || !ban_message.value) return
                $.ajax({
                    url: "/user",
                    method: "POST",
                    data: {
                        suspend_user: user,
                        suspend_until: ban_inf.checked ? -1 : new Date(ban_until.value).getTime(),
                        suspend_message: ban_message.value
                    },
                    success: ()=>{
                        modal.destroy()
                        location.reload()
                    }
                })
            })
        }
    })
    // modal.Custom("<hr>")
    modal.Button(
        "del-switch",
        "Delete user",
        `btn btn-danger w-100 mt-2`,
        {},
        false
    ).addEventListener("click", _ => {
        modal.clear()
        modal.SetOptions({
            title: "Are you sure"
        })
        modal.FastText("Are you sure you want to delete this user?")
        modal.Button("no", "No, cancel", "btn btn-success", {}, true).addEventListener("click", _ => {
            modal.destroy()
            admin_options(user, user_is_admin, user_is_suspended)
        })
        modal.Button("yes", "Yes, delete", "btn btn-danger", {}, true).addEventListener("click", _ => {
            $.ajax({
                url: "/user",
                method: "POST",
                data: {
                    delete_user: user
                },
                success: _ => {
                    location.href = "/"
                }
            })
        })
    })

    modal.show()
}