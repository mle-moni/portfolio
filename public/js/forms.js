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