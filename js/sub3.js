const $historyTabs = document.querySelector("#history-tabs");
const $historyBox = document.querySelector("#history-box");

const resetHistoryTabs = () => $historyTabs.innerHTML = "";
const resetHistoryBox = () => $historyBox.innerHTML = "";

const getYear = () => localStorage.getItem("year") ?? "";
const setYear = year => localStorage.setItem("year", year);
const getItem = year => localStorage.getItem(year) ? JSON.parse(localStorage.getItem(year)) : [];
const setItem = (year, newItem, flag = true) => localStorage.setItem(year, JSON.stringify(flag ? [...getItem(year), ...newItem] : [...newItem]));
const getYearKeys = () => Object.keys(localStorage).filter(name => name !== "year");
const removeItem = name => localStorage.removeItem(name);

const append = (target, position, html) => target.insertAdjacentHTML(position, html);

const historyTab = year => `<li class='history-tab ${getYear() === year ? "active-history-tab" : ""}'>${year}</li>`;
const historyTabSelect = year => [...document.querySelectorAll(`.history-tab`)].filter(tab => tab.textContent === year)[0];
const historyTabGenerator = year => append($historyTabs, "beforeend", historyTab(year));
const removeHistoryTab = year => historyTabSelect(year) ? $historyTabs.removeChild(historyTabSelect(year)) : false;

const historyBox = year => `<div class='history-box' data-year='${year}' style="display: none;"><h1>${year}</h1><div></div><div></div></div>`;
const historyBoxSelect = year => document.querySelector(`.history-box[data-year='${year}']`);
const historyBoxGenerator = year => append($historyBox, "beforeend", historyBox(year));
const removeHistoryBox = year => historyBoxSelect(year) ? $historyBox.removeChild(historyBoxSelect(year)) : false;

const historyItem = (date, content) => `<div class="history"><li>${date}</li><li>${content}</li><div><button class="edit">수정</button><button class="delete">삭제</button></div></div>`;
const historyItemGenerator = (year, date, content) => append(historyBoxSelect(year).children[1], "beforeend", historyItem(date, content));

const historyRender = year => historyBoxSelect(year ?? getYear()) ? historyBoxSelect(year ?? getYear()).style.display = "flex" : "";
const historyDisplayNone = () => [...$historyBox.children].forEach(element => element.style.display = "none");

const cleanLocalStorage = () => Object.keys(localStorage).forEach(key => {if(getItem(key) === "" || getItem(key).length === 0) removeItem(key);});

const render = () => {
	cleanLocalStorage();

	getYearKeys().forEach(year => {
		if(year !== "") {
			historyTabGenerator(year);
			historyBoxGenerator(year);

			getItem(year).forEach(item => {
				const date = item["date"].substring(5).replace("-",".");
				historyItemGenerator(year, date, item["content"]);
			});
		};
	});

	historyDisplayNone();
	if(!historyTabSelect(getYear())) {
		setYear($historyTabs.children[0]?.textContent ?? "");
		historyRender($historyTabs.children[0]?.textContent);
	};
	if(historyBoxSelect(getYear())) historyRender();
};
render();

const reset = () => {
	cleanLocalStorage();
	resetHistoryTabs();
	resetHistoryBox();
	render();
};

$historyTabs.addEventListener("mouseup", ({ target }) => {
	[...$historyTabs.children].forEach(tab => tab.classList.remove("active-history-tab"));

	target.classList.add("active-history-tab");

	setYear(target.textContent);

	historyDisplayNone();
	historyRender();
});

const $addHistory = document.querySelector("#add-history");
$addHistory.addEventListener("click", () => document.forms["insert"].style.display = "block");

document.addEventListener("click", event => {
	const { target } = event;

	if(target.classList.contains("close")) {
		event.preventDefault();

		target.parentNode.parentNode.reset();
		target.parentNode.parentNode.style.display = "none";
	};

	if(target.classList.contains("edit")) {
		const parent = target?.parentNode?.parentNode;
		const index = [...parent.parentNode.children].findIndex(element => element === parent);
		const { content, date } = getItem(getYear())[index];

		const form = document.forms["modify"];
		form["modify-content"].value = content;
		form["modify-date"].value = date;
		form.dataset.old = date;
		form.dataset.index = index;
		return form.style.display = "block";
	};

	if(target.classList.contains("delete")) {
		const parent = target?.parentNode?.parentNode?.parentNode;
		const index = [...parent.parentNode.children].findIndex(element => element === parent);	

		const year = getYear();
		const items = getItem(year).filter((item, idx) => idx !== index - 1);

		setItem(year, items, false);
		reset();

		if(items.length === 0) {
			removeHistoryTab(year);
			removeHistoryBox(year);
		};
	};
});
document.addEventListener("submit", event => {
	event.preventDefault();

	const form = event.target;

	if(form.id === "insert") {
		const $content = form["insert-content"].value;
		const $date = form["date"].value;
		const year = $date.substring(0, 4);
		const items = getItem(year);

		const date = $date.substring(5).replace("-",".");

		setItem(date, [{date: $date, content: $content}]);
		
		if(getYear() === "") setYear(year);

		if(!historyBoxSelect(year)) {
			historyTabGenerator(year);
			historyBoxGenerator(year);
		};

		append(historyBoxSelect(year).children[1], "beforeend", historyItem(date, $content));

		form.reset();
		form.style.display = "none";

		return reset();
	};

	if(form.id === "modify") {
		const $content = form["modify-content"].value;
		const $date = form["modify-date"];
		const index = form.dataset.index;

		const year = $date.value;
		const items = getItem(year);
		const oldYear = form.dataset.old;

		if(oldYear !== year) {
			const oldItems = getItem(oldYear).slice(index, 1);
			
			localStorage.setItem(oldYear, JSON.stringify(...oldItems));

			setItem(year.substring(0, 4), [{date: year, content: $content}]);

			form.style.display = "none";
			form.reset();

			return reset();
		};

		$date.dataset.old = $date.value;

		items[index] = {date: $date.value, content: $content};

		setItem(year.substring(0, 4), items, false);

		form.style.display = "none";
		form.reset();

		return reset();
	};
});