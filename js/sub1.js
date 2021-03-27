$.get("무형문화재_현황/xml/nihList.xml", data => {
	let current = 1;
	let limit = 8;
	let maxLength = 0;

	const items = [...$(data).find("item")].map(({ children }) => {
		return [...children].reduce((item, { tagName, textContent }) => {
			item[tagName] = textContent;

			return item;
		}, {});
	}).map(async ({ sn, ccbaMnm1, ccbaKdcd, ccbaCtcd, ccbaAsno }) => {
		const path = `무형문화재_현황/xml/detail/${ccbaKdcd}_${ccbaCtcd}_${ccbaAsno}.xml`;
		const imageXml = await $.get(path);
		const image = $(imageXml).find("imageUrl").text();

		return { sn, ccbaMnm1, image }
	});

	const paginationGenerator = () => {
		$("#pagination").empty();

		for(let i = 1; i < maxLength + 1; i++) {
			$("#pagination").append(`<li class="pagination ${current === i ? "active-pagination" : ""}">${i}</li>`);
		}
	};

	setTimeout(() => {
		if(maxLength > 1) {
			$("#pagination").before("<button class='pagination-arrow prev'>&lt;</button>");
			$("#pagination").after("<button class='pagination-arrow next'>&gt;</button>");
		};
	}, 100);

	const render = () => {
		maxLength = Math.ceil(items.length / limit);
		paginationGenerator();

		$("#album").children().hide();

		for(let i = current * limit - limit; i < current * limit; i++) {
			$("#album").children().eq(i).show();
		}
	};

	items.forEach(async item => {
		const { ccbaMnm1, image } = await item.then(data => data);

		$("#album").append(`
			<div class="album">
			<img src="무형문화재_현황/nihcImage/${image}" onerror="this.src='noimage.png'" alt="album-image">
			<li>${ccbaMnm1}</li>
			</div>
		`);

		render();
	});

	$(document)
	.on("click", ".pagination", ({ target }) => {
		current = Number($(target).text());
		render();
	})
	.on("click", ".pagination-arrow", function() {
		const prev = $(this).is(".prev");

		if(prev) current = current - 1 <= 0 ? 1 : current - 1;
		else current = current + 1 > maxLength ? maxLength : current + 1;

		render();
	});
});