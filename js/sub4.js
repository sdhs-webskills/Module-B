const url = "restAPI/phone.php";

const result = fetch(url)
.then(res => res.json())
.then(data => {
	if(data.statusCd !== "200") {
		alert("조회에 실패했습니다");

		return location.href = "index.html";
	};

	return [...data.items].reduce(((item, { sn, deptNm, name, telNo }) => {
		item[deptNm] = [...item[deptNm] || [], {sn, name, telNo}]

		return item;
	}), {});
});

const $tabBox = document.querySelector("#tab-box");
const $phoneBox = document.querySelector("#phone-box");

result.then(items => {
	const tabs = Object.keys(items);

	tabs.forEach(tab => {
		$tabBox.insertAdjacentHTML("beforeend", `<li class="tab">${tab}</li>`);

		$phoneBox.insertAdjacentHTML("beforeend", `
			<div class="phone-box" data-tab="${tab}">
				<div class="phone-header">
					<h1>${tab}</h1>
					<hr>
				</div>
				<div class="phone-body"></div>
			</div>
		`);

		items[tab].forEach(item => {
			const $phone = [...$phoneBox.children].filter(element => element.dataset.tab === tab)[0];
			$phone.children[1].insertAdjacentHTML("beforeend", `
				<div class="phone">
					<li>${item["name"]}</li>
					<li>${item["telNo"]}</li>
				</div>
			`);
		});
	});
});

$tabBox.addEventListener("click", ({ target }) => {
	if(!target.classList.contains("tab")) return false;

	const tabs = [...target.parentNode.children];
	const index = tabs.findIndex(element => element === target);

	tabs.forEach(element => element.classList.remove("active-tab"));
	tabs[index].classList.add("active-tab");

	if(target.getAttribute("name") === "all") {
		return [...$phoneBox.children].forEach(element => element.style.display = "flex");			
	};

	const $phone = [...$phoneBox.children].filter(element => element.dataset.tab === tabs[index].textContent)[0];
	[...$phoneBox.children].forEach(element => element.style.display = "none");

	$phone.style.display = "flex";
});