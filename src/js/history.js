const $addHistory = document.querySelector("#addHistory");
const $years = document.querySelector("#years");
const $year = document.querySelector("#year");
const $list = document.querySelector("#list");
const $historyForm = document.querySelector("#historyForm");
const $close = document.querySelector(".close");
const $save = document.querySelector("#save");

const yearList = JSON.parse(localStorage.getItem("yearList")) ?? [];
const historyList = JSON.parse(localStorage.getItem("historyList")) ?? [];
let selectYear = localStorage.getItem("selectYear") ? JSON.parse(localStorage.getItem("selectYear")) : yearList.length > 0 ? yearList[yearList.length - 1] : null;

function hasClass(element, className) {
  return element.classList.contains(className);
}

const setText = function (element, text = "") {
  if(text !== "") element.querySelector(".text").innerHTML = text;
  else return element.querySelector(".text").innerHTML;
}

function createElement(element, classList = []) {
  const result = document.createElement(element);
  classList.forEach(cl => {
    result.classList.add(cl);
  })
  return result;
}

function changeYear() {
  if(!selectYear > 0) {
    $year.style.display = "none";
  }else {
    $year.style.display = "";
    setText($year, selectYear);
  }
  localStorage.setItem("selectYear", selectYear);
  document.querySelectorAll(".year").forEach(e => {
    if(e.querySelector(".text").innerHTML == selectYear) {
      e.classList.add("active")
    }else {
      e.classList.remove("active")
    }
  });

  $list.innerHTML = "";

  historyList.forEach((item, i) => {
    if(item.year === selectYear) {
      const li = createElement("li", ["item"]);
      const date = createElement("span", ["date"]);
      const notice = createElement("span", ["notice"]);
      const modifyBtn = createElement("span", ["button", "modify"]);
      const deleteBtn = createElement("span", ["button", "delete"]);

      date.innerHTML = item.date;
      notice.innerHTML = item.text;
      modifyBtn.innerHTML = "수정";
      deleteBtn.innerHTML = "삭제";

      li.append(date, notice, modifyBtn, deleteBtn);

      li.dataset.no = item.no;

      $list.append(li);

      deleteBtn.addEventListener("click", _ => {
        let thisYears = 0;
        historyList.forEach(e => {if(e.year === item.year) thisYears++});

        if(thisYears === 1) {
          yearList.splice(yearList.indexOf(item.year), 1);

           selectYear= yearList.length > 0 ? yearList[yearList.length - 1] : null;

          localStorage.setItem("yearList", JSON.stringify(yearList));
          changeYearList();
        }

        historyList.splice(i, 1);

        
        localStorage.setItem("historyList", JSON.stringify(historyList));
        changeYear();
      })

      modifyBtn.addEventListener("click", _ => {
        $historyForm.notice.value = item.text;
        $historyForm.date.value = `${item.year}-${item.date.split(".").join("-")}`;
        $historyForm.style.display = "block";
        $historyForm.classList.add("modifing");
        $historyForm.dataset.no = item.no;
      })
    }
  })
}

function changeYearList() {
  $years.innerHTML = "<tbody><tr></tr></tbody>";

  yearList.forEach(item => {
    const td = createElement("td", ["year"]);
    const text = createElement("span", ["text"]);
  
    text.innerHTML = item;
  
    td.append(text, "년");
  
    if(item === selectYear) td.classList.add("active");
  
    $years.querySelector("tr").prepend(td);
  
    td.addEventListener("click", _ => {
      selectYear = Number(td.querySelector(".text").innerHTML);
  
      changeYear();
    })
  })
}


$addHistory.addEventListener("click", e => {
  $historyForm.style.display = "block";
})

$close.addEventListener("click", e => {
  $historyForm.style.display = "";
  $historyForm.notice.value = "";
  $historyForm.date.value = "";
  $historyForm.classList.remove("modifing");
  $historyForm.dataset.no = null;
})

$historyForm.addEventListener("submit", e => {
  e.preventDefault();
})

$save.addEventListener("click", e => {
  if($historyForm.notice.value === "") return alert("연혁내용을 작성해주세요.");
  if($historyForm.date.value === "") return alert("연혁일자를 작성해주세요.");
  const result = {};
  let date = $historyForm.date.value.split("-");
  result.year = Number(date[0]);
  result.date = `${date[1]}.${date[2]}`;
  result.text = $historyForm.notice.value;
  result.time = Number(date.join(''));
  result.no = Date.now();

  if(hasClass($historyForm, "modifing")) {
    historyList.forEach((item, i) => {
      if(item.no == $historyForm.dataset.no) {
        let thisYears = 0;
        historyList.forEach(e => {if(e.year === item.year) thisYears++});
  
        if(thisYears === 1 && item.year !== result.year) {
          yearList.splice(yearList.indexOf(item.year), 1);
          
          selectYear= yearList.length > 0 ? yearList[yearList.length - 1] : null;

          localStorage.setItem("yearList", JSON.stringify(yearList));
          changeYearList();
        }

        const no = item.no;
        historyList[i] = result;
        historyList[i].no = no;
      }
    })
  }else {
    historyList.push(result);
  }
  historyList.sort(function (a, b) {
    return a.time - b.time;
  })

  if(yearList.indexOf(result.year) < 0) {
    yearList.push(result.year);

    yearList.sort(function (a, b) {
      return a - b;
    })

    localStorage.setItem("yearList", JSON.stringify(yearList));
    changeYearList();
  }

  localStorage.setItem("historyList", JSON.stringify(historyList));

  $historyForm.notice.value = "";
  $historyForm.date.value = "";
  $historyForm.style.display = "";
  $historyForm.classList.remove("modifing");
  $historyForm.dataset.no = null;
  if(selectYear === null) selectYear = Number(date[0]);

  changeYear();
})

changeYearList();
changeYear();