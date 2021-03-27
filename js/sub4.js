$.getJSON("restAPI/phone.php", data => {
	if(data.statusCd !== "200") {
		alert(data.statusMsg);

		return location.href = "/";
	};

	const items = [...data.items].reduce(((item, { sn, deptNm, name, telNo }) => {
		item[deptNm] = [...item[deptNm] ?? [], {sn, name, telNo}];

		return item;
	}), {});

	Object.keys(items).forEach(tab => {
		$("#tab-box").append(`<li class="tab">${tab}</li>`);

		$("#phone-box").append(`
			<div class="phone-box" data-tab="${tab}">
				<div class="phone-header">
					<h1>${tab}</h1>
					<hr>
				</div>
				<div class="phone-body">
					${items[tab].map(item => `<div class="phone"><li>${item["name"]}</li><li>${item["telNo"]}</li></div>`)}
				</div>
			</div>
		`);
	});

	$(document).on("click", ".tab", function() {
		$(this).addClass("active-tab").siblings().removeClass("active-tab");

		$(this).text() === "전체" ? $(".phone-box").css({"display": "flex"}) : $(".phone-box").hide();
		$(`.phone-box[data-tab=${$(this).text()}`).css({"display": "flex"});
	});
});