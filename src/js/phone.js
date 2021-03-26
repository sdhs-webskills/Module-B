const $category = document.querySelector("#category");
const $list = document.querySelector("#list");

const result = fetch("/restAPI/phone.php").then(rs => rs.json())
  .then(data => {
    window.a = data;
    if(data.statusCd !== "200") {
      alert(data.statusMsg);
      return location.replace("/index.html");
    }
    const list = [{deptNm: "전체"}];

    data.items.forEach(item => {
      let returnValue = false;
      list.forEach((li, i) => {
        if(li.deptNm === item.deptNm) returnValue = i;
      })
      if(returnValue === false) {
        list.push({deptNm: item.deptNm, children: [{name: item.name, telNo: item.telNo}]});
      }else {
        list[returnValue].children.push({name: item.name, telNo: item.telNo});
      }
    })

    function addList(type) {
      $list.innerHTML = "";
      list.forEach(item => {
        if(item.deptNm === "전체") return false;
        if(type !== "전체" && type !== item.deptNm) return false;
        const tag = document.createElement("div");
        const subtitle = document.createElement("h2");
        const ul = document.createElement("ul");
        subtitle.innerHTML = item.deptNm;

        tag.append(subtitle, ul);

        item.children.forEach(i => {
          const li = document.createElement("li");
          const p = document.createElement("p");
          const span = document.createElement("span");

          p.innerHTML = i.name;
          span.innerHTML = i.telNo;

          li.append(p, span);

          ul.append(li);
        })

        $list.append(tag);
      })
    }

    list.forEach(item => {
      const category = document.createElement("div");
      category.innerHTML = item.deptNm;
      if(item.deptNm === "전체") category.classList.add("active");

      category.addEventListener("click", ({target}) => {
        $category.querySelector(".active").classList.remove("active");
        target.classList.add("active");

        addList(item.deptNm);
      })

      $category.append(category);

    })

    addList("전체");
  })