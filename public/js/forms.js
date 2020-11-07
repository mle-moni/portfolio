function printImg(input) {
	if (input.files && input.files[0]) {
		const reader = new FileReader();

		reader.onload = function (e) {
			const img = document.getElementById("projectImg");
			if (!img) {
				console.error("no such element: #" + "projectImg");
			}
			img.src = e.target.result;
			img.style.display = "block";
		};
		reader.readAsDataURL(input.files[0]);
	}
}

function updateOsList(context) {
	if (context && !context.checked) {
		$("#osListCheckAll")[0].checked = false;
	}
	if (context && context.checked) {
		let allChecked = true;
		$(".oslist").each((i, element) => {
			if (!element.checked)
				allChecked = false;
		});
		$("#osListCheckAll")[0].checked = allChecked;
	}
	let osListText = "";
	$(".oslist").each((i, element) => {
		if (element.checked) {
			if (i) {
				osListText += " ";
			}
			osListText += $(element).siblings()[0].innerText;
		}
	});
	$("#osListView")[0].value = osListText;
	$("#osListViewHidden")[0].value = osListText;
}
function checkAll(context) {
	if (context.checked) {
		$(".oslist").each((i, element) => {
			element.checked = true;
		});
		updateOsList()
	}
}
function setupCheckboxes() {
	const rawvalue = $("#osListView")[0].value;
	if (rawvalue == "") {
		return ;
	}
	let osArr = rawvalue.split(" ");
	for (let i = 0; i < osArr.length; i++) {
		let element = $(`#osList-${osArr[i]}`)[0];
		if (element) {
			element.checked = true;
		}
	}
	if (osArr.length == $(".oslist").length) {
		$("#osListCheckAll")[0].checked = true;
	}
}

$(document).ready(function() {
	
	// setup text area character counter
	$('textarea#projectContent').characterCounter();
	// setup checkboxes with the values
	setupCheckboxes();
});
