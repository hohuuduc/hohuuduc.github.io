window.onload = () => {
    document.getElementById("back").onclick = () => {history.back()}
    const layout = document.getElementById("layout")
    var path = window.location.pathname.replace("/index.html", "")
    fetch('//api.github.com/repos/27hohuuduc/27hohuuduc.github.io/contents/' + path)
        .then(res => res.json())
        .then(json => {
            json.forEach(e => {
                console.log(e)
                if (e.type === "dir") {
                    var child = document.createElement("a")
                    child.href = "/" + e.path
                    child.innerText = e.name
                    layout.append(child)
                }
            });
        })
}