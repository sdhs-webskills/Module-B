const url = "/xml/nihList.xml";
const $albumList = document.querySelector("#albumList");
const $listList = document.querySelector("#listList");
const $pagingList = document.querySelector("#pagingList");
const $count = document.querySelector("#count");
const $page = document.querySelector("#page");
const $maxPage = document.querySelector("#maxPage");
let maxPage = 1;
let page = 1;

function changePage(data) {
  $albumList.innerHTML = "";
  $page.innerHTML = page;
  data.forEach((item, i) => {
    if(i <= page * 8 && i > (page - 1) * 8){
      const div = document.createElement("div");
      const img = new Image();
      const name = item.ccbaMnm1;
  
      const itemURL = `/xml/detail/${item.ccbaKdcd}_${item.ccbaCtcd}_${item.ccbaAsno}.xml`;
      const src = fetch(itemURL)
                    .then(res => res.text())
                    .then(data => new DOMParser().parseFromString(data, "text/xml"))
                    .then(data => {
                      return [...data.querySelectorAll("item")].map(({children}) => {
                        return [...children].reduce((acc, {tagName, textContent}) => {
                          acc[tagName] = textContent;
  
                          return acc;
                        }, {})
                      })
                    })
      src.then(data => img.src = `/xml/nihcImage/${data[0].imageUrl}`);
  
      img.onerror = function() {
        img.src = "/src/images/no_image.png";
        img.alt = "No images";
      }
  
      div.append(img, name);
  
      div.classList.add("item");
  
      $albumList.append(div);
    }
  })
}

function hasClass(element, className) {
  return element.classList.contains(className);
}

const result = fetch(url)
                .then(res => res.text())
                .then(data => new DOMParser().parseFromString(data, "text/xml"))
                .then(data => {
                  return [...data.querySelectorAll("item")].map(({children}) => {
                    return [...children].reduce((acc, {tagName, textContent}) => {
                      acc[tagName] = textContent;

                      return acc;
                    }, {})
                  })
                })

result.then(data => {
  maxPage = Math.ceil(data.length / 8);
  $count.innerHTML = data.length;
  $maxPage.innerHTML = maxPage;
  changePage(data);

  for(let i = 1; i <= maxPage; i++) {
    const td = document.createElement("td");
    td.innerHTML = i;
    
    td.classList.add("button", `paging${i}`, "pagingButton");

    if(i === 1) td.classList.add("active");

    $pagingList.querySelector(".next").before(td);
  }

  
  $pagingList.querySelectorAll(".button").forEach(item => item.addEventListener("click", e => {
    target = e.target;
    num = Number(target.innerHTML);

    if(num > 0) {
      page = num;

      changePage(data);

      $pagingList.querySelector(".active").classList.remove("active");

      target.classList.add("active");
    }else {
      if(hasClass(target, "prev")) {
        page--;
        if(page < 1) page = 1;
      }
      if(hasClass(target, "next")) {
        page++;
        if(page > maxPage) page = maxPage;
      }
      if(hasClass(target, "first")) page = 1;
      if(hasClass(target, "last")) page = maxPage;
      $pagingList.querySelector(".active").classList.remove("active");
      $pagingList.querySelectorAll(".pagingButton")[page - 1].classList.add("active");

      changePage(data);
    }
  }))
})