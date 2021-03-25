const $historyTabs = document.querySelector("#history-tabs");

const historySelect = year => {
	// 년도를 받아서 선택후 리턴 / 해당하는 탭이 없을경우 생성 후 리턴
	const length = document.querySelectorAll(".history-box").length;
	const $history = document.querySelector(`.history-box[data-year='${year}']`);

	if(!$history) {
		if(!localStorage.getItem("year")) localStorage.setItem("year", year);

		$historyTabs.insertAdjacentHTML("beforeend", `
			<li class='history-tab ${length === 0 ? "active-history-tab" : localStorage.getItem("year") === year ? "active-history-tab" : ""}'>${year}</li>
			`);

		document.querySelector("#history-box").insertAdjacentHTML("beforeend", `
			<div class='history-box' data-year='${year}' style="display: flex;">
			<h1>${year}</h1>
			<div></div>
			<div></div>
			</div>
			`);

		const $historyTab = [...document.querySelectorAll(".history-tab")]
							.filter(({ textContent }) => textContent === localStorage.getItem("year"))[0];

		$historyTab?.classList.add("active-history-tab");

		return document.querySelector(`.history-box[data-year='${year}']`);
	};

	return $history;
};

const historyItem = (date, content) => { // 연혁 아이템
	return `<div class="history">
				<li>${date}</li>
				<li>${content}</li>
				<div>
					<button class="edit">수정</button>
					<button class="delete">삭제</button>
				</div>
			</div>`;
};

const historyRender = index => { // 클릭한 년도별 연혁 박스 디스플레이
	const year = localStorage.getItem("year") ?? index;
	const items = JSON.parse(localStorage.getItem(index ?? year)) ?? [];

	const $histories = document.querySelectorAll(".history-box");
	$histories.forEach(history => history.style.display = "none");

	const $history = document.querySelector(`.history-box[data-year='${year}']`) ?? $histories[0];
	if($history) $history.style.display = "flex";
};
historyRender();

const historyGenerator = year => { // 연혁 생성
	historySelect(year).children[1].innerHTML = "";

	const items = JSON.parse(localStorage.getItem(year));

	items.forEach(item => {
		historySelect(year)
		.children[1]
		.insertAdjacentHTML("beforeend", historyItem(item["date"], item["content"]));
	});
};

const historyTabGenerator = () => { // 탭 생성
	const years = Object.keys(localStorage).filter(name => name !== "year");
	years.forEach(year => historySelect(year));
};

const removeHistoryTab = year => { // 탭 삭제
	const $historyTab = [...document.querySelectorAll(".history-tab")]
							.filter(({ textContent }) => textContent === year)[0];

	if($historyTab)	$historyTabs.removeChild($historyTab);

	if(localStorage.getItem("year") === year)
		localStorage.setItem("year", $historyTabs.children[0] !== undefined ? $historyTabs.children[0].textContent : "");

	localStorageRender();
	tabRender();
};

// 탭 정렬
const tabAlign = nodeList => [...nodeList].sort((a, b) => a.innerHTML > b.innerHTML ? -1 : 1);
const tabRender = () => { // 정렬한 탭 렌더
	historyTabGenerator();
	
	const alignedTabs = tabAlign(document.querySelectorAll(".history-tab"));

	for(let i = 0, limit = alignedTabs.length; i < limit; i++) {
		const tab = alignedTabs[i];
		const year = tab.textContent;

		$historyTabs.insertAdjacentElement("beforeend", tab);

		if(JSON.parse(localStorage.getItem(year)).length === 0) {
			localStorage.removeItem(year);
			removeHistoryTab(year);

			localStorage.setItem("year", $historyTabs.children[0] !== undefined ? $historyTabs.children[0].textContent : "");
		};
	}

	const $historyTab = [...document.querySelectorAll(".history-tab")]
							.filter(({ textContent }) => textContent === localStorage.getItem("year"))[0];

	$historyTab?.classList.add("active-history-tab");
};

const localStorageRender = () => { // 년도별로 연혁 렌더
	tabRender();

	const year = localStorage.getItem("year");
	const $historyTab = [...document.querySelectorAll(".history-box > h1")]
							.filter(({ textContent }) => textContent === year)[0];

	const years = Object.keys(localStorage).filter(name => name !== "year");

	years.forEach(year => {
		historySelect(year).children[1].innerHTML = "";
	});

	years.forEach(year => {
		const $history = historySelect(year);

		const items = JSON.parse(localStorage.getItem(year)) ?? [];
		items.forEach(item => {
			$history.children[1].insertAdjacentHTML("beforeend", historyItem(item["date"], item["content"]));
		});
	});

	historyRender();
};
localStorageRender();

[...$historyTabs.children].forEach(tab => { // 로컬스토리지에 저장된 년도를 액티브
	tab.classList.remove("active-history-tab");

	const year = localStorage.getItem("year") ?? $historyTabs.children[0].textContent;

	if(tab.textContent === year)
		tab.classList.add("active-history-tab");
});

$historyTabs.addEventListener("mouseup", ({ target }) => {
	[...$historyTabs.children].forEach(tab => {
		tab.classList.remove("active-history-tab");
	});

	target.classList.add("active-history-tab");

	localStorage.setItem("year", target.textContent);

	historyRender(target.textContent);
});

const $popupBox = document.querySelector("#popup-box");
const $addHistory = document.querySelector("#add-history");
$addHistory.addEventListener("click", () => {
	$popupBox.style.display = "block";
});

const popupReset = () => { // 팝업 초기화
	[...document.querySelectorAll(".popup-group")]
		.forEach(({ children }) => children[1].value = "");

	$popupBox.style.display = "none";
};

const openPopup = (...arguments) => { // 수정 팝업 생성
	const [ content, date, index ] = arguments;
	const oldYear = date.substring(0, 4);

	document.body.insertAdjacentHTML("beforeend", `
	<div id="clone-popup-box" style="display: block;">
		<div id="clone-popup">
			<div>
				<div class="popup-group">
					<label for="history-content">연혁 내용 : &nbsp;</label>
					<input type="text" id="clone-history-content" name="연혁 내용" value="${arguments[0]}">
				</div>
				<div class="popup-group">
					<label for="date">연혁 일자 : &nbsp;</label>
					<input type="date" id="clone-date" name="연혁 일자" value="${arguments[1]}">
				</div>
			</div>
			<div id="clone-button-box">
				<button id="clone-close">닫기</button>
				<button id="clone-save">저장</button>
			</div>
		</div>
		<div id="clone-blind"></div>
	</div>
	`);

	const $clonePopup = document.querySelector("#clone-popup-box");

	const $close = document.querySelector("#clone-close");
	$close.addEventListener("click", ({ target }) => document.body.removeChild($clonePopup));

	const $save = document.querySelector("#clone-save");
	$save.addEventListener("click", ({ target }) => {
		const $historyContent = document.querySelector("#clone-history-content");
		const $date = document.querySelector("#clone-date");

		if($historyContent.value === "") {
			alert("연혁 내용칸이 비었습니다");

			return $historyContent.focus();
		};

		if($date.value === "") {
			alert("연혁 날짜칸이 비었습니다");

			return $date.focus();
		};

		const year = $date.value.substring(0, 4);
		const items = JSON.parse(localStorage.getItem(year)) ?? [];

		document.body.removeChild($clonePopup);

		if(oldYear !== year) {
			const parent = target?.parentNode?.parentNode;

			parent.parentNode.removeChild(parent);

			const oldItems = JSON.parse(localStorage.getItem(oldYear)).filter((item, idx) => idx !== index);
			localStorage.setItem(oldYear, JSON.stringify([...oldItems]));
		};

		localStorage.setItem(year, JSON.stringify([...items, {date: $date.value, content: $historyContent.value}]));

		historySelect(year).children[1].innerHTML = "";

		tabRender();
		historyGenerator(year);
		localStorageRender();
		return historySelect(year);
	});
};

const $save = document.querySelector("#save");
$save.addEventListener("click", () => {
	const $historyContent = document.querySelector("#history-content");
	const $date = document.querySelector("#date");

	if($historyContent.value === "") {
		alert("연혁 내용칸이 비었습니다");

		return $historyContent.focus();
	};

	if($date.value === "") {
		alert("연혁 날짜칸이 비었습니다");

		return $date.focus();
	};

	const year = $date.value.substring(0, 4);
	const items = JSON.parse(localStorage.getItem(year)) ?? [];

	localStorage.setItem(year, JSON.stringify([...items, {date: $date.value, content: $historyContent.value}]));

	historySelect(year)
	.children[1]
	.insertAdjacentHTML("beforeend", historyItem($date.value, $historyContent.value));

	popupReset();
	historyRender();
	tabRender();
});

const $close = document.querySelector("#close");
$close.addEventListener("click", ({ target }) => popupReset());

const $historyBox = document.querySelector("#history-box");
$historyBox.addEventListener("click", ({ target }) => {
	if(target.classList.contains("edit")) {
		const parent = target?.parentNode?.parentNode;
		const content = parent.children[1].innerHTML;
		const date = parent.children[0].innerHTML;
		const index = [...parent.parentNode.children].findIndex(element => element === parent);

		return openPopup(content, date, index);
	};

	if(target.classList.contains("delete")) {
		const parent = target?.parentNode?.parentNode?.parentNode;
		const index = [...parent.parentNode.children].findIndex(element => element === parent);	

		const year = localStorage.getItem("year");
		const items = JSON.parse(localStorage.getItem(year)).filter((item, idx) => idx !== index - 1);

		localStorage.setItem(year, JSON.stringify([...items]));
		localStorageRender();

		if(items.length === 0) {
			removeHistoryTab(year);
			parent.parentNode.parentNode.removeChild(parent.parentNode);
		};
	};
});