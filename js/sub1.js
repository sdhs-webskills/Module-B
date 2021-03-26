const pagination = {
	currentPage: 1,
	startIndex: 0,
	lastIndex: 8,
	lastPage: 0,
	limit: 8,
};
let renderType = "album";

const url = "xml/nihList.xml";

const result = fetch(url)
.then(res => res.text())
.then(data => new DOMParser().parseFromString(data, "text/xml"))
.then(xmlData => [...xmlData.querySelectorAll("item")].map(({ children }) => {
	return [...children].reduce(((item, { tagName, textContent }) => {
		item[tagName] = textContent;

		return item;
	}), {});
}));

const $album = document.querySelector("#album");
const $pagination = document.querySelector("#pagination");

const render = () => {
	[...$album.children].forEach(album => album.classList.remove("current-album"));

	const { startIndex, lastIndex } = pagination;

	for(let i = startIndex; i < lastIndex; i++)
		$album.children[i]?.classList.add("current-album");

	[...$pagination.children].forEach(pagi => pagi.classList.remove("active-pagination"));
	$pagination.children[pagination.currentPage].classList.add("active-pagination");
};
const paginationGenerator = length => {
	pagination.lastPage = length / pagination.limit;

	const limitDivision = renderType === "album" ? length / 8 : length / 10;
	const limitSplit = limitDivision.toString().split(".");

	let pageLength = limitDivision;

	if(limitDivision.toString().indexOf(".") > 0) pageLength = Number(limitSplit[0]) + 1;

	pagination.lastPage = pageLength;

	for(let i = 1; i < pageLength + 1; i++) {
		if(i === 1) $pagination.insertAdjacentHTML("beforeend", `<li class="pagination active-pagination">${i}</li>`);
		else $pagination.insertAdjacentHTML("beforeend", `<li class="pagination">${i}</li>`);
	}

	if(length > 1) {
		$pagination.insertAdjacentHTML("afterbegin", `<button class="pagination-controller left-controller">&lt;</button>`);
		$pagination.insertAdjacentHTML("beforeend", `<button class="pagination-controller right-controller">&gt;</button>`);
	};
};
const albumRender = () => {
	result.then(items => {
		paginationGenerator(items.length);

		[...items].forEach(async item => {
			const { ccbaMnm1, ccbaKdcd, ccbaCtcd, ccbaAsno } = item;

			const imageUrl = await fetch(`xml/detail/${ccbaKdcd}_${ccbaCtcd}_${ccbaAsno}.xml`)
			.then(res => res.text())
			.then(data => new DOMParser().parseFromString(data, "text/xml"))
			.then(xmlData => xmlData.querySelector("imageUrl").innerHTML);

			$album.insertAdjacentHTML("beforeend", `
				<div class="album">
				<img src="xml/nihcImage/${imageUrl}" alt="">
				<li>${ccbaMnm1}</li>
				</div>
				`);
		});

		const { startIndex, lastIndex } = pagination;

		setTimeout(render, 155);
	});
};
albumRender();

$pagination.addEventListener("click", ({ target }) => {
	if(target.classList.contains("pagination")) {
		pagination.currentPage = target.textContent;

		[...target.parentNode.children].forEach(pagi => pagi.classList.remove("active-pagination"));
		target.classList.add("active-pagination");

		if(target.textContent === "1") {
			pagination.currentPage = 1;
			pagination.startIndex = 0;
			pagination.lastIndex = pagination.limit;

			return render();
		};

		pagination.currentPage = target.textContent;
		pagination.startIndex = pagination.currentPage * pagination.limit - pagination.limit;
		pagination.lastIndex = pagination.currentPage * pagination.limit;

		return render();
	};

	if(target.classList.contains("left-controller")) {
		pagination.currentPage -= 1;

		if(pagination.currentPage === 1) pagination.startIndex = 0;
		else pagination.startIndex = pagination.currentPage * pagination.limit - pagination.limit;

		if(pagination.currentPage <= 0) return pagination.currentPage = 1;

		pagination.lastIndex = pagination.startIndex + pagination.limit;

		return render();
	};

	if(target.classList.contains("right-controller")) {
		pagination.currentPage = Number(pagination.currentPage) + 1;

		if(pagination.currentPage > pagination.lastPage) return pagination.currentPage = pagination.lastPage;

		pagination.startIndex = pagination.lastIndex;
		pagination.lastIndex = pagination.startIndex + pagination.limit;

		return render();
	};
});